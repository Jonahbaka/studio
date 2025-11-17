
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Brain, Stethoscope, Video, Droplet, Bone, Baby, HeartPulse } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { LocationSearch } from '@/components/shared/location-search';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const specialties = [
    { name: 'General', icon: Stethoscope },
    { name: 'Psychiatry', icon: Brain },
    { name: 'Pediatrics', icon: Baby },
    { name: 'Cardiology', icon: HeartPulse },
    { name: 'Urology', icon: Droplet },
    { name: 'Orthopedics', icon: Bone },
];

const treatments = [
    { name: 'Erectile Dysfunction', imageId: 'treatment3', category: 'Men\'s Health' },
    { name: 'Hair Loss', imageId: 'treatment2', category: 'Wellness' },
    { name: 'Mental Health', imageId: 'treatment4', category: 'Psychiatry' },
    { name: 'Urgent Care', imageId: 'treatment5', category: 'General' },
]

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        
        {/* Hero Section */}
        <section className="relative bg-primary/10">
            <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-8 items-center py-12 md:py-24">
                <div className="text-center lg:text-left">
                    <h1 className="text-4xl md:text-6xl font-headline text-primary">
                        Your home for health
                    </h1>
                    <p className="mt-4 text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto lg:mx-0">
                        Find and book in-person or video consultations with the best doctors and specialists.
                    </p>
                    <div className="mt-8 max-w-xl mx-auto lg:mx-0">
                       <LocationSearch />
                    </div>
                </div>
                 <div className="relative h-80 lg:h-full min-h-[20rem] rounded-lg overflow-hidden shadow-2xl">
                    {heroImage && (
                        <Image src={heroImage.imageUrl} alt={heroImage.description} fill className="object-cover" data-ai-hint={heroImage.imageHint} />
                    )}
                 </div>
            </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-headline text-center mb-10">Consult a Doctor in 3 Easy Steps</h2>
                <div className="grid md:grid-cols-3 gap-8 text-center">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-accent text-accent-foreground mb-4">
                            <span className="text-2xl font-bold">1</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Find a Doctor</h3>
                        <p className="text-muted-foreground">Search by specialty and book a consultation that fits your schedule.</p>
                    </div>
                     <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-accent text-accent-foreground mb-4">
                            <span className="text-2xl font-bold">2</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Start Your Visit</h3>
                        <p className="text-muted-foreground">Connect with your doctor via our secure video platform from anywhere.</p>
                    </div>
                     <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-accent text-accent-foreground mb-4">
                            <span className="text-2xl font-bold">3</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Get a Plan</h3>
                        <p className="text-muted-foreground">Receive a diagnosis, treatment plan, and prescriptions if needed.</p>
                    </div>
                </div>
            </div>
        </section>
        
        {/* Ad Banner for Gold */}
        <section className="py-12 bg-yellow-400/20">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-2xl md:text-3xl font-headline text-yellow-800">Become a Zuma Gold Member</h2>
                <p className="mt-2 text-yellow-700/80 max-w-2xl mx-auto">Get exclusive pricing on meds, unlimited $25 doctor visits, and more for just $99/year.</p>
                <Button asChild size="lg" className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-yellow-900">
                    <Link href="/app/billing">Learn More <ArrowRight className="ml-2" /></Link>
                </Button>
            </div>
        </section>

        {/* Treatments Section */}
        <section className="py-16">
            <div className="container mx-auto px-4">
                 <h2 className="text-3xl font-headline text-center mb-2">Find care for your condition</h2>
                 <p className="text-center text-muted-foreground mb-8 max-w-xl mx-auto">From urgent care to chronic conditions, we've got you covered. Here are some of our popular treatments.</p>
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent>
                         {treatments.map((treatment) => {
                            const image = PlaceHolderImages.find(p => p.id === treatment.imageId);
                            return (
                                <CarouselItem key={treatment.name} className="md:basis-1/2 lg:basis-1/3">
                                    <Link href="#" className="group block h-full">
                                        <Card className="overflow-hidden h-full flex flex-col shadow-lg hover:shadow-2xl transition-shadow duration-300">
                                            {image && (
                                                <div className="h-56 relative">
                                                    <Image src={image.imageUrl} alt={treatment.name} fill className="object-cover" data-ai-hint={image.imageHint} />
                                                </div>
                                            )}
                                            <CardHeader>
                                                <p className="text-sm font-semibold text-primary">{treatment.category}</p>
                                                <CardTitle className="text-xl group-hover:text-primary transition-colors">{treatment.name}</CardTitle>
                                            </CardHeader>
                                             <CardContent className="flex-grow flex items-end">
                                                <p className="text-primary font-semibold group-hover:underline">Learn More <ArrowRight className="inline h-4 w-4 ml-1" /></p>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </CarouselItem>
                            );
                        })}
                    </CarouselContent>
                    <CarouselPrevious className="hidden sm:flex" />
                    <CarouselNext className="hidden sm:flex" />
                </Carousel>
            </div>
        </section>
        
        {/* Specialties Section */}
        <section id="specialties" className="py-16 bg-secondary">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-headline text-center mb-8">All the specialists you need</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-x-4 gap-y-8 text-center">
                    {specialties.map((specialty) => (
                        <Link href="#" key={specialty.name} className="flex flex-col items-center gap-2 group">
                            <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors shadow-md">
                                <specialty.icon className="h-10 w-10 text-primary" />
                            </div>
                            <p className="text-base font-medium text-foreground group-hover:text-primary">{specialty.name}</p>
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

    