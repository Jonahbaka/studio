
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Stethoscope } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { LocationSearch } from '@/components/shared/location-search';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"


const featureCards = [
    {
        title: 'Instant Video Consultation',
        description: 'Connect with a doctor in minutes.',
        image: PlaceHolderImages.find(p => p.id === 'practo-video'),
        href: '/app/book-visit',
    },
    {
        title: 'Find Doctors Near You',
        description: 'Search by specialty and location.',
        image: PlaceHolderImages.find(p => p.id === 'practo-clinic'),
        href: '/search',
    },
    {
        title: 'Zuma Gold Membership',
        description: 'Exclusive benefits and savings.',
        image: PlaceHolderImages.find(p => p.id === 'goodrx-ad-1'),
        href: '/app/billing',
    },
    {
        title: 'Order Medicines',
        description: 'Coming soon to your area.',
        image: PlaceHolderImages.find(p => p.id === 'treatment6'),
        href: '#',
    },
]

const popularTreatments = [
  { name: 'Erectile Dysfunction', href: '#', image: PlaceHolderImages.find(p => p.id === 'treatment3') },
  { name: 'Hair Loss', href: '#', image: PlaceHolderImages.find(p => p.id === 'treatment2') },
  { name: 'Mental Health', href: '#', image: PlaceHolderImages.find(p => p.id === 'treatment4') },
  { name: 'Urgent Care', href: '#', image: PlaceHolderImages.find(p => p.id === 'treatment5') },
  { name: 'Wellness', href: '#', image: PlaceHolderImages.find(p => p.id === 'treatment6') },
];

const specialties = [
    { name: "General Physician" },
    { name: "Pediatrician" },
    { name: "Gynecologist" },
    { name: "Dermatologist" },
    { name: "Psychiatrist" },
    { name: "Stomach & Digestion" },
    { name: "ENT (Ear, Nose, Throat)" },
    { name: "Orthopedist" },
    { name: "Urologist" },
    { name: "Cardiologist" },
    { name: "Dentist" },
    { name: "Ophthalmologist" },
];


export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-teladoc');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        
        {/* Hero Section */}
        <section className="relative text-foreground">
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
            <div className="absolute inset-0 bg-primary/20"></div>
          </div>
          <div className="relative container mx-auto px-4 pt-16 pb-24 md:pt-24 md:pb-32">
            <div className='max-w-3xl'>
                 <h1 className="text-4xl md:text-6xl font-headline text-foreground drop-shadow-md">
                    Your home for health
                </h1>
                <p className="mt-4 text-lg md:text-xl text-foreground/90 max-w-2xl drop-shadow-sm">
                    Find and book from our network of doctors and clinics.
                </p>
            </div>
            <div className="mt-8 max-w-4xl">
              <LocationSearch />
            </div>
          </div>
        </section>

        {/* Feature Cards Section */}
        <section className="py-16 bg-secondary">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featureCards.map((card) => (
                        <Link href={card.href} key={card.title} className="group block">
                           <Card className="overflow-hidden h-full flex flex-col">
                                {card.image && (
                                    <div className="relative h-48">
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
                                    <span className="text-sm font-semibold text-primary mt-4 self-start">
                                        Book Now
                                    </span>
                                </CardContent>
                           </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
        
        {/* Zuma Gold Ad Section */}
        <section className="py-12 bg-background">
            <div className="container mx-auto px-4">
                <Card className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 text-black overflow-hidden">
                   <div className="grid md:grid-cols-2 items-center">
                        <div className="p-8 md:p-12">
                            <h2 className="text-3xl font-headline">Zuma Gold</h2>
                            <p className="mt-2 text-lg">
                                Unlimited doctor consultations starting at just $99/year for your entire family.
                            </p>
                            <ul className="mt-4 space-y-2 text-sm">
                                <li className="flex items-center gap-2"><span>•</span> Free for all doctor consultations</li>
                                <li className="flex items-center gap-2"><span>•</span> Up to 50% off on tests &amp; check-ups</li>
                                <li className="flex items-center gap-2"><span>•</span> Covers up to 6 family members</li>
                            </ul>
                             <Button asChild className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
                                <Link href="/app/billing">Explore Plans <ArrowRight className="ml-2"/></Link>
                            </Button>
                        </div>
                        <div className="relative h-64 md:h-full">
                           <Image 
                            src={PlaceHolderImages.find(p => p.id === 'goodrx-ad-1')?.imageUrl || ''}
                            alt="Zuma Gold Ad"
                            fill
                            className="object-cover"
                            data-ai-hint="gold phone"
                           />
                        </div>
                   </div>
                </Card>
            </div>
        </section>

        {/* Popular Treatments Carousel */}
        <section className="py-16">
            <div className="container mx-auto px-4">
                 <div className="mb-8">
                    <h2 className="text-3xl font-headline text-primary">Book an appointment for an in-clinic consultation</h2>
                    <p className="mt-1 text-muted-foreground">Find experienced doctors across all specialties</p>
                </div>
                 <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                    >
                    <CarouselContent>
                        {popularTreatments.map((treatment, index) => (
                        <CarouselItem key={index} className="md:basis-1/3 lg:basis-1/4">
                            <Link href={treatment.href}>
                               <Card className="overflow-hidden group">
                                     {treatment.image && (
                                        <div className="relative h-40">
                                            <Image
                                                src={treatment.image.imageUrl}
                                                alt={treatment.name}
                                                fill
                                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                data-ai-hint={treatment.image.imageHint}
                                            />
                                        </div>
                                    )}
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold">{treatment.name}</h3>
                                        <p className="text-sm text-primary group-hover:underline">Consult Now</p>
                                    </CardContent>
                               </Card>
                            </Link>
                        </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4" />
                    <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4" />
                </Carousel>
            </div>
        </section>
        
        {/* Specialties Section */}
        <section className="bg-secondary py-20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-headline">Browse by Top Specialties</h2>
                </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {specialties.map((specialty) => (
                        <Link href={`/search?q=${specialty.name}`} key={specialty.name} className="group block">
                            <div className="p-6 bg-background rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-transform duration-300 flex items-center gap-4">
                                <div className="p-2 bg-primary/10 rounded-full">
                                    <Stethoscope className="h-6 w-6 text-primary"/>
                                </div>
                                <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">{specialty.name}</h3>
                            </div>
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
