
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, BookMarked, BriefcaseMedical, ChevronDown, HeartPulse, Hospital, MapPin, PersonStanding, Pill, Search, Stethoscope, User, Droplet, Brain, Bone, Baby } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LocationSearch } from '@/components/shared/location-search';

const specialties = [
    { name: 'Dermatology', icon: User },
    { name: 'Dentist', icon: Stethoscope }, // No tooth icon
    { name: 'Psychiatry', icon: Brain },
    { name: 'Pediatrics', icon: Baby },
    { name: 'Orthopedics', icon: Bone },
    { name: 'Urology', icon: Droplet },
    { name: 'Cardiology', icon: HeartPulse },
    { name: 'ENT', icon: BriefcaseMedical }
];

const popularMeds = [
    "Lisinopril", "Atorvastatin", "Levothyroxine", "Metformin",
    "Amlodipine", "Metoprolol", "Albuterol", "Omeprazole"
]

const healthTopics = [
    { title: "What Is Ozempic Face?", category: "Diabetes", imageId: "goodrx-info-1" },
    { title: "Managing High Blood Pressure", category: "Heart Health", imageId: "goodrx-info-2" },
    { title: "The Best Cold & Flu Remedies", category: "Cold & Flu", imageId: "goodrx-info-1" },
]


export default function Home() {
  const adImage = PlaceHolderImages.find(p => p.id === 'goodrx-ad-1');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        
        {/* Hero Section */}
        <section className="bg-secondary py-12 md:py-20">
            <div className="container mx-auto px-4 text-center">
                <h1 className="text-4xl md:text-6xl font-headline text-primary">
                    Stop paying too much for prescriptions
                </h1>
                <p className="mt-4 text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto">
                    Compare prices, find free coupons, and save up to 80% on your next prescription. It's 100% free to use.
                </p>
                <div className="mt-8 max-w-4xl mx-auto">
                   <LocationSearch />
                </div>
                <div className="mt-6">
                    <p className="text-sm font-medium text-foreground">Popular prescriptions:</p>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                        {popularMeds.map(med => (
                            <Button key={med} variant="link" className="text-foreground/70 hover:text-primary">
                                {med}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </section>

        {/* Ad Section */}
        <section className="py-12">
            <div className="container mx-auto px-4">
                <Link href="#" className="group block">
                     <Card className="overflow-hidden md:flex items-center bg-card shadow-lg hover:shadow-xl transition-shadow">
                        {adImage && (
                             <div className="md:w-1/2 h-64 md:h-auto relative">
                                <Image src={adImage.imageUrl} alt="Advertisement" fill className="object-cover" data-ai-hint={adImage.imageHint} />
                            </div>
                        )}
                        <div className="p-8 md:w-1/2">
                            <h2 className="text-2xl md:text-3xl font-headline text-primary">Save even more with Zuma Gold</h2>
                            <p className="mt-2 text-foreground/80">Get exclusive prices on thousands of prescriptions and pay as little as $2. Plus, get telehealth visits starting at $19.</p>
                             <Button className="mt-4" variant="default" size="lg">
                                Start Your Free Trial <ArrowRight className="ml-2" />
                            </Button>
                        </div>
                    </Card>
                </Link>
            </div>
        </section>

        {/* Health Information Section */}
        <section className="py-12 bg-secondary">
             <div className="container mx-auto px-4">
                <h2 className="text-3xl font-headline text-center mb-8">Get the latest on your health</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {healthTopics.map((topic) => {
                        const topicImage = PlaceHolderImages.find(p => p.id === topic.imageId);
                        return (
                             <Link href="#" key={topic.title} className="group block">
                                <Card className="overflow-hidden h-full flex flex-col">
                                    {topicImage && (
                                        <div className="h-48 relative">
                                            <Image src={topicImage.imageUrl} alt={topic.title} fill className="object-cover" data-ai-hint={topicImage.imageHint} />
                                        </div>
                                    )}
                                    <CardHeader>
                                        <p className="text-sm font-semibold text-primary">{topic.category}</p>
                                        <CardTitle className="text-xl group-hover:text-primary transition-colors">{topic.title}</CardTitle>
                                    </CardHeader>
                                </Card>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </section>


        <section id="specialties" className="py-16">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-headline text-center mb-8">Find a doctor for your problem</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-x-4 gap-y-8 text-center">
                    {specialties.map((specialty) => (
                        <Link href="#" key={specialty.name} className="flex flex-col items-center gap-2 group">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <specialty.icon className="h-8 w-8 text-primary" />
                            </div>
                            <p className="text-sm font-medium text-foreground">{specialty.name}</p>
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
