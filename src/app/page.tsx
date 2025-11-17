
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Bot, Clock, Video, Wallet } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { LocationSearch } from '@/components/shared/location-search';
import { Card } from '@/components/ui/card';


const featureCards = [
    {
        icon: Video,
        title: 'Instant Video Consultation',
        description: 'Connect with a board-certified doctor in minutes, 24/7.',
        href: '/app/book-visit',
        cta: 'Start a Visit'
    },
    {
        icon: Bot,
        title: 'AI Symptom Checker',
        description: 'Get instant insights and guidance on your symptoms from our AI.',
        href: '/app/book-visit',
        cta: 'Try AI Now'
    },
    {
        icon: Wallet,
        title: 'Exclusive Medication Discounts',
        description: 'Save up to 80% on prescriptions with our Gold membership.',
        href: '/app/billing',
        cta: 'Become a Member'
    },
    {
        icon: Clock,
        title: 'On-Demand & Scheduled Care',
        description: 'Enter our virtual waiting room or schedule an appointment.',
        href: '/app/visits',
        cta: 'View Visits'
    }
];


export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-teladoc');

  return (
    <div className="flex flex-col min-h-screen bg-secondary">
      <Header />
      <main className="flex-grow">
        
        {/* Hero Section */}
        <section className="bg-background py-16 md:py-24">
          <div className="relative container mx-auto px-4 text-center">
            <div className='max-w-3xl mx-auto'>
                <h1 className="text-4xl md:text-6xl font-headline text-primary">
                    Instant, intelligent healthcare.
                    On your terms.
                </h1>
                <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                    Find doctors, start an AI consultation, or get prescriptions from the comfort of your home.
                </p>
            </div>
            <div className="mt-8 max-w-4xl mx-auto">
              <LocationSearch />
            </div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {featureCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <Card key={card.title} className="group flex flex-col p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-transform duration-300">
                               <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mx-auto">
                                        <Icon className="h-8 w-8" />
                                    </div>
                                    <h3 className="font-headline text-xl text-foreground mt-4">{card.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1 min-h-[40px]">{card.description}</p>
                               </div>
                                <div className="mt-6 flex-grow flex items-end justify-center">
                                    <Button asChild variant="ghost" className="text-primary hover:text-primary">
                                        <Link href={card.href}>{card.cta} <ArrowRight className="ml-2 h-4 w-4" /></Link>
                                    </Button>
                                </div>
                           </Card>
                        )
                    })}
                </div>
            </div>
        </section>
        
        {/* Zuma Gold Ad Section */}
        <section className="py-12 bg-background">
            <div className="container mx-auto px-4">
                <Card className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 text-black overflow-hidden shadow-lg">
                   <div className="p-8 md:p-12 text-center md:text-left">
                        <h2 className="text-3xl font-headline">Save even more with Zuma Gold</h2>
                        <p className="mt-2 text-lg">
                            Get exclusive prices on virtual care, prescriptions, and more.
                        </p>
                        <ul className="mt-4 space-y-2 text-sm max-w-md mx-auto md:mx-0">
                            <li className="flex items-center gap-2"><span>•</span> 50% off on one treatment purchase</li>
                            <li className="flex items-center gap-2"><span>•</span> Priority support from our team</li>
                            <li className="flex items-center gap-2"><span>•</span> Exclusive access to new treatments</li>
                            <li className="flex items-center gap-2"><span>•</span> Lower-cost prescription renewals</li>
                        </ul>
                         <Button asChild className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
                            <Link href="/app/billing">Explore Zuma Gold <ArrowRight className="ml-2"/></Link>
                        </Button>
                   </div>
                </Card>
            </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
