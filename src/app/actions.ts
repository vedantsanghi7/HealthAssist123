'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const apiKey = process.env.GEMINI_API_KEY;

// Helper to try generation with a specific model
async function tryGenerate(apiKey: string, modelName: string, systemInstruction: string) {
    console.log(`Attempting generation with model: ${modelName}`);
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(systemInstruction);
    const response = await result.response;
    return response.text();
}

export async function analyzeMedicalTextAction(prompt: string, contextWithRecords?: string) {
    if (!apiKey) {
        console.error("Server Action: GEMINI_API_KEY is not set");
        return "AI service unavailable (Server Configuration Error).";
    }

    // Fetch recent medical records for context
    let recordsContext = "";
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
                        } catch {
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // user sessions.
                        }
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // Fetch Profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, age, gender, doctor_name')
                .eq('id', user.id)
                .single();

            if (profile) {
                recordsContext += `\n**Patient Profile:**\n- Name: ${profile.full_name}\n- Age: ${profile.age}\n- Gender: ${profile.gender}\n- Primary Doctor: ${profile.doctor_name || 'Not assigned'}\n`;
            }

            // Fetch Records
            const { data: records } = await supabase
                .from('medical_records')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false })
                .limit(5);

            if (records && records.length > 0) {
                recordsContext += "\n\n**Patient's Recent Medical Records:**\n" + records.map((r: any) => {
                    if (r.record_type === 'lab_test') {
                        return `- [${r.date}] ${r.test_name} (${r.test_category}): ${JSON.stringify(r.test_results)}`;
                    } else {
                        return `- [${r.date}] Prescription by ${r.doctor_name}: ${r.prescription_text}`;
                    }
                }).join('\n');
            }
        }
    } catch (error) {
        console.error("Error fetching records for context:", error);
    }

    // Construct a "Deep Thinking" Medical Analyst System Prompt
    const systemInstruction = `
You are an expert Medical AI Analyst with advanced diagnostic reasoning capabilities. 
Your goal is to provide "Deep Thinking" analysis of health data.

**Context:**
**Context:**
${contextWithRecords || "No previous chat context."}
${recordsContext}

**Instructions:**
1. **Analyze Deeply**: Do not just summarize. Look for patterns, risks, or improvements.
2. **Medical Persona**: Speak like a compassionate but highly technical senior doctor.
3. **Safety First**: Always include a disclaimer. Do not diagnose.
4. **Conciseness**: Be thorough but concise.

**User Query:** "${prompt}"
`;

    const modelsToTry = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-flash-latest"];

    for (const modelName of modelsToTry) {
        try {
            return await tryGenerate(apiKey, modelName, systemInstruction);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.warn(`Failed with model ${modelName}:`, errorMessage);
            // If it's the last model, throw or return error
            if (modelName === modelsToTry[modelsToTry.length - 1]) {
                console.error("All models failed.");
                return `I apologize, but I am unable to access any AI models at the moment. Please check your API Key permissions. (Last error: ${errorMessage})`;
            }
            // Otherwise loop to next model
        }
    }

    return "Unexpected error in AI service.";
}
