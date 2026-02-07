'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/lib/supabase/supabaseClient';
import { useAuth } from '@/context/AuthContext';

export function VitalsChart() {
    const { user } = useAuth();
    const [chartData, setChartData] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('Hemoglobin');
    const [availableMetrics, setAvailableMetrics] = useState<string[]>(['Hemoglobin']);

    useEffect(() => {
        const fetchVitals = async () => {
            if (!user) return;

            const { data: records } = await supabase
                .from('medical_records')
                .select('*')
                .eq('user_id', user.id)
                .eq('record_type', 'lab_test')
                .order('date', { ascending: true }); // Oldest first for chart

            if (records && records.length > 0) {
                const processedData: any[] = [];
                const metrics = new Set<string>();

                records.forEach((r: any) => {
                    if (r.test_results) {
                        const results = typeof r.test_results === 'string' ? JSON.parse(r.test_results) : r.test_results;

                        // Check for specific keys we want to plot
                        // This relies on the keys used in UploadRecordModal/medicalTests.ts
                        const dataPoint: any = { name: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
                        let hasData = false;

                        Object.keys(results).forEach(key => {
                            const val = parseFloat(results[key]);
                            if (!isNaN(val)) {
                                dataPoint[key] = val;
                                metrics.add(key);
                                hasData = true;
                            }
                        });

                        if (hasData) {
                            processedData.push(dataPoint);
                        }
                    }
                });

                if (processedData.length > 0) {
                    setChartData(processedData);
                    setAvailableMetrics(Array.from(metrics));
                    if (metrics.has('Hemoglobin')) setActiveTab('Hemoglobin');
                    else if (metrics.size > 0) setActiveTab(Array.from(metrics)[0]);
                }
            }
        };

        fetchVitals();
    }, [user]);

    if (chartData.length === 0) {
        return (
            <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-semibold text-foreground">Vitals Trend</h3>
                        <p className="text-xs text-muted-foreground">No data available</p>
                    </div>
                </div>
                <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground text-sm">
                    Upload Lab Tests to see your vitals trend here.
                </div>
            </GlassCard>
        );
    }

    return (
        <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-semibold text-foreground">Vitals Trend</h3>
                    <p className="text-xs text-muted-foreground">Historical Data</p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[200px]">
                    <TabsList className="grid w-full grid-cols-1 h-8">
                        {/* Simplified for now to just show the active one or a selector if we had more space */}
                        <TabsTrigger value={activeTab} className="text-xs">{activeTab}</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0F6CBD" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#0F6CBD" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#94a3b8' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#94a3b8' }}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey={activeTab}
                            stroke="#0F6CBD"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorMetric)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </GlassCard>
    );
}
