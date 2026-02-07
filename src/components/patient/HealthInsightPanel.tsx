import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Sparkles, ChevronDown, ChevronUp, Bot, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { analyzeMedicalTextAction } from '@/app/actions';
import { motion, AnimatePresence } from 'framer-motion';
import { createBrowserClient } from '@supabase/ssr';


export function HealthInsightPanel() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [insight, setInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Initialize supabase client for client-side usage
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const generateInsight = async () => {
        setLoading(true);
        // Prompt to analyze the context provided by the Server Action
        const prompt = "Please analyze my recent medical records and health profile. Identify any trends, concerning values, or improvements. Suggest 3 concise lifestyle modifications.";

        // We don't need to fetch records client-side anymore because the Server Action
        // fetches them securely to build the context.
        const contextString = ""; // Let the server handle it

        const result = await analyzeMedicalTextAction(prompt, contextString);
        setInsight(result);
        setLoading(false);
        setIsExpanded(true);
    };

    return (
        <GlassCard className="relative overflow-hidden border-medical-primary/20 bg-gradient-to-br from-white/80 to-blue-50/50">
            {/* AI Glow Effect */}
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-medical-primary/20 blur-xl animate-pulse-slow" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-medical-primary/10 text-medical-primary">
                            <Bot className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold text-foreground">Health Insights</h3>
                    </div>
                    <span className="text-xs font-medium text-medical-primary bg-medical-primary/10 px-2 py-1 rounded-full flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        AI Powered
                    </span>
                </div>

                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="h-2 w-2 mt-2 rounded-full bg-orange-500 shrink-0" />
                        <p className="text-sm text-foreground/80 leading-relaxed">
                            {insight
                                ? "Analysis complete. View the details below."
                                : "Click 'Generate Analysis' to get personalized insights based on your recent medical records."}
                        </p>
                    </div>

                    <AnimatePresence>
                        {isExpanded && insight && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="p-4 rounded-lg bg-white/50 border border-medical-primary/10 text-sm text-muted-foreground prose prose-sm max-w-none">
                                    <p className="whitespace-pre-line">{insight}</p>
                                    <p className="text-xs mt-3 text-slate-400 italic">
                                        Disclaimer: This is AI-generated for informational purposes only. Consult your doctor.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Button
                        onClick={insight ? () => setIsExpanded(!isExpanded) : generateInsight}
                        variant="ghost"
                        className="w-full justify-between hover:bg-medical-primary/5 text-medical-primary group"
                        disabled={loading}
                    >
                        {loading ? 'Analyzing...' : (insight ? (isExpanded ? 'Show Less' : 'View Analysis') : 'Generate Analysis')}
                        {insight && (isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                        {!insight && !loading && <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </Button>
                </div>
            </div>
        </GlassCard>
    );
}
