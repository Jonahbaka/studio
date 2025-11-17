
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, BookMarked, BriefcaseMedical, ChevronDown, HeartPulse, Hospital, MapPin, PersonStanding, Pill, Search, Stethoscope, User } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const specialties = [
    { name: 'General Physician', icon: Stethoscope },
    { name: 'Skin & Hair', icon: User },
    { name: 'Women\'s Health', icon: PersonStanding },
    { name: 'Dental Care', icon: HeartPulse }, // Placeholder, no Tooth icon
    { name: 'Child Specialist', icon: PersonStanding },
    { name: 'Ear, Nose, Throat', icon: BriefcaseMedical },
    { name: 'Mental Wellness', icon: HeartPulse },
    { name: 'Physiotherapy', icon: BriefcaseMedical },
    { name: 'Heart', icon: HeartPulse },
    { name: 'Diabetes', icon: Pill },
    { name: 'Cancer', icon: Hospital },
    { name: 'Book a Test', icon: BookMarked }
];

export default function Home() {
  const clinicAppointmentImage = PlaceHolderImages.find(p => p.id === 'practo-clinic');
  const videoConsultImage = PlaceHolderImages.find(p => p.id === 'practo-video');

  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
        toast({
            variant: 'destructive',
            title: 'Search field is empty',
            description: 'Please enter a doctor\'s name or specialty.',
        });
        return;
    }
     toast({
        title: "Search Submitted (Demo)",
        description: `Searching for "${searchQuery}". This is a demo and does not perform a real search.`,
    });
  }


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow animated-border-swirl p-1">
        <div className="bg-secondary rounded-lg">
        
        {/* Practo-style Header */}
        <div className="bg-primary text-primary-foreground p-4 md:p-6 pb-6 md:pb-12 rounded-b-3xl shadow-lg">
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <Button variant="ghost" size="icon" className="bg-primary/50 hover:bg-primary/80 rounded-full">
                        <User className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        <span className="font-medium">San Jose</span>
                        <ChevronDown className="h-5 w-5" />
                    </div>
                    <div>{/* Spacer */}</div>
                </div>
                <form onSubmit={handleSearch}>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            type="search" 
                            placeholder="Search for clinics, doctors, etc."
                            className="w-full h-14 pl-12 pr-4 rounded-xl bg-card text-foreground text-base"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </form>
            </div>
        </div>

        <div className="container mx-auto px-4 -mt-8 md:-mt-10">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <Link href="/app/book-visit" className="group">
                    <Card className="overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow h-full">
                        <CardContent className="p-4 flex items-center gap-4">
                            {clinicAppointmentImage && (
                                <Image src={clinicAppointmentImage.imageUrl} alt="Book In-Clinic Appointment" width={80} height={80} className="rounded-lg object-cover" data-ai-hint={clinicAppointmentImage.imageHint} />
                            )}
                            <div className="flex-grow">
                                <h3 className="font-bold text-lg">Book In-Clinic Appointment</h3>
                                <p className="text-sm text-muted-foreground">Confirmed appointments</p>
                            </div>
                            <Button variant="ghost" size="icon" className="bg-secondary rounded-full group-hover:translate-x-1 transition-transform">
                                <ArrowRight className="h-5 w-5 text-primary" />
                            </Button>
                        </CardContent>
                    </Card>
                </Link>
                 <Link href="/app/book-visit" className="group">
                    <Card className="overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow h-full">
                        <CardContent className="p-4 flex items-center gap-4">
                            {videoConsultImage && (
                                <Image src={videoConsultImage.imageUrl} alt="Instant Video Consultation" width={80} height={80} className="rounded-lg object-cover" data-ai-hint={videoConsultImage.imageHint}/>
                            )}
                            <div className="flex-grow">
                                <h3 className="font-bold text-lg">Instant Video Consultation</h3>
                                <p className="text-sm text-muted-foreground">Connect in 60 seconds</p>
                            </div>
                            <Button variant="ghost" size="icon" className="bg-secondary rounded-full group-hover:translate-x-1 transition-transform">
                                <ArrowRight className="h-5 w-5 text-primary" />
                            </Button>
                        </CardContent>
                    </Card>
                </Link>
           </div>
        </div>

        <section id="specialties" className="py-8 bg-background">
            <div className="container mx-auto px-4">
                <h2 className="text-2xl font-headline text-center mb-6">Find a Doctor for your Health Problem</h2>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-4 text-center">
                    {specialties.map((specialty) => (
                        <Link href="#" key={specialty.name} className="flex flex-col items-center gap-2 group">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <specialty.icon className="h-8 w-8 text-primary" />
                            </div>
                            <p className="text-sm font-medium text-foreground">{specialty.name}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
        
        <section id="gold" className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <Card className="bg-gradient-to-r from-purple-800 to-indigo-900 text-primary-foreground shadow-xl">
              <CardContent className="p-6 text-center">
                <HeartPulse className="w-12 h-12 mx-auto text-yellow-400 mb-4" />
                <h2 className="text-3xl md:text-4xl font-headline mb-2">Unlock Zuma Gold</h2>
                <p className="text-lg max-w-2xl mx-auto mb-6">
                  Become a Gold member for just $25/month for exclusive access to discounted medications and priority support.
                </p>
                <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
                  <Link href="/signup">Join Gold Today</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
