"use client";
import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, FileText, Check, Plus, Bold, Italic, List, ListOrdered, Link as LinkIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { getFileUrl } from '../services/pocketbase';
import { PbRecord } from '../types';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  label?: string;
  placeholder?: string;
}

export const TagInput: React.FC<TagInputProps> = ({ value = [], onChange, label, placeholder }) => {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (input.trim()) {
        if (!value.includes(input.trim())) {
          onChange([...value, input.trim()]);
        }
        setInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="text-xs font-semibold text-[#a0a0a0] uppercase tracking-widest ml-0.5">{label}</label>}
      <div className="flex flex-wrap gap-2 bg-[#212121] border border-[#333] rounded-lg p-2 focus-within:ring-1 focus-within:ring-white/30 transition-all">
        {Array.isArray(value) && value.map((tag) => (
          <span key={tag} className="bg-[#101010] text-[#e0e0e0] px-2 py-1 rounded text-xs flex items-center gap-1 border border-[#333]">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="hover:text-white transition-colors">
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-transparent outline-none flex-grow min-w-[120px] text-white text-sm placeholder:text-[#666]"
          placeholder={placeholder || "Type and press Enter"}
        />
      </div>
    </div>
  );
};

interface TitleDescArrayInputProps {
  value: { title: string; desc: string }[];
  onChange: (val: { title: string; desc: string }[]) => void;
  label?: string;
}

export const TitleDescArrayInput: React.FC<TitleDescArrayInputProps> = ({ value = [], onChange, label }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  const handleAdd = () => {
    if (title.trim() && desc.trim()) {
      onChange([...(value || []), { title: title.trim(), desc: desc.trim() }]);
      setTitle('');
      setDesc('');
    }
  };

  const handleRemove = (index: number) => {
    const newVal = [...(value || [])];
    newVal.splice(index, 1);
    onChange(newVal);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {label && <label className="text-xs font-semibold text-[#a0a0a0] uppercase tracking-widest ml-0.5">{label}</label>}
      
      {/* List of existing items */}
      <div className="space-y-3">
        {Array.isArray(value) && value.map((item, idx) => (
          <div key={idx} className="flex items-start justify-between bg-[#212121] border border-[#333] p-4 rounded-lg group hover:border-[#555] transition-colors">
             <div className="flex-1 pr-4">
               <div className="font-bold text-sm text-white mb-1">{item.title}</div>
               <div className="text-xs text-[#a0a0a0] leading-relaxed">{item.desc}</div>
             </div>
             <button type="button" onClick={() => handleRemove(idx)} className="text-[#666] hover:text-red-400 transition-colors p-1">
               <X size={16} />
             </button>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="flex flex-col gap-3 bg-[#101010] border border-[#333] border-dashed p-4 rounded-lg">
         <div className="flex flex-col gap-1">
           <label className="text-[10px] uppercase font-bold text-[#666]">New Module Title</label>
           <input 
             className="bg-[#212121] border border-[#333] rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-white/20 outline-none"
             placeholder="e.g., User Authentication"
             value={title}
             onChange={e => setTitle(e.target.value)}
           />
         </div>
         <div className="flex flex-col gap-1">
           <label className="text-[10px] uppercase font-bold text-[#666]">Description</label>
           <textarea 
             className="bg-[#212121] border border-[#333] rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-white/20 outline-none min-h-[60px]"
             placeholder="Briefly explain the module..."
             value={desc}
             onChange={e => setDesc(e.target.value)}
           />
         </div>
         <button 
           type="button" 
           onClick={handleAdd}
           disabled={!title || !desc}
           className="mt-1 flex items-center justify-center gap-2 bg-[#212121] hover:bg-white hover:text-black text-white text-xs font-bold uppercase tracking-wide py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-[#333] hover:border-white"
         >
           <Plus size={14} /> Add Module
         </button>
      </div>
    </div>
  );
};

interface FileUploadProps {
  label: string;
  onChange: (file: File | null) => void;
  existingRecord?: PbRecord;
  fileNameKey?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ label, onChange, existingRecord, fileNameKey }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImage, setIsImage] = useState(false);

  useEffect(() => {
    if (existingRecord && fileNameKey && existingRecord[fileNameKey]) {
      const filename = existingRecord[fileNameKey];
      const url = getFileUrl(existingRecord, filename);
      if (url) {
        setPreview(url);
        // Check extension from filename string in record
        setIsImage(/\.(jpeg|jpg|gif|png|svg|webp)($|\?)/i.test(filename));
      }
    }
  }, [existingRecord, fileNameKey]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onChange(file);
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      setIsImage(file.type.startsWith('image/'));
    } else {
      onChange(null);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-xs font-semibold text-[#a0a0a0] uppercase tracking-widest ml-0.5">{label}</label>
      <div className="flex items-center gap-4 p-4 border border-[#333] rounded-lg bg-[#212121]/50 border-dashed">
        {preview && (
          <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#333] bg-[#212121] group shrink-0 flex items-center justify-center">
            {isImage ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
                <FileText size={24} className="text-[#e0e0e0]" />
            )}
            
             <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                {isImage && <FileText size={20} className="text-white"/>}
             </div>
          </div>
        )}
        <div className="flex-1">
            <label className="inline-flex items-center gap-2 cursor-pointer bg-white hover:bg-[#ccc] text-black px-4 py-2 rounded-lg transition-colors text-sm font-medium">
            <Upload size={16} />
            <span>{selectedFile ? 'Change File' : 'Choose File'}</span>
            <input type="file" className="hidden" onChange={handleFileChange} />
            </label>
            {selectedFile ? (
                <p className="text-xs text-[#a0a0a0] mt-2 font-mono">{selectedFile.name}</p>
            ) : (
                <p className="text-xs text-[#666] mt-2">Documents (PDF, DOCX) or Images (MAX. 5MB)</p>
            )}
        </div>
      </div>
    </div>
  );
};

export const Toggle: React.FC<{ label?: string; checked: boolean; onChange: (checked: boolean) => void }> = ({ label, checked, onChange }) => (
  <button 
    type="button"
    className="flex items-center gap-3 cursor-pointer group focus:outline-none" 
    onClick={() => onChange(!checked)}
  >
    <div className={`relative w-10 h-5 rounded-full transition-colors duration-200 ease-in-out border border-transparent ${checked ? 'bg-white' : 'bg-[#333] group-hover:bg-[#444]'}`}>
      <div className={`absolute top-0.5 left-0.5 bg-black w-3.5 h-3.5 rounded-full shadow-sm transition-transform duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
    {label && <span className={`text-sm font-medium select-none ${checked ? 'text-white' : 'text-[#a0a0a0]'}`}>{label}</span>}
  </button>
);

export const RichText: React.FC<{ value: string; onChange: (val: string) => void; label?: string }> = ({ value, onChange, label }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== value) {
       if (document.activeElement !== contentRef.current) {
         contentRef.current.innerHTML = value || '';
       }
    }
  }, [value]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onChange(e.currentTarget.innerHTML);
  };

  const exec = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    contentRef.current?.focus();
  };

  return (
    <div className="flex flex-col gap-2 w-full">
        {label && <label className="text-xs font-semibold text-[#a0a0a0] uppercase tracking-widest ml-0.5">{label}</label>}
        <div className="bg-[#212121] border border-[#333] rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-white/30 transition-all">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 bg-[#1a1a1a] border-b border-[#333]">
                <button type="button" onClick={() => exec('bold')} title="Bold" className="p-1.5 text-[#a0a0a0] hover:text-white hover:bg-[#333] rounded transition-colors"><Bold size={14}/></button>
                <button type="button" onClick={() => exec('italic')} title="Italic" className="p-1.5 text-[#a0a0a0] hover:text-white hover:bg-[#333] rounded transition-colors"><Italic size={14}/></button>
                <div className="w-px h-4 bg-[#333] mx-1" />
                <button type="button" onClick={() => exec('insertUnorderedList')} title="Bullet List" className="p-1.5 text-[#a0a0a0] hover:text-white hover:bg-[#333] rounded transition-colors"><List size={14}/></button>
                <button type="button" onClick={() => exec('insertOrderedList')} title="Numbered List" className="p-1.5 text-[#a0a0a0] hover:text-white hover:bg-[#333] rounded transition-colors"><ListOrdered size={14}/></button>
                <div className="w-px h-4 bg-[#333] mx-1" />
                <button type="button" onClick={() => {
                    const url = prompt('Enter URL:');
                    if(url) exec('createLink', url);
                }} title="Link" className="p-1.5 text-[#a0a0a0] hover:text-white hover:bg-[#333] rounded transition-colors"><LinkIcon size={14}/></button>
            </div>
            {/* Editor Area */}
            <div 
                ref={contentRef}
                className="p-4 min-h-[150px] outline-none text-sm text-[#e0e0e0] prose prose-invert prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-white [&_a]:underline"
                contentEditable
                onInput={handleInput}
            />
        </div>
    </div>
  );
};

interface IconPickerProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  label?: string;
}

export const IconPicker: React.FC<IconPickerProps> = ({ value, onChange, options, label }) => {
  return (
    <div className="flex flex-col gap-3 w-full">
      {label && <label className="text-xs font-semibold text-[#a0a0a0] uppercase tracking-widest ml-0.5">{label}</label>}
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 p-4 bg-[#212121] border border-[#333] rounded-xl max-h-[200px] overflow-y-auto custom-scrollbar">
        {options.map((iconName) => {
          const Icon = (LucideIcons as any)[iconName] || LucideIcons.HelpCircle;
          const isSelected = value === iconName;
          return (
            <button
              key={iconName}
              type="button"
              onClick={() => onChange(iconName)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all aspect-square group relative ${
                isSelected 
                  ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-110 z-10' 
                  : 'text-[#666] hover:text-white hover:bg-[#333]'
              }`}
              title={iconName}
            >
              <Icon size={20} />
            </button>
          );
        })}
      </div>
      {value && (
         <div className="flex items-center gap-2 px-3 py-2 bg-[#212121] border border-[#333] rounded-lg self-start">
            <span className="text-[10px] text-[#a0a0a0] uppercase font-bold tracking-wider">SELECTED:</span>
            <span className="text-xs text-white font-mono">{value}</span>
         </div>
      )}
    </div>
  );
};