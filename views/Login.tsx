"use client";
import React, { useState } from 'react';
import { pb } from '../services/pocketbase';
import { Button, Input, Card } from '../components/ui';
import { Lock, Mail, ArrowRight, Shield, Heart } from 'lucide-react';

export const Login: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await pb.collection('_superusers').authWithPassword(email, password);
      onSuccess();
    } catch (err) {
      console.error("Login Error:", err);
      setError('Invalid Credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#050505]">
      
      {/* 3D Ambient Light */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-white/[0.01] rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-[380px] relative z-10 animate-fade-in-up">
        
        <div className="text-center mb-10">
          {/* Logo Container - Simplified Single Surface to fix dual-color issue */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0a0a0a] border border-[#222] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)] mb-6 relative group">
             <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
             <Shield size={28} strokeWidth={2} className="text-white relative z-10 drop-shadow-md" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight uppercase drop-shadow-md">Admin Panel</h1>
          <p className="text-[#888] text-xs font-mono tracking-[0.2em] uppercase">Login to Proceed Ahead</p>
        </div>

        <Card className="shadow-2xl bg-[#121212]/80 backdrop-blur-xl border border-[#222]">
          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div className="space-y-5">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666] group-focus-within:text-white transition-colors duration-300 z-10">
                    <Mail size={16} />
                </div>
                <Input 
                  type="email" 
                  placeholder="email@example.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="pl-11 h-12 font-mono text-xs tracking-wider"
                  required
                />
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666] group-focus-within:text-white transition-colors duration-300 z-10">
                    <Lock size={16} />
                </div>
                <Input 
                  type="password" 
                  placeholder="**********" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="pl-11 h-12 font-mono text-xs tracking-wider"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg flex items-center gap-3 text-red-400 text-[10px] uppercase tracking-wider animate-pulse shadow-inner">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 shadow-[0_0_5px_rgba(248,113,113,0.8)]" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-xs flex items-center justify-center gap-2 group" disabled={loading}>
              <span className="relative z-10 flex items-center gap-2">
                 {loading ? 'VERIFYING...' : 'AUTHENTICATE'}
                 {!loading && <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />}
              </span>
            </Button>
          </form>
        </Card>
        
        <div className="mt-12 text-center flex items-center justify-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
            <p className="text-[10px] text-zinc-500 font-mono tracking-[0.2em] uppercase font-medium">
                Powered By Tegota
            </p>
            <Heart size={12} className="text-white fill-white animate-heartbeat" />
        </div>
      </div>
    </div>
  );
};