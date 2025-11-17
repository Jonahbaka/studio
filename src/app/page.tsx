
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, DollarSign, HeartPulse, MessageSquare, Pill, Search, ShieldCheck, Stethoscope } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { LocationSearch } from '@/components/shared/location-search';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const valueProps = [
    {
        icon: DollarSign,
        title: 'Find affordable care',
        description: 'Compare prices for doctors, treatments, and prescriptions.'
    },
    {
        icon: MessageSquare,
        title: 'Talk to a doctor 24/7',
        description: 'Connect with board-certified doctors in minutes, anytime.'
    },
    {
        icon: Pill,
        title: 'Get prescriptions online',
        description: 'Receive a diagnosis and have prescriptions sent to your pharmacy.'
    },
    {
        icon: ShieldCheck,
        title: 'Private and secure',
        description: 'Our platform is HIPAA-compliant to protect your privacy.'
    }
];

const infoCards = [
    { 
        title: 'Cold & Flu', 
        description: 'Get relief from cold and flu symptoms quickly.', 
        href: '#', 
        image: PlaceHolderImages.find(p => p.id === 'goodrx-info-1') 
    },
    { 
        title: 'Blood Pressure', 
        description: 'Learn how to manage your blood pressure.', 
        href: '#', 
        image: PlaceHolderImages.find(p => p.id === 'goodrx-info-2') 
    },
     { 
        title: 'Hair Loss', 
        description: 'Explore treatment options for hair loss.',
        href: '#', 
        image: PlaceHolderImages.find(p => p.id === 'treatment2') 
    },
    { 
        title: 'Mental Health', 
        description: 'Connect with a therapist or psychiatrist.',
        href: '#', 
        image: PlaceHolderImages.find(p => p.id === 'treatment4') 
    },
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
                    Fast, affordable healthcare.
                    Right from your phone.
                </h1>
                <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                    Find doctors, book virtual appointments, and get prescriptions from the comfort of your home.
                </p>
            </div>
            <div className="mt-8 max-w-4xl mx-auto">
              <LocationSearch />
            </div>
          </div>
        </section>

        {/* Value Propositions Section */}
        <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {valueProps.map((prop) => (
                        <div key={prop.title} className="text-center">
                           <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mx-auto">
                                <prop.icon className="h-6 w-6" />
                           </div>
                            <h3 className="font-headline text-xl text-foreground mt-4">{prop.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{prop.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
        
        {/* Zuma Gold Ad Section */}
        <section className="py-12 bg-background">
            <div className="container mx-auto px-4">
                <Card className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 text-black overflow-hidden shadow-lg">
                   <div className="grid md:grid-cols-2 items-center">
                        <div className="p-8 md:p-12">
                            <h2 className="text-3xl font-headline">Save even more with Zuma Gold</h2>
                            <p className="mt-2 text-lg">
                                Get exclusive prices on virtual care, prescriptions, and more.
                            </p>
                            <ul className="mt-4 space-y-2 text-sm">
                                <li className="flex items-center gap-2"><span>•</span> Unlimited doctor consultations starting at $25</li>
                                <li className="flex items-center gap-2"><span>•</span> Up to 50% off on tests &amp; check-ups</li>
                                <li className="flex items-center gap-2"><span>•</span> Covers up to 6 family members</li>
                            </ul>
                             <Button asChild className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
                                <Link href="/app/billing">Explore Zuma Gold <ArrowRight className="ml-2"/></Link>
                            </Button>
                        </div>
                        <div className="relative h-64 md:h-full">
                           {PlaceHolderImages.find(p => p.id === 'goodrx-ad-1')?.imageUrl &&
                             <Image 
                                src={PlaceHolderImages.find(p => p.id === 'goodrx-ad-1')?.imageUrl || ''}
                                alt="Zuma Gold Ad"
                                fill
                                className="object-cover"
                                data-ai-hint="gold phone"
                             />
                           }
                        </div>
                   </div>
                </Card>
            </div>
        </section>

        {/* Informational Cards Section */}
        <section className="py-16">
            <div className="container mx-auto px-4">
                 <div className="mb-8 text-center">
                    <h2 className="text-3xl font-headline text-primary">Stay Informed and Healthy</h2>
                    <p className="mt-1 text-muted-foreground">Explore popular topics and get the care you need.</p>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {infoCards.map((card) => (
                        <Link href={card.href} key={card.title} className="group block">
                           <Card className="overflow-hidden h-full flex flex-col shadow-md hover:shadow-xl transition-shadow">
                                {card.image && (
                                    <div className="relative h-40">
                                        <Image
                                            src={card.image.imageUrl}
                                            alt={card.title}
                                            fill
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                            data-ai-hint={card.image.imageHint}
                                        />
                                    </div>
                                )}
                                <CardContent className="p-4 flex-grow flex flex-col">
                                    <h3 className="font-headline text-lg text-foreground">{card.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1 flex-grow">{card.description}</p>
                                </CardContent>
                           </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
        

      </main>
      <Footer />
    </div>
  );
}
