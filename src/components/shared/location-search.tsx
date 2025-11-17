
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Stethoscope, Beaker, Pill, MapPin, Search, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function LocationSearch() {
  const [activeTab, setActiveTab] = useState('doctors');
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const { toast } = useToast();

  const getPlaceholder = () => {
    switch (activeTab) {
      case 'doctors':
        return 'e.g., Cardiologist, Pediatrician...';
      case 'labs':
        return 'e.g., Blood test, MRI scan...';
      case 'pharmacies':
        return 'e.g., 24-hour pharmacy...';
      default:
        return 'Search...';
    }
  };

  const handleGeoLocation = () => {
    if (!navigator.geolocation) {
      toast({
        variant: 'destructive',
        title: 'Geolocation not supported',
        description: 'Your browser does not support geolocation.',
      });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // In a real app, you would use a reverse geocoding service
        // to get a human-readable address from these coordinates.
        const { latitude, longitude } = position.coords;
        setLocation(`Current Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`);
        setIsLocating(false);
        toast({
          title: 'Location Found',
          description: 'Your current location has been set.',
        });
      },
      (error) => {
        setIsLocating(false);
        toast({
          variant: 'destructive',
          title: 'Unable to retrieve location',
          description: 'Please ensure location services are enabled in your browser and try again.',
        });
        console.error('Geolocation error:', error);
      }
    );
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would trigger a search API call
    // with the searchQuery, location, and activeTab.
     toast({
        title: "Search Submitted (Demo)",
        description: `Searching for "${searchQuery}" in ${activeTab} near "${location || 'your area'}".`,
    });
  }

  return (
    <Card className="w-full bg-background/80 backdrop-blur-sm text-foreground shadow-2xl">
      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-primary/20">
            <TabsTrigger value="doctors"><Stethoscope className="mr-2" />Doctors</TabsTrigger>
            <TabsTrigger value="labs"><Beaker className="mr-2" />Labs</TabsTrigger>
            <TabsTrigger value="pharmacies"><Pill className="mr-2" />Pharmacies</TabsTrigger>
          </TabsList>
          <form onSubmit={handleSearch}>
            <div className="relative mt-4 flex flex-col md:flex-row gap-2">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder={getPlaceholder()}
                        className="w-full pl-10 pr-4 py-3 h-12 text-base"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="relative flex-grow">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Your location"
                        className="w-full pl-10 pr-10 py-3 h-12 text-base"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                    <Button 
                        type="button"
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 text-primary"
                        onClick={handleGeoLocation}
                        disabled={isLocating}
                        aria-label="Use my location"
                    >
                       {isLocating ? <Loader2 className="animate-spin" /> : <MapPin />}
                    </Button>
                </div>
                <Button type="submit" size="lg" className="h-12 text-base px-8">
                    <Search className="mr-2 md:hidden" />
                    <span>Search</span>
                </Button>
            </div>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  );
}
