"use client";
import React, { useEffect, useState } from 'react';
import { pb, getFileUrl } from '../services/pocketbase';
import { CollectionSchema, FieldDefinition, PbRecord } from '../types';
import { Button, Input, TextArea, Card } from '../components/ui';
import { TagInput, FileUpload, Toggle, TitleDescArrayInput, RichText, IconPicker } from '../components/FormFields';
import { Plus, Trash2, ArrowLeft, Loader2, Search, ChevronDown, Calendar, Clock, X as CloseIcon } from 'lucide-react';

interface Props {
  schema: CollectionSchema;
}

const makeId = (prefix: string, suffix: string | number = ''): string => {
  const cleanPrefix = prefix.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanSuffix = String(suffix).replace(/[^a-z0-9]/g, '');
  const combined = cleanPrefix + cleanSuffix;
  if (combined.length >= 15) return combined.slice(0, 15);
  return combined.padEnd(15, '0');
};

const makeListId = (prefix: string, num: number): string => {
  const cleanPrefix = prefix.toLowerCase().replace(/[^a-z0-9]/g, '');
  const numStr = String(num);
  const neededZeros = 15 - cleanPrefix.length - numStr.length;
  if (neededZeros < 0) return (cleanPrefix + numStr).slice(0, 15);
  return cleanPrefix + '0'.repeat(neededZeros) + numStr;
};

export const GenericCollection: React.FC<Props> = ({ schema }) => {
  const [items, setItems] = useState<PbRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewState, setViewState] = useState<'list' | 'edit' | 'create'>('list');
  const [currentItem, setCurrentItem] = useState<PbRecord | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    setViewState('list');
    setItems([]);
    setFormData({});
    setCurrentItem(null);
    setDeleteConfirm(null);
    fetchItems();
  }, [schema.id]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      if (schema.type === 'single') {
        const listResult = await pb.collection(schema.id).getList(1, 1);
        const externalFields = schema.fields.filter(f => f.externalStorage);
        let externalData = {};
        
        if (externalFields.length > 0) {
           const uniqueFetches = new Set(externalFields.map(f => `${f.externalStorage!.collection}|${f.externalStorage!.id}`));
           for (const fetchKey of uniqueFetches) {
              const [col, id] = (fetchKey as string).split('|');
              try {
                  const record = await pb.collection(col).getOne(id);
                  externalData = { ...externalData, ...record };
              } catch (e) { console.warn(e); }
           }
        }

        if (listResult.items.length > 0) {
          const record = listResult.items[0];
          setItems([record as any]);
          handleEdit({ ...externalData, ...record });
        } else {
          setItems([]);
          setViewState('create');
          setFormData({ ...externalData });
        }
        return;
      }
      const records = await pb.collection(schema.id).getFullList({ sort: '-created' });
      setItems(records as any);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setCurrentItem(item);
    const data = { ...item };
    schema.fields.forEach(f => {
       if (f.type === 'tags' && !Array.isArray(data[f.name])) data[f.name] = [];
       if (f.type === 'title-desc-array' && !Array.isArray(data[f.name])) data[f.name] = [];
       if (f.type === 'json' && typeof data[f.name] !== 'string') data[f.name] = JSON.stringify(data[f.name], null, 2);
       if (f.type === 'text-tags') {
          const val = data[f.name];
          if (typeof val === 'string' && val.trim().length > 0) data[f.name] = val.split(',').map(s => s.trim()).filter(Boolean);
          else data[f.name] = [];
       }
    });
    setFormData(data);
    setViewState('edit');
  };

  const handleCreateFixed = (slug: string) => {
    const cleanSlug = slug.replace(/-/g, '');
    const validId = makeId(cleanSlug);
    setFormData({ slug, id: validId });
    setCurrentItem(null);
    setViewState('create');
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    setLoading(true);
    setDeleteConfirm(null);
    try {
      await pb.collection(schema.id).delete(id);
      setItems(prev => prev.filter(i => i.id !== id));
      if (viewState === 'edit' && (currentItem?.id === id || formData?.id === id)) setViewState('list');
      if (schema.type === 'single') window.location.reload(); 
    } catch (err: any) {
      alert(`Failed: ${err.message}`);
      fetchItems();
    } finally {
      setLoading(false);
    }
  };

  const generateNextId = (): string | undefined => {
    if (schema.singletonId) return schema.singletonId;
    if (formData.id) return formData.id;
    if (schema.idPrefix) {
      let max = 0;
      const prefix = schema.idPrefix.toLowerCase();
      items.forEach(i => {
        if (i.id.startsWith(prefix)) {
           const numPart = i.id.replace(prefix, '');
           const num = parseInt(numPart, 10);
           if (!isNaN(num) && num > max) max = num;
        }
      });
      return makeListId(prefix, max + 1);
    }
    return undefined;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const mainData = new FormData();
      const externalUpdates: Record<string, FormData> = {};
      
      if (viewState === 'create') {
        const customId = formData.id || generateNextId();
        if (customId) mainData.append('id', customId);
      }

      for (const field of schema.fields) {
        let targetData = mainData;
        if (field.externalStorage) {
            const key = `${field.externalStorage.collection}|${field.externalStorage.id}`;
            if (!externalUpdates[key]) externalUpdates[key] = new FormData();
            targetData = externalUpdates[key];
        }

        const value = formData[field.name];
        if (field.type === 'file') {
            if (value instanceof File) targetData.append(field.name, value);
            continue;
        }
        if (field.type === 'tags' || field.type === 'title-desc-array') {
           targetData.append(field.name, JSON.stringify(value));
           continue;
        }
        if (field.type === 'text-tags') {
            if (Array.isArray(value)) targetData.append(field.name, value.join(', '));
            else targetData.append(field.name, '');
            continue;
        }
        if (field.type === 'json') {
           try { JSON.parse(value); targetData.append(field.name, value); } 
           catch (err) { if (!value) targetData.append(field.name, '{}'); else throw new Error(`Invalid JSON`); }
           continue;
        }
        if (value !== undefined && value !== null) targetData.append(field.name, value);
      }

      if (viewState === 'create') {
        const record = await pb.collection(schema.id).create(mainData);
        if (schema.type === 'single') {
            setCurrentItem(record as any);
            setViewState('edit');
        } else {
            setItems([record as any, ...items]);
            setViewState('list');
        }
      } else if (currentItem) {
        const record = await pb.collection(schema.id).update(items.length > 0 && schema.type === 'single' ? items[0].id : currentItem.id, mainData);
        if (schema.type === 'single') {
            const externalData = schema.fields.filter(f => f.externalStorage).reduce((acc, f) => ({ ...acc, [f.name]: formData[f.name] }), {});
            setCurrentItem({ ...externalData, ...record } as any);
        } else {
            setItems(items.map(i => i.id === record.id ? (record as any) : i));
            setViewState('list');
        }
      }

      await Promise.all(Object.entries(externalUpdates).map(async ([key, formData]) => {
          const [col, id] = key.split('|');
          try { await pb.collection(col).update(id, formData); } 
          catch (err: any) { if (err.status === 404) { formData.append('id', id); await pb.collection(col).create(formData); } }
      }));
      
    } catch (e: any) {
      alert(`Error saving: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderFieldInput = (field: FieldDefinition) => {
    const val = formData[field.name];
    const isDisabled = field.readOnly; 
    const existingRecord = field.externalStorage ? formData : (currentItem || undefined);

    switch (field.type) {
      case 'textarea': return <TextArea label={field.label} value={val || ''} onChange={e => setFormData({...formData, [field.name]: e.target.value})} required={field.required} disabled={isDisabled} />;
      case 'rich-text': return <RichText label={field.label} value={val || ''} onChange={v => setFormData({...formData, [field.name]: v})} />;
      case 'boolean': return <div className="p-4 bg-[#212121] border border-[#333] rounded-lg"><Toggle label={field.label} checked={!!val} onChange={c => !isDisabled && setFormData({...formData, [field.name]: c})} /></div>;
      case 'file': return isDisabled ? null : <FileUpload label={field.label} existingRecord={existingRecord} fileNameKey={field.name} onChange={f => setFormData({...formData, [field.name]: f})} />;
      case 'tags': return <TagInput label={field.label} value={Array.isArray(val) ? val : []} onChange={tags => setFormData({...formData, [field.name]: tags})} />;
      case 'text-tags': return <TagInput label={field.label} value={Array.isArray(val) ? val : []} onChange={tags => setFormData({...formData, [field.name]: tags})} />;
      case 'title-desc-array': return <TitleDescArrayInput label={field.label} value={Array.isArray(val) ? val : []} onChange={v => setFormData({...formData, [field.name]: v})} />;
      case 'json': return <TextArea label={field.label} value={val || '{}'} onChange={e => setFormData({...formData, [field.name]: e.target.value})} className="font-mono text-sm" disabled={isDisabled} />;
      case 'select':
        if (field.name.toLowerCase().includes('icon')) {
          return <IconPicker label={field.label} value={val || ''} onChange={v => setFormData({...formData, [field.name]: v})} options={field.options || []} />;
        }
        return (
           <div className="flex flex-col gap-2 w-full">
             <label className="text-[10px] font-bold text-[#a0a0a0] uppercase tracking-[0.2em] ml-1">{field.label}</label>
             <div className="relative">
                 <select 
                   className="w-full bg-[#212121] border border-[#333] text-[#e0e0e0] rounded-lg pl-4 pr-10 py-3 text-sm outline-none focus:ring-1 focus:ring-white/30 focus:border-white/40 appearance-none disabled:opacity-50 transition-all hover:bg-[#333]"
                   value={val || ''}
                   onChange={e => setFormData({...formData, [field.name]: e.target.value})}
                   disabled={isDisabled}
                 >
                   <option value="">Select an option...</option>
                   {field.options?.map(opt => (
                     <option key={opt} value={opt}>{opt}</option>
                   ))}
                 </select>
                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] pointer-events-none" size={16} />
             </div>
           </div>
        );
      case 'color':
         return (
             <div className="flex flex-col gap-2 w-full">
                 <label className="text-[10px] font-bold text-[#a0a0a0] uppercase tracking-[0.2em] ml-1">{field.label}</label>
                 <div className="flex items-center gap-3">
                     <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#333] shrink-0 shadow-lg" style={{backgroundColor: val || '#000000'}}>
                         <input 
                            type="color" 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            value={val || '#000000'}
                            onChange={e => setFormData({...formData, [field.name]: e.target.value})}
                            disabled={isDisabled}
                         />
                     </div>
                     <div className="flex-1 max-w-[150px]">
                        <Input 
                            value={val || ''} 
                            onChange={e => setFormData({...formData, [field.name]: e.target.value})}
                            placeholder="#000000"
                            disabled={isDisabled}
                            className="font-mono uppercase text-xs"
                        />
                     </div>
                 </div>
             </div>
         );
      default: return <Input label={field.label} type={field.type} value={val || ''} onChange={e => setFormData({...formData, [field.name]: e.target.value})} required={field.required} disabled={isDisabled} />;
    }
  };

  if (loading && items.length === 0 && viewState === 'list') return <div className="p-20 flex justify-center text-white"><Loader2 className="animate-spin" size={32} /></div>;

  // --- FORM VIEW ---
  if (viewState === 'create' || viewState === 'edit') {
    let currentSection = '';
    const currentId = currentItem?.id || formData?.id;
    const isConfirming = deleteConfirm === currentId;
    const isMessageView = schema.id === 'messages';

    return (
      <div className="max-w-4xl mx-auto pb-10 animate-fade-in-up">
        <div className="flex items-center gap-4 mb-8">
          {schema.type === 'list' && (
            <button onClick={() => setViewState('list')} className="p-2 hover:bg-white/10 rounded-full transition-colors border border-transparent hover:border-[#333] text-[#666] hover:text-white">
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
              <h2 className="text-xl font-bold tracking-tight text-white uppercase flex items-center gap-3">
                  {viewState === 'create' ? `Create ${schema.name}` : `Edit ${schema.name}`}
                  <span className="text-[10px] py-0.5 px-2 rounded-full bg-[#212121] text-white border border-[#333] font-mono tracking-widest">{currentId || 'NEW'}</span>
              </h2>
          </div>
        </div>

        <Card className="border-[#333] shadow-glass bg-[#212121]">
          <form onSubmit={handleSave} className="space-y-8">
            <div className="space-y-10">
              {schema.fields.map(field => {
                // If the field is marked as hidden, do not render it
                if (field.hidden) return null;

                const sectionHeader = field.section && field.section !== currentSection ? (
                   <div key={`section-${field.section}`} className="col-span-full pt-4 pb-2 border-b border-[#333] flex items-center mt-4">
                       <h3 className="text-[10px] font-bold text-[#a0a0a0] uppercase tracking-[0.2em]">{field.section}</h3>
                   </div>
                ) : null;
                // eslint-disable-next-line
                if (field.section) currentSection = field.section;

                return (
                    <React.Fragment key={field.name}>
                        {sectionHeader}
                        <div>{renderFieldInput(field)}</div>
                    </React.Fragment>
                );
              })}
            </div>

            <div className="pt-8 border-t border-[#333] flex justify-between items-center mt-12">
               {viewState === 'edit' && schema.type !== 'single' && currentId && !isMessageView ? (
                 <Button 
                    type="button" variant={isConfirming ? "danger" : "outline"} 
                    onClick={() => { if (isConfirming) handleDelete(currentId); else setDeleteConfirm(currentId); }}
                    className="border-[#333] text-[#666] hover:text-red-400 hover:border-red-500/50"
                 >
                    {isConfirming ? "Click to Confirm" : <><Trash2 size={16} className="mr-2" /> Remove Entry</>}
                 </Button>
               ) : <div />}

               <div className="flex gap-4">
                  {isMessageView ? (
                      <Button type="button" variant="primary" onClick={() => setViewState('list')} className="px-6">
                         Close Message
                      </Button>
                  ) : (
                    <>
                        <Button type="button" variant="ghost" onClick={() => setViewState('list')}>Cancel</Button>
                        {!schema.preventCreate || viewState === 'edit' ? (
                            <Button type="submit" disabled={loading} className="px-8">
                                {loading ? <Loader2 className="animate-spin" /> : "Save Changes"}
                            </Button>
                        ) : null}
                    </>
                  )}
               </div>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  // --- FIXED SLUGS VIEW ---
  if (schema.fixedSlugs) {
    return (
        <div className="space-y-8 animate-fade-in-up">
          <h2 className="text-2xl font-bold tracking-tight text-white uppercase">{schema.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schema.fixedSlugs.map(slug => {
                  const slugId = makeId(slug.replace(/-/g, ''));
                  const existingItem = items.find(i => i.id === slugId || i.slug === slug);
                  return (
                      <Card key={slug} className="group relative overflow-hidden transition-all duration-300 hover:border-[#666] cursor-pointer border-[#333] bg-[#212121]" noPadding>
                          <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          
                          <div className="p-8 relative z-10">
                              <div className="flex justify-between items-start mb-8">
                                  <h3 className="text-lg font-bold text-white capitalize tracking-tight">{slug.replace(/-/g, ' ')}</h3>
                                  {existingItem ? (
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white text-black rounded text-[10px] font-bold uppercase tracking-wider">
                                        Live
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-[#101010] text-[#666] rounded border border-[#333] text-[10px] font-bold uppercase tracking-wider">
                                        Draft
                                    </div>
                                  )}
                              </div>
                              <p className="text-[10px] text-[#a0a0a0] font-mono mb-8 uppercase tracking-wider flex items-center gap-2">
                                <Clock size={12} />
                                {existingItem ? `UPDATED ${new Date(existingItem.updated).toLocaleDateString()}` : 'NOT CREATED'}
                              </p>
                              {existingItem ? (
                                  <Button className="w-full" variant="outline" onClick={() => handleEdit(existingItem)}>Edit Content</Button>
                              ) : (
                                  <Button className="w-full bg-[#101010] hover:bg-white hover:text-black" onClick={() => handleCreateFixed(slug)}>Initialize</Button>
                              )}
                          </div>
                      </Card>
                  );
              })}
          </div>
        </div>
    )
  }

  // --- LIST VIEW (PREMIUM DATA GRID) ---
  const filteredItems = items.filter(item => {
    if (!searchTerm) return true;
    return Object.values(item).some(val => typeof val === 'string' && val.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const isLimitReached = schema.maxItems !== undefined && items.length >= schema.maxItems;
  const canCreate = !schema.preventCreate && !isLimitReached && !(schema.type === 'single' && items.length > 0);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
            <h2 className="text-2xl font-bold tracking-tight text-white uppercase">{schema.name}</h2>
            <div className="flex items-center gap-2 mt-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                 <p className="text-[#a0a0a0] text-xs font-mono tracking-wider">{items.length} RECORDS FOUND</p>
            </div>
        </div>
        
        <div className="flex gap-4">
          <div className="relative group">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666] group-focus-within:text-white transition-colors" size={16} />
             <input 
                type="text" placeholder="SEARCH DATABASE..." 
                className="bg-[#212121] border border-[#333] rounded-lg pl-10 pr-6 py-2.5 text-xs font-mono tracking-wider w-64 focus:border-white/50 outline-none text-white transition-all placeholder:text-[#666] shadow-sm uppercase"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
             />
          </div>
          {canCreate && (
            <Button onClick={() => { setFormData({}); setViewState('create'); }} className="rounded-lg px-6"><Plus size={16} className="mr-2" /> CREATE NEW</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredItems.map((item, index) => {
          const isConfirming = deleteConfirm === item.id;
          const previewVal = item[schema.previewField || schema.fields[0].name] || 'Untitled';
          const timeAgo = new Date(item.created).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

          return (
            <div 
                key={item.id} 
                className="glass-panel rounded-xl overflow-hidden group hover:border-[#666] transition-all duration-300 relative flex flex-col h-full bg-[#212121]"
                style={{ animationDelay: `${index * 50}ms` }}
            >
                {/* Header Bar */}
                <div className="px-6 py-5 border-b border-[#333] flex justify-between items-start bg-[#101010]/30">
                    <div className="flex-1 pr-4">
                        <h3 className="font-bold text-white text-base truncate tracking-tight group-hover:text-[#e0e0e0] transition-colors">{previewVal}</h3>
                        <p className="text-[10px] text-[#666] font-mono mt-1 uppercase tracking-wider flex items-center gap-1">
                           ID: {item.id}
                        </p>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 flex-1 flex flex-col cursor-pointer bg-transparent hover:bg-[#101010]/30 transition-colors" onClick={() => handleEdit(item)}>
                    <div className="flex-1 space-y-4">
                         {schema.fields.slice(0, 3).map(f => {
                             if (f.hidden || f.type === 'file' || f.type === 'textarea' || f.type === 'rich-text' || f.name === schema.previewField) return null;
                             const val = item[f.name];
                             if (!val) return null;
                             return (
                                <div key={f.name} className="flex items-center justify-between text-xs">
                                    <span className="text-[#a0a0a0] uppercase tracking-widest font-bold text-[9px]">{f.label}</span>
                                    <span className="text-[#e0e0e0] font-medium truncate max-w-[150px] text-right bg-[#101010] border border-[#333] px-2 py-0.5 rounded">
                                        {Array.isArray(val) ? `${val.length} Items` : String(val)}
                                    </span>
                                </div>
                             )
                        })}
                    </div>
                    
                    <div className="flex items-center justify-between text-[10px] mt-6 pt-4 border-t border-[#333]">
                         <span className="text-[#666] uppercase tracking-widest font-bold">Recorded</span>
                         <span className="text-[#a0a0a0] font-mono flex items-center gap-1">
                            <Calendar size={10} /> {timeAgo}
                         </span>
                    </div>
                </div>

                {/* Delete Button (Corner) */}
                {schema.type !== 'single' && (
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button 
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isConfirming) handleDelete(item.id);
                                else { setDeleteConfirm(item.id); setTimeout(() => setDeleteConfirm(null), 3000); }
                            }}
                            className={`p-2 rounded-lg transition-all ${isConfirming ? 'bg-white text-black shadow-lg' : 'text-[#666] hover:text-white hover:bg-[#333]'}`}
                        >
                            {isConfirming ? <span className="text-[9px] font-bold px-1 uppercase tracking-wider">CONFIRM</span> : <Trash2 size={16} />}
                        </button>
                    </div>
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
}