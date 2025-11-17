
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Search, Loader2, Pill, Stethoscope, Beaker } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';

const searchTerms = [
    { term: "medication", icon: Pill },
    { term: "treatment", icon: Stethoscope },
    { term: "doctor", icon: Stethoscope },
    { term: "lab", icon: Beaker },
    { term: "pharmacy", icon: Pill },
];

export function LocationSearch() {
    const [currentTermIndex, setCurrentTermIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [location, setLocation] = useState('');
    const [isLocating, setIsLocating] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTermIndex((prevIndex) => (prevIndex + 1) % searchTerms.length);
        }, 3000); // Change text every 3 seconds
        return () => clearInterval(interval);
    }, []);

    const CurrentIcon = searchTerms[currentTermIndex].icon;
    const placeholder = `Search for a ${searchTerms[currentTermIndex].term}...`;

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
                setLocation('Current Location');
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
        toast({
            title: "Search Submitted (Demo)",
            description: `Searching for "${searchQuery || searchTerms[currentTermIndex].term}" near "${location || 'your area'}".`,
        });
    }

    return (
        <Card className="w-full bg-transparent border-none shadow-none">
            <CardContent className="p-0">
                <form onSubmit={handleSearch}>
                    <div className="flex h-14 w-full items-center rounded-lg bg-background shadow-inner border">
                        {/* Search Query Input */}
                        <div className="relative flex h-full flex-grow items-center">
                            <CurrentIcon className="absolute left-4 h-5 w-5 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder={placeholder}
                                className="h-full w-full border-none bg-transparent pl-12 pr-4 text-base focus-visible:ring-0"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <Separator orientation="vertical" className="h-8" />

                        {/* Location Input */}
                        <div className="relative hidden h-full flex-grow items-center md:flex">
                            <MapPin className="absolute left-4 h-5 w-5 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Your location"
                                className="h-full w-full border-none bg-transparent pl-12 pr-10 text-base focus-visible:ring-0"
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

                        {/* Search Button */}
                        <Button type="submit" size="lg" className="m-2 h-10 shrink-0 rounded-md px-6">
                            <Search className="mr-2 h-5 w-5" />
                            <span className="hidden sm:inline">Search</span>
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
