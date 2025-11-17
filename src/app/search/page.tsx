'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { Loader2, MapPin, Stethoscope, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Mock data for search results. In a real app, this would come from an API call.
const mockDoctors = [
  { id: 1, name: 'Dr. Emily Carter', specialty: 'Cardiologist', address: '123 Health St, Wellness City, CA', rating: 4.9, reviews: 145 },
  { id: 2, name: 'Dr. Ben Hanson', specialty: 'Dermatologist', address: '456 Skin Ave, Glow Valley, CA', rating: 4.8, reviews: 210 },
  { id: 3, name: 'Dr. Sarah Jenkins', specialty: 'Pediatrician', address: '789 Child Way, Harmony Town, CA', rating: 5.0, reviews: 302 },
  { id: 4, name: 'Dr. Michael Roe', specialty: 'Orthopedist', address: '101 Bone Blvd, Jointville, NY', rating: 4.7, reviews: 98 },
  { id: 5, name: 'Dr. Aisha Khan', specialty: 'Neurologist', address: '212 Brainy Path, Mindful Metro, NY', rating: 4.9, reviews: 180 },
];

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const location = searchParams.get('location');

  // In a real app, you would use these params to fetch data from an API.
  // We'll just display them and show the mock data.

  if (!query) {
    return (
      <div className="text-center text-muted-foreground">
        <p>Please enter a search term to find a provider.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline">Search Results</h1>
        <p className="text-muted-foreground">
          Showing results for <span className="font-semibold text-primary">{`"${query}"`}</span> near <span className="font-semibold text-primary">{`"${location}"`}</span>
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockDoctors.map(doctor => (
          <Card key={doctor.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{doctor.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4" /> {doctor.specialty}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-1 shrink-0" /> <span>{doctor.address}</span>
              </p>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
                <span className="font-bold">{doctor.rating}</span>
                <span className="text-sm text-muted-foreground">({doctor.reviews} reviews)</span>
              </div>
              <Button asChild>
                <Link href="/app/book-visit">Book Now</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <Suspense fallback={
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        }>
          <SearchResults />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
