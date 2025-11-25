import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const { email, name, role } = await request.json();

        if (!email || !name) {
            return NextResponse.json({ error: 'Email and name are required' }, { status: 400 });
        }

        // Production-ready email sending
        if (process.env.RESEND_API_KEY) {
            const { data, error } = await resend.emails.send({
                from: 'Zuma Health <onboarding@resend.dev>', // Update this with your verified domain
                to: [email],
                subject: 'Welcome to Zuma Health!',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1>Welcome, ${name}!</h1>
                        <p>Thank you for joining Zuma Health as a ${role}. We are excited to have you on board.</p>
                        <p>Get started by logging into your dashboard:</p>
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" style="display: inline-block; background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
                    </div>
                `,
            });

            if (error) {
                console.error('Resend Error:', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json({ success: true, data });
        } else {
            console.warn('RESEND_API_KEY is missing. Logging email instead.');
            console.log(`[MOCK EMAIL] To: ${email}, Subject: Welcome to Zuma Health!`);
            return NextResponse.json({ success: true, mock: true });
        }

    } catch (error: any) {
        console.error('Email API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
