'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { FileText, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RecordCard({ title, date, type }: { title: string, date: string, type: string }) {
    return (
        <GlassCard className="p-4 flex items-center justify-between group">
            <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                    <FileText className="h-5 w-5" />
                </div>
                <div>
                    <h4 className="font-medium text-foreground text-sm">{title}</h4>
                    <p className="text-xs text-muted-foreground">{date} • {type}</p>
                </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Share2 className="h-4 w-4" />
                </Button>
            </div>
        </GlassCard>
    );
}
