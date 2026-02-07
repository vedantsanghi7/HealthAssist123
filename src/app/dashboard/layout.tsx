'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import AuthGuard from '@/components/auth/AuthGuard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            <div className="flex min-h-screen bg-medical-bg">
                <Sidebar />
                <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out">
                    <Header />
                    <main className="flex-1 p-6 overflow-auto">
                        <div className="mx-auto max-w-7xl animate-fade-in">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
}
