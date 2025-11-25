import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        if (!GEMINI_API_KEY) {
            // Mock response if no key provided
            console.warn("No Gemini API Key found. Returning mock image.");
            return NextResponse.json({
                image: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=300&auto=format&fit=crop" // Space/Mars like image
            });
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                instances: [{ prompt: prompt + " high resolution, photorealistic, cinematic lighting, 8k" }],
                parameters: { sampleCount: 1 }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API Error: ${errorText}`);
        }

        const result = await response.json();
        const base64Image = result.predictions?.[0]?.bytesBase64Encoded;

        if (!base64Image) {
            throw new Error("No image generated");
        }

        return NextResponse.json({ image: `data:image/png;base64,${base64Image}` });

    } catch (error: any) {
        console.error("Image Generation Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
