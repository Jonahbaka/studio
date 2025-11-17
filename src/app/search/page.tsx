'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { Loader2, MapPin, Stethoscope, Star, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Mock data for search results.
const mockDoctors = [
  { id: 1, name: 'Dr. Emily Carter', specialty: 'Cardiologist', address: '123 Health St, Wellness City, CA', rating: 4.9, reviews: 145 },
  { id: 2, name: 'Dr. Ben Hanson', specialty: 'Dermatologist', address: '456 Skin Ave, Glow Valley, CA', rating: 4.8, reviews: 210 },
  { id: 3, name: 'Dr. Sarah Jenkins', specialty: 'Pediatrician', address: '789 Child Way, Harmony Town, CA', rating: 5.0, reviews: 302 },
  { id: 4, name: 'Dr. Michael Roe', specialty: 'Orthopedist', address: '101 Bone Blvd, Jointville, NY', rating: 4.7, reviews: 98 },
  { id: 5, name: 'Dr. Aisha Khan', specialty: 'Neurologist', address: '212 Brainy Path, Mindful Metro, NY', rating: 4.9, reviews: 180 },
];

const mockPharmacies = [
    { id: 1, name: 'CVS Pharmacy', address: '123 Main St, Palo Alto, CA', phone: '650-555-1234' },
    { id: 2, name: 'Walgreens', address: '456 University Ave, Palo Alto, CA', phone: '650-555-5678' },
    { id: 3, name: 'Rite Aid', address: '789 El Camino Real, Mountain View, CA', phone: '650-555-9012' },
    { id: 4, name: 'Costco Pharmacy', address: '1000 N Rengstorff Ave, Mountain View, CA', phone: '650-555-3456' },
    { id: 5, name: 'Walmart Pharmacy', address: '600 Showers Dr, Mountain View, CA', phone: '650-555-7890' },
];

const DoctorCard = ({ doctor }: { doctor: typeof mockDoctors[0] }) => (
    <Card className="flex flex-col">
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
);

const PharmacyCard = ({ pharmacy }: { pharmacy: typeof mockPharmacies[0] }) => (
    <Card className="flex flex-col">
        <CardHeader>
            <CardTitle>{pharmacy.name}</CardTitle>
             <CardDescription className="flex items-center gap-2">
                <Building className="h-4 w-4" /> Pharmacy
            </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
             <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-1 shrink-0" /> <span>{pharmacy.address}</span>
            </p>
        </CardContent>
        <CardFooter>
             <Button variant="outline" className="w-full">Set as My Pharmacy</Button>
        </CardFooter>
    </Card>
)


function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q')?.toLowerCase() || '';
  const location = searchParams.get('location');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  const [detectedLocation, setDetectedLocation] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    if (lat && lon) {
      setIsLoadingLocation(true);
      // Using a free, public reverse geocoding API. No API key needed.
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
        .then(response => response.json())
        .then(data => {
          if (data.address) {
            const { city, state, country } = data.address;
            setDetectedLocation([city, state, country].filter(Boolean).join(', '));
          }
        })
        .catch(error => {
          console.error("Error fetching location:", error);
          setDetectedLocation('your area');
        })
        .finally(() => {
          setIsLoadingLocation(false);
        });
    }
  }, [lat, lon]);

  const displayLocation = lat && lon 
    ? (isLoadingLocation ? 'Detecting location...' : detectedLocation) 
    : location;
    
  const isPharmacySearch = ['pharmacy', 'cvs', 'walgreens', 'rite aid', 'medication'].some(term => query.includes(term));

  if (!query) {
    return (
      <div className="text-center text-muted-foreground">
        <p>Please enter a search term to find providers or pharmacies.</p>
      </div>
    );
  }

  const results = isPharmacySearch ? mockPharmacies : mockDoctors;
  const ResultCard = isPharmacySearch ? PharmacyCard : DoctorCard;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline">Search Results</h1>
        <p className="text-muted-foreground">
          Showing results for <span className="font-semibold text-primary">{`"${query}"`}</span> near <span className="font-semibold text-primary">{`"${displayLocation}"`}</span>
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {results.map(item => (
          // @ts-ignore - We know the types match based on isPharmacySearch
          <ResultCard key={item.id} doctor={item} pharmacy={item} />
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
