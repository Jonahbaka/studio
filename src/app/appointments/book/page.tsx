'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar as CalendarIcon, Clock, Video, Star } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { ProviderProfile, UserProfile } from '@/types/schema';

// Mock availability slots
const TIME_SLOTS = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'
];

export default function BookAppointmentPage() {
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();

    const [providers, setProviders] = useState<UserProfile[]>([]);
    const [filteredProviders, setFilteredProviders] = useState<UserProfile[]>([]);
    const [specialtyFilter, setSpecialtyFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProvider, setSelectedProvider] = useState<UserProfile | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [reason, setReason] = useState('');
    const [isBooking, setIsBooking] = useState(false);

    useEffect(() => {
        const fetchProviders = async () => {
            if (!firestore) return;
            const q = query(collection(firestore, 'users'), where('role', 'in', ['doctor', 'nurse', 'provider'])); // Adjust based on actual roles
            const snapshot = await getDocs(q);
            const fetchedProviders = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
            setProviders(fetchedProviders);
            setFilteredProviders(fetchedProviders);
        };
        fetchProviders();
    }, [firestore]);

    useEffect(() => {
        let result = providers;
        if (specialtyFilter !== 'all') {
            result = result.filter(p => p.providerProfile?.specialty === specialtyFilter);
        }
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.displayName.toLowerCase().includes(lowerQuery) ||
                p.providerProfile?.bio?.toLowerCase().includes(lowerQuery)
            );
        }
        setFilteredProviders(result);
    }, [specialtyFilter, searchQuery, providers]);

    const handleBook = async () => {
        if (!user || !firestore || !selectedProvider || !selectedDate || !selectedTime) return;
        setIsBooking(true);

        try {
            // Combine date and time
            const [hours, minutes] = selectedTime.split(':').map(Number);
            const scheduledAt = new Date(selectedDate);
            scheduledAt.setHours(hours, minutes, 0, 0);

            await addDoc(collection(firestore, 'appointments'), {
                patientId: user.uid,
                providerId: selectedProvider.uid,
                status: 'scheduled',
                type: 'video', // Default to video for now
                scheduledAt: scheduledAt,
                durationMinutes: 30,
                reasonForVisit: reason,
                paymentStatus: 'pending', // Would integrate Stripe here
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            toast({ title: "Appointment Requested", description: "Your appointment has been scheduled." });
            setSelectedProvider(null); // Close dialog
            // Redirect to appointments list or confirmation
        } catch (error) {
            console.error("Error booking appointment:", error);
            toast({ variant: "destructive", title: "Booking Failed", description: "Please try again." });
        } finally {
            setIsBooking(false);
        }
    };

    const specialties = Array.from(new Set(providers.map(p => p.providerProfile?.specialty).filter(Boolean)));

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Find a Provider</h1>
                    <p className="text-muted-foreground">Book a video consultation with a specialist.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search name or condition" className="pl-8" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                    <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Specialty" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Specialties</SelectItem>
                            {specialties.map(s => <SelectItem key={s} value={s!}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProviders.map(provider => (
                    <Card key={provider.uid} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={provider.photoURL} />
                                <AvatarFallback>{provider.displayName[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-lg">{provider.displayName}</CardTitle>
                                <CardDescription>{provider.providerProfile?.specialty || 'General Practice'}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-1 mb-2">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                <span className="font-medium">{provider.providerProfile?.rating || 'New'}</span>
                                <span className="text-muted-foreground text-sm">({Math.floor(Math.random() * 50) + 10} reviews)</span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{provider.providerProfile?.bio || 'No bio available.'}</p>
                        </CardContent>
                        <CardFooter>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="w-full" onClick={() => setSelectedProvider(provider)}>Book Appointment</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                        <DialogTitle>Book with {provider.displayName}</DialogTitle>
                                        <DialogDescription>Select a date and time for your video consultation.</DialogDescription>
                                    </DialogHeader>

                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Date</Label>
                                                <Calendar
                                                    mode="single"
                                                    selected={selectedDate}
                                                    onSelect={setSelectedDate}
                                                    className="rounded-md border"
                                                    disabled={(date) => date < new Date()}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Time</Label>
                                                <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto">
                                                    {TIME_SLOTS.map(time => (
                                                        <Button
                                                            key={time}
                                                            variant={selectedTime === time ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => setSelectedTime(time)}
                                                        >
                                                            {time}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Reason for Visit</Label>
                                            <Input placeholder="e.g., Fever, Headache, Follow-up" value={reason} onChange={e => setReason(e.target.value)} />
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setSelectedProvider(null)}>Cancel</Button>
                                        <Button onClick={handleBook} disabled={isBooking || !selectedDate || !selectedTime}>
                                            {isBooking ? 'Booking...' : 'Confirm Booking'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
