"use client";
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { pb } from '../services/pocketbase';
import { Card, Button } from '../components/ui';
import { 
  MessageSquare, 
  Briefcase, 
  Award, 
  BookOpen, 
  Star, 
  FileCheck,
  Activity,
  ArrowUpRight
} from 'lucide-react';

// Grayscale Premium Palette
const COLORS = ['#ffffff', '#e4e4e7', '#a1a1aa', '#71717a', '#52525b', '#3f3f46'];

const StatCard: React.FC<{ stat: any; index: number }> = ({ stat, index }) => {
  return (
    <div 
        className="glass-panel rounded-xl p-6 relative group overflow-hidden transition-all duration-500 hover:border-zinc-600 cursor-default border border-zinc-800 bg-black/40"
        style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10 flex flex-col h-full justify-between gap-6">
         <div className="flex items-center justify-between">
             <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] group-hover:text-white transition-colors">{stat.name}</span>
             <div className="text-zinc-600 group-hover:text-white transition-colors duration-300">
                <stat.icon size={18} strokeWidth={1.5} />
             </div>
         </div>
         
         <div className="flex items-end justify-between">
             <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
             <ArrowUpRight size={16} className="text-zinc-700 group-hover:text-white transition-colors mb-1" />
         </div>
      </div>
    </div>
  );
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any[]>([]);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [projects, messages, skills, certs, edu, achieve] = await Promise.all([
          pb.collection('projects').getList(1, 1),
          pb.collection('messages').getList(1, 5, { sort: '-created' }),
          pb.collection('skills').getList(1, 1),
          pb.collection('certifications').getList(1, 1),
          pb.collection('education').getList(1, 1),
          pb.collection('achievements').getList(1, 1),
        ]);

        setStats([
          { name: 'Projects', value: projects.totalItems, icon: Briefcase },
          { name: 'Skills', value: skills.totalItems, icon: Award },
          { name: 'Education', value: edu.totalItems, icon: BookOpen },
          { name: 'Certs', value: certs.totalItems, icon: FileCheck },
          { name: 'Awards', value: achieve.totalItems, icon: Star },
          { name: 'Inbox', value: messages.totalItems, icon: MessageSquare },
        ]);

        setRecentMessages(messages.items);
      } catch (e) {
        console.error("Error fetching stats", e);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="flex h-full items-center justify-center text-zinc-500 font-mono text-[10px] animate-pulse tracking-[0.3em] uppercase">Loading System Metrics...</div>;

  return (
    <div className="space-y-8 pb-10 animate-fade-in-up">
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, i) => <StatCard key={stat.name} stat={stat} index={i} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2 min-h-[450px] flex flex-col relative overflow-hidden border-zinc-800 bg-black/40">
           {/* Chart Header */}
           <div className="flex items-center justify-between mb-8 relative z-10 px-2">
               <div>
                   <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                       <Activity size={14} className="text-zinc-400" />
                       Content Distribution
                   </h3>
               </div>
           </div>
           
           <div className="flex-1 w-full min-h-[300px] relative z-10 -ml-4">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={stats} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                 <XAxis 
                    dataKey="name" 
                    stroke="transparent" 
                    tick={{fontSize: 10, fill: '#71717a', fontWeight: 600, letterSpacing: '1px'}} 
                    tickLine={false}
                    axisLine={false}
                    dy={15}
                 />
                 <YAxis 
                    stroke="transparent" 
                    allowDecimals={false} 
                    tick={{fontSize: 10, fill: '#52525b'}} 
                    tickLine={false}
                    axisLine={false}
                 />
                 <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    contentStyle={{ 
                        backgroundColor: '#09090b', 
                        borderColor: '#27272a', 
                        color: '#f4f4f5',
                        borderRadius: '4px',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        boxShadow: '0 10px 30px -10px rgba(0,0,0,1)'
                    }}
                    itemStyle={{ color: '#fff' }}
                 />
                 <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={40} animationDuration={1500}>
                    {stats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </Card>

        {/* Recent Activity */}
        <Card className="flex flex-col h-full relative overflow-hidden border-zinc-800 bg-black/40">
          <div className="flex items-center justify-between mb-6 relative z-10 px-2">
             <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                <MessageSquare size={14} className="text-zinc-400" />
                Latest Inbox
             </h3>
             <Button variant="ghost" className="text-[10px] h-6 px-3 uppercase tracking-wider hover:bg-white/10 rounded-full border border-zinc-800">History</Button>
          </div>
          
          <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[400px] relative z-10 pb-4">
            {recentMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-4 min-h-[200px]">
                  <MessageSquare size={24} className="opacity-20" />
                  <p className="text-[10px] uppercase tracking-widest opacity-40">No Messages</p>
              </div>
            ) : (
              recentMessages.map((msg, i) => (
                <div key={msg.id} className="group p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-lg hover:bg-zinc-900 hover:border-zinc-700 transition-all duration-300 cursor-default relative">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-xs text-zinc-300 truncate max-w-[120px] group-hover:text-white transition-colors">{msg.name || 'Anonymous'}</span>
                    <span className="text-[9px] text-zinc-600 font-mono">
                        {new Date(msg.created).toLocaleDateString(undefined, {month: 'numeric', day: 'numeric'})}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-medium mb-1.5 truncate">{msg.subject || 'No Subject'}</p>
                  <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed group-hover:text-zinc-400 transition-colors">{msg.message}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};