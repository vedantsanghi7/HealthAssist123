'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';
import { Stethoscope, Activity, FileText, AlertCircle } from 'lucide-react';


interface TimelineEvent {
    id: string;
    date: string;
    title: string;
    type: 'checkup' | 'lab' | 'vital' | 'diagnosis';
    description: string;
    isAbnormal?: boolean;
}

const mockEvents: TimelineEvent[] = [
    {
        id: '1',
        date: 'Oct 24, 2025',
        title: 'Annual Physical Checkup',
        type: 'checkup',
        description: 'Dr. Sarah Wilson - General checkup. BP slightly elevated.',
        isAbnormal: true,
    },
    {
        id: '2',
        date: 'Oct 20, 2025',
        title: 'Blood Work Results',
        type: 'lab',
        description: 'Comprehensive Metabolic Panel. All values within normal range.',
        isAbnormal: false,
    },
    {
        id: '3',
        date: 'Sep 15, 2025',
        title: 'Flu Vaccination',
        type: 'checkup',
        description: 'Administered at City Health Clinic.',
        isAbnormal: false,
    },
    {
        id: '4',
        date: 'Aug 02, 2025',
        title: 'Migraine Consultation',
        type: 'diagnosis',
        description: 'Prescribed Sumatriptan. Follow up in 3 months.',
        isAbnormal: false,
    },
];

const iconMap = {
    checkup: Stethoscope,
    lab: FileText,
    vital: Activity,
    diagnosis: AlertCircle,
};

const colorMap = {
    checkup: 'bg-blue-100 text-blue-600',
    lab: 'bg-purple-100 text-purple-600',
    vital: 'bg-green-100 text-green-600',
    diagnosis: 'bg-amber-100 text-amber-600',
};

export function Timeline() {
    return (
        <div className="relative pl-8 pt-4 pb-12 space-y-8">
            {/* Vertical Line */}
            <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gradient-to-b from-medical-primary/50 to-transparent" />

            {mockEvents.map((event, index) => {
                const Icon = iconMap[event.type];
                return (
                    <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="relative group"
                    >
                        {/* Dot */}
                        <div className={cn(
                            "absolute -left-[29px] mt-1.5 h-6 w-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10",
                            event.isAbnormal ? "bg-red-500" : "bg-medical-primary"
                        )}>
                            <div className="h-1.5 w-1.5 bg-white rounded-full place-self-center" />
                        </div>

                        {/* Date Float */}
                        <span className="absolute -left-32 top-1 text-xs font-medium text-muted-foreground w-20 text-right hidden sm:block">
                            {event.date}
                        </span>

                        <GlassCard className="p-4 hover:bg-white/80 transition-colors border-l-4 border-l-transparent hover:border-l-medical-primary">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className={cn("p-1.5 rounded-md", colorMap[event.type])}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
                                        {event.type}
                                    </span>
                                    <span className="text-xs text-muted-foreground sm:hidden"> • {event.date}</span>
                                </div>
                                {event.isAbnormal && (
                                    <span className="text-xs font-bold text-red-500 flex items-center gap-1 animate-pulse-slow">
                                        <AlertCircle className="h-3 w-3" />
                                        Attention
                                    </span>
                                )}
                            </div>
                            <h3 className="font-semibold text-foreground text-sm">{event.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {event.description}
                            </p>
                        </GlassCard>
                    </motion.div>
                );
            })}
        </div>
    );
}
