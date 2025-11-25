import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        if (!GEMINI_API_KEY) {
            // Mock response
            return NextResponse.json({
                text: "## Mock Response\n\n**Gemini API Key missing.**\n\nPlease configure your API key to get real responses.\n\nHere is a sample agenda:\n- **10:00 AM**: Introduction\n- **10:15 AM**: Review Metrics\n- **10:30 AM**: Next Steps"
            });
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                systemInstruction: { parts: [{ text: "You are a helpful and professional meeting assistant. Keep responses concise, formatted with Markdown, and ready to use in a professional context." }] }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API Error: ${errorText}`);
        }

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

        return NextResponse.json({ text });

    } catch (error: any) {
        console.error("Copilot Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
