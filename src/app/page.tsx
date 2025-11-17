
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Video, UserMd, FlaskConical, HeartPulse, CheckCircle, Brain, Meh, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { LocationSearch } from '@/components/shared/location-search';

const treatments = [
    { name: 'Cold & Flu', icon: Meh },
    { name: 'Mental Health', icon: Brain },
    { name: 'Skin Problems', icon: UserMd },
    { name: 'Urgent Care', icon: HeartPulse },
    { name: 'Lab Tests', icon: FlaskConical },
    { name: 'Prescription Refills', icon: UserMd },
];

const howItWorks = [
    {
        step: 1,
        title: 'Talk to a doctor anytime',
        description: 'Tell us how you’re feeling and what you need. A board-certified doctor will review and get back to you in minutes.',
        imageHint: 'doctor using computer'
    },
    {
        step: 2,
        title: 'Get a treatment plan',
        description: 'Our doctors can provide a diagnosis, prescriptions, lab tests, and more, all from the comfort of your home.',
        imageHint: 'patient on video call'
    },
    {
        step: 3,
        title: 'Feel better sooner',
        description: 'Pick up your prescription from your local pharmacy or have it delivered. Follow your plan and get well.',
        imageHint: 'person smiling happy'
    }
];

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-teladoc');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        
        {/* Hero Section */}
        <section className="relative text-white">
          <div className="absolute inset-0">
            {heroImage && (
                 <Image 
                    src={heroImage.imageUrl} 
                    alt={heroImage.description} 
                    fill 
                    className="object-cover" 
                    data-ai-hint={heroImage.imageHint}
                />
            )}
            <div className="absolute inset-0 bg-primary/70"></div>
          </div>
          <div className="relative container mx-auto px-4 text-center py-20 md:py-32">
            <h1 className="text-4xl md:text-6xl font-headline text-white drop-shadow-md">
                Quality healthcare when you need it most
            </h1>
            <p className="mt-4 text-lg md:text-xl text-white/90 max-w-3xl mx-auto drop-shadow-sm">
                Connect with board-certified doctors 24/7 for diagnosis and treatment from the comfort of your home.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg">
                <Link href="/signup">
                    Get Started
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* What We Treat Section */}
        <section className="py-16 bg-secondary">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-headline text-primary">What we treat</h2>
                    <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">From everyday illnesses to ongoing care, we're here for you.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
                    {treatments.map((treatment) => (
                         <Link href="#" key={treatment.name} className="group block">
                            <div className="p-6 bg-background rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-transform duration-300">
                                <treatment.icon className="h-10 w-10 text-accent mx-auto" />
                                <h3 className="mt-4 font-semibold text-base text-foreground group-hover:text-primary transition-colors">{treatment.name}</h3>
                            </div>
                        </Link>
                    ))}
                </div>
                <div className="text-center mt-12">
                     <Button variant="outline" asChild>
                        <Link href="#">See all conditions <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </div>
            </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20">
            <div className="container mx-auto px-4">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl font-headline text-primary">Healthcare at your fingertips</h2>
                    <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">Get care in three simple steps.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8 md:gap-12 text-center">
                    {howItWorks.map((item) => (
                        <div key={item.step} className="flex flex-col items-center">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground font-bold text-xl mb-4 shadow-md">
                                {item.step}
                            </div>
                            <h3 className="text-xl font-headline mb-2">{item.title}</h3>
                            <p className="text-muted-foreground">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
        
        {/* Why Choose Us Section */}
        <section className="bg-primary text-primary-foreground py-20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-headline">The ZumaiDoc Difference</h2>
                </div>
                 <div className="grid md:grid-cols-3 gap-8 text-center">
                    <div className="flex flex-col items-center">
                        <CheckCircle className="h-10 w-10 text-accent mb-4" />
                        <h3 className="text-xl font-semibold">24/7 Access</h3>
                        <p className="mt-1 text-primary-foreground/80">Connect with doctors on your schedule, day or night.</p>
                    </div>
                     <div className="flex flex-col items-center">
                        <CheckCircle className="h-10 w-10 text-accent mb-4" />
                        <h3 className="text-xl font-semibold">Top Clinicians</h3>
                        <p className="mt-1 text-primary-foreground/80">Our providers are board-certified and expert-trained.</p>
                    </div>
                     <div className="flex flex-col items-center">
                        <CheckCircle className="h-10 w-10 text-accent mb-4" />
                        <h3 className="text-xl font-semibold">Private & Secure</h3>
                        <p className="mt-1 text-primary-foreground/80">Your health information is always safe and confidential.</p>
                    </div>
                </div>
            </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
