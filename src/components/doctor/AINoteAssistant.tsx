'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Bot, Sparkles, Copy, FileText } from 'lucide-react';
import { analyzeMedicalText } from '@/lib/ai/gemini';

export function AINoteAssistant() {
    const [notes, setNotes] = useState('');
    const [structuredOutput, setStructuredOutput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleStructureNotes = async () => {
        if (!notes.trim()) return;
        setLoading(true);

        const prompt = `Structure the following doctor's rough notes into a formal SOAP format (Subjective, Objective, Assessment, Plan). Keep it professional and concise.\n\nNotes: ${notes}`;

        const result = await analyzeMedicalText(prompt);
        setStructuredOutput(result);
        setLoading(false);
    };

    return (
        <div className="h-full flex flex-col space-y-4">
            <GlassCard className="flex-1 flex flex-col p-4 bg-white/70">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Quick Notes
                    </h3>
                    <Button
                        size="sm"
                        className="bg-medical-primary/10 text-medical-primary hover:bg-medical-primary/20"
                        onClick={handleStructureNotes}
                        disabled={loading || !notes}
                    >
                        {loading ? 'Processing...' : (
                            <>
                                <Sparkles className="h-3 w-3 mr-1" />
                                AI Structure
                            </>
                        )}
                    </Button>
                </div>
                <textarea
                    className="flex-1 w-full bg-white/50 border border-gray-200 rounded-lg p-3 resize-none focus:ring-2 focus:ring-medical-primary/20 focus:outline-none transition-all text-sm"
                    placeholder="Type rough patient notes here... e.g. 'Patient complains of headache since 2 days, BP 140/90, prescribed Aspirin'"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
            </GlassCard>

            {structuredOutput && (
                <GlassCard className="flex-1 flex flex-col p-4 bg-gradient-to-br from-blue-50 to-white border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-medical-primary flex items-center gap-2">
                            <Bot className="h-4 w-4" />
                            AI Suggestion
                        </h3>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Copy className="h-3 w-3" />
                        </Button>
                    </div>
                    <div className="flex-1 overflow-auto text-sm text-slate-600 whitespace-pre-wrap font-mono bg-white/50 p-2 rounded border border-blue-50">
                        {structuredOutput}
                    </div>
                </GlassCard>
            )}
        </div>
    );
}
