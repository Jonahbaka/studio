
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AppwriteProvider } from '@/appwrite/provider';

export const metadata: Metadata = {
  title: 'ZumaTeledocAI',
  description: 'A HIPAA Compliant Telehealth Platform with AI-Powered Tools',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body bg-background text-foreground antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <AppwriteProvider>
          {children}
        </AppwriteProvider>
        <Toaster />
      </body>
    </html>
  );
}
