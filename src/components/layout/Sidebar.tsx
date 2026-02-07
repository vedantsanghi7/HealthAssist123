'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useRole } from '@/hooks/useRole';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard,
    FileText,
    Activity,
    Calendar,
    Settings,
    LogOut,
    Shield,
    Users,
    MessageSquare,
    ClipboardList
} from 'lucide-react';

const PATIENT_MENU = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/patient' },
    { label: 'Medical Records', icon: FileText, href: '/dashboard/patient/records' },
    { label: 'Timeline', icon: Activity, href: '/dashboard/patient/timeline' },
    { label: 'Find Doctors', icon: Users, href: '/dashboard/patient/doctors' },
    { label: 'Appointments', icon: Calendar, href: '/dashboard/patient/appointments' },
    { label: 'AI Assistant', icon: MessageSquare, href: '/dashboard/patient/ai-chat' },
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

const DOCTOR_MENU = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/doctor' },
    { label: 'My Patients', icon: Users, href: '/dashboard/doctor/patients' },
    { label: 'Consultations', icon: ClipboardList, href: '/dashboard/doctor/consultations' },
    { label: 'Messages', icon: MessageSquare, href: '/dashboard/doctor/messages' },
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

export function Sidebar() {
    const pathname = usePathname();
    const { role } = useRole();
    const { signOut, roles, switchRole } = useAuth();

    const menuItems = role === 'doctor' ? DOCTOR_MENU : PATIENT_MENU;

    return (
        <aside className="hidden h-screen w-64 flex-col border-r bg-medical-bg/50 backdrop-blur-md md:flex sticky top-0 left-0">
            <div className="flex h-16 items-center px-6 border-b border-border/10 justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-medical-primary flex items-center justify-center">
                        <Shield className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-medical-primary hidden md:block">HealthAssist</span>
                </div>
                {/* Role Badge / Switcher */}
                <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{role} View</span>
                    {roles && roles.length > 1 && (
                        <button
                            onClick={() => switchRole(role === 'patient' ? 'doctor' : 'patient')}
                            className="text-[10px] text-blue-500 hover:underline"
                        >
                            Switch to {role === 'patient' ? 'Doctor' : 'Patient'}
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-auto py-6 px-4">
                <nav className="grid gap-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-medical-primary/10 text-medical-primary shadow-sm"
                                        : "text-muted-foreground hover:bg-white/50 hover:text-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-border/10">
                <button
                    onClick={async () => {
                        await signOut();
                        window.location.href = '/login';
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
