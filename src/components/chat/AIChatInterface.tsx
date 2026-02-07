'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { analyzeMedicalTextAction } from '@/app/actions';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export function AIChatInterface() {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! I am your AI Health Assistant. How can I help you today with your health or medical questions?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            // Include recent history as context for follow-up capability
            const historyContext = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
            const response = await analyzeMedicalTextAction(userMessage, historyContext);

            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error processing your request. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-xl shadow-sm border border-border/50 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border/10 bg-gradient-to-r from-medical-primary/5 to-transparent flex items-center gap-3">
                <div className="bg-medical-primary/10 p-2 rounded-lg">
                    <Bot className="h-5 w-5 text-medical-primary" />
                </div>
                <div>
                    <h2 className="font-semibold text-gray-800">AI Health Assistant</h2>
                    <p className="text-xs text-muted-foreground">Powered by Gemini Medical AI</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={cn(
                            "flex w-full mb-4",
                            message.role === 'user' ? "justify-end" : "justify-start"
                        )}
                    >
                        <div className={cn(
                            "flex max-w-[80%] gap-3",
                            message.role === 'user' ? "flex-row-reverse" : "flex-row"
                        )}>
                            <div className={cn(
                                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border shadow-sm",
                                message.role === 'user' ? "bg-medical-primary text-white border-medical-primary" : "bg-white text-medical-primary border-border"
                            )}>
                                {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </div>

                            <div className={cn(
                                "p-3 rounded-2xl shadow-sm text-sm leading-relaxed overflow-hidden",
                                message.role === 'user'
                                    ? "bg-medical-primary text-white rounded-tr-sm"
                                    : "bg-white text-gray-800 border border-border/50 rounded-tl-sm prose prose-sm max-w-none"
                            )}>
                                {message.role === 'user' ? (
                                    <p className="whitespace-pre-wrap">{message.content}</p>
                                ) : (
                                    <div className="markdown-content">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                ul: ({ node, ...props }) => <ul className="list-disc pl-4 my-2 space-y-1" {...props} />,
                                                ol: ({ node, ...props }) => <ol className="list-decimal pl-4 my-2 space-y-1" {...props} />,
                                                li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                                p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                strong: ({ node, ...props }) => <strong className="font-semibold text-medical-primary/90" {...props} />,
                                                h1: ({ node, ...props }) => <h1 className="text-lg font-bold mb-2 mt-4 text-gray-900 border-b pb-1" {...props} />,
                                                h2: ({ node, ...props }) => <h2 className="text-base font-bold mb-2 mt-3 text-gray-800" {...props} />,
                                                h3: ({ node, ...props }) => <h3 className="text-sm font-bold mb-1 mt-2 text-gray-700" {...props} />,
                                                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-medical-primary/30 pl-4 py-1 my-2 bg-gray-50 italic text-gray-600 rounded-r" {...props} />,
                                                code: ({ node, ...props }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono text-pink-600" {...props} />,
                                            }}
                                        >
                                            {message.content}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start w-full mb-4">
                        <div className="flex max-w-[80%] gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white text-medical-primary border border-border flex items-center justify-center shadow-sm">
                                <Bot size={16} />
                            </div>
                            <div className="bg-white border border-border/50 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-medical-primary" />
                                <span className="text-sm text-gray-500">Thinking...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-border/10">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your symptoms, medications, or health reports..."
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary transition-all text-sm"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-medical-primary text-white p-2.5 rounded-xl hover:bg-medical-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
