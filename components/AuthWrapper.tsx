"use client";

import React, { useState, useEffect } from 'react';
import { Login } from '../views/Login';
import { Layout } from './Layout';
import { pb } from '../services/pocketbase';
import { Loader2 } from 'lucide-react';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
        try {
            if (pb.authStore.isValid) {
                await pb.collection('_superusers').authRefresh();
            }
        } catch (e) {
            console.error("Auth session expired or invalid", e);
            pb.authStore.clear();
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
        <div className="h-screen w-screen bg-slate-950 flex items-center justify-center text-primary">
            <Loader2 className="animate-spin" size={48} />
        </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onSuccess={() => setIsAuthenticated(true)} />;
  }

  return <Layout>{children}</Layout>;
}
