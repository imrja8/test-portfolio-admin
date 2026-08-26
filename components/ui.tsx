"use client";
import React from 'react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' }> = ({ 
  className = '', 
  variant = 'primary', 
  children, 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] active:shadow-none";
  
  const variants = {
    // Primary: 3D White/Metallic Button
    primary: "bg-gradient-to-b from-[#ffffff] to-[#d4d4d8] text-black border-none shadow-[0_2px_10px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,1),0_4px_4px_rgba(0,0,0,0.3)] hover:brightness-110", 
    
    // Secondary: 3D Dark Button
    secondary: "bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] text-[#e0e0e0] border border-[#333] shadow-[0_2px_5px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] hover:bg-[#333] hover:border-[#444]",
    
    // Outline: Glassy
    outline: "bg-transparent border border-[#333] text-[#a0a0a0] hover:text-white hover:border-white/20 hover:bg-[#212121] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.2)]",
    
    // Ghost
    ghost: "bg-transparent text-[#666] hover:text-white hover:bg-[#212121] shadow-none",
    
    // Danger
    danger: "bg-transparent text-red-400 border border-[#333] hover:border-red-500/50 hover:text-red-300 hover:bg-red-900/10 shadow-none"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="flex flex-col gap-2 w-full">
    {label && <label className="text-[10px] font-bold text-[#888] uppercase tracking-[0.2em] ml-1 shadow-[0_1px_0_rgba(0,0,0,1)]">{label}</label>}
    <input 
      className={`
        bg-[#151515] 
        text-white
        border border-[#2a2a2a] 
        border-b-[#333]
        rounded-lg 
        px-4 py-3 
        text-sm 
        outline-none 
        transition-all 
        placeholder:text-[#555] 
        shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] 
        focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.1)] 
        focus:bg-[#121212] 
        focus:border-[#444]
        ${className}
      `}
      {...props}
    />
  </div>
);

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="flex flex-col gap-2 w-full">
    {label && <label className="text-[10px] font-bold text-[#888] uppercase tracking-[0.2em] ml-1">{label}</label>}
    <textarea 
      className={`
        bg-[#151515] 
        text-white
        border border-[#2a2a2a] 
        border-b-[#333]
        rounded-lg 
        px-4 py-3 
        text-sm 
        outline-none 
        transition-all 
        placeholder:text-[#555] 
        shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] 
        focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.1)] 
        focus:bg-[#121212] 
        focus:border-[#444]
        min-h-[120px] 
        resize-y
        ${className}
      `}
      {...props}
    />
  </div>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string; noPadding?: boolean }> = ({ children, className = '', noPadding = false }) => (
  <div className={`glass-panel rounded-xl ${noPadding ? '' : 'p-6'} ${className}`}>
    {children}
  </div>
);