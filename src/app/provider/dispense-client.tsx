
'use client';

import { dispensePrescription } from '@/ai/flows/dispense-prescription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, MapPin, Search } from 'lucide-react';
import React, { useState, useTransition } from 'react';

// Mock data, in a real app this would come from Firestore/API
const mockPatients = [
    { uid: 'patient1', name: 'John Doe (USA)', country: 'US', dosespotPatientId: 'dsp123' },
];

const mockPharmaciesUS = [
    { id: 'uspharm1', name: 'CVS Pharmacy', street: '123 Main St', city: 'Palo Alto', state: 'CA', npi: '1497989345' },
    { id: 'uspharm2', name: 'Walgreens', street: '456 University Ave', city: 'Palo Alto', state: 'CA', npi: '1255566112' },
    { id: 'uspharm3', name: 'Rite Aid', street: '789 El Camino Real', city: 'Mountain View', state: 'CA', npi: '1881828734' },
    { id: 'uspharm4', name: 'Costco Pharmacy', street: '1000 N Rengstorff Ave', city: 'Mountain View', state: 'CA', npi: '1992939845' },
    { id: 'uspharm5', name: 'Walmart Pharmacy', street: '600 Showers Dr', city: 'Mountain View', state: 'CA', npi: '1023242978' },
    { id: 'uspharm6', name: 'Kaiser Permanente Pharmacy', street: '555 Castro St', city: 'Mountain View', state: 'CA', npi: '1023048592' },
];

type Pharmacy = (typeof mockPharmaciesUS)[0];
type PharmacyWithDistance = Pharmacy & { distance: number };


export default function DispenseClient() {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    
    const [patientUid, setPatientUid] = useState('');
    const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
    const [ndc, setNdc] = useState('0069-4210-30'); // Viagra
    const [sig, setSig] = useState('Take 1 tablet by mouth 30 minutes before activity');
    const [quantity, setQuantity] = useState('10');
    const [daysSupply, setDaysSupply] = useState('30');
    
    const [userAddress, setUserAddress] = useState('Palo Alto, CA');
    const [nearbyPharmacies, setNearbyPharmacies] = useState<PharmacyWithDistance[]>([]);
    const [isSearchingPharmacies, setIsSearchingPharmacies] = useState(false);
    
    const selectedPatient = mockPatients.find(p => p.uid === patientUid);
    
    const handleFindPharmacies = (useGeo = false) => {
        setIsSearchingPharmacies(true);
        setNearbyPharmacies([]);
        setSelectedPharmacy(null);

        // --- SIMULATION of Geocoding & Distance Calculation ---
        // In a real app, you would use a service like Google Maps Geocoding API
        // to turn `userAddress` into coordinates, then use the Haversine formula
        // or a distance matrix API to calculate real distances.
        
        console.log(`Searching for pharmacies near: ${useGeo ? 'current device location' : userAddress}`);

        setTimeout(() => {
            const pharmaciesToSearch = mockPharmaciesUS;
            
            const pharmaciesWithDistance = pharmaciesToSearch.map(p => ({
                ...p,
                // Simulate distance calculation
                distance: parseFloat((Math.random() * 10 + 0.5).toFixed(1))
            })).sort((a, b) => a.distance - b.distance);

            setNearbyPharmacies(pharmaciesWithDistance);
            setIsSearchingPharmacies(false);
            toast({ title: "Pharmacies Found", description: `Showing ${pharmaciesWithDistance.length} pharmacies near ${userAddress}`});
        }, 1500); // Simulate network delay
    };

    const handleDispense = () => {
        if (!patientUid || !selectedPharmacy) {
            toast({ variant: 'destructive', title: 'Please select a patient and a pharmacy.' });
            return;
        }

        startTransition(async () => {
            const result = await dispensePrescription({
                visitId: `visit_${Date.now()}`,
                patientUid,
                ndc,
                sig,
                quantity: parseInt(quantity),
                daysSupply: parseInt(daysSupply),
                pharmacy: { 
                    id: selectedPharmacy.id, 
                    npi: 'npi' in selectedPharmacy ? selectedPharmacy.npi : undefined 
                },
            });
            
            if (result.status?.startsWith('sent')) {
                toast({
                    title: 'Prescription Sent!',
                    description: `Status: ${result.status}. Method: ${result.method}`,
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Dispense Failed",
                    description: "Could not send the prescription. Please check the details and try again.",
                });
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Send className="text-accent" />
                        eDispense
                    </div>
                </CardTitle>
                <CardDescription>Send prescriptions to US pharmacies via DoseSpot.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="patient">Patient</Label>
                    <Select onValueChange={(uid) => {
                        setPatientUid(uid);
                        setSelectedPharmacy(null);
                        setNearbyPharmacies([]);
                    }} value={patientUid}>
                        <SelectTrigger id="patient">
                            <SelectValue placeholder="Select a patient..." />
                        </SelectTrigger>
                        <SelectContent>
                            {mockPatients.map(p => (
                                <SelectItem key={p.uid} value={p.uid}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {patientUid && (
                    <div className="space-y-4 rounded-md border p-4 bg-secondary/30">
                        <div className="space-y-2">
                            <Label htmlFor="address">Provider Location or Patient Address</Label>
                            <div className="flex gap-2">
                                <Input 
                                    id="address" 
                                    placeholder="Enter address, city, or zip"
                                    value={userAddress}
                                    onChange={(e) => setUserAddress(e.target.value)} 
                                />
                                <Button variant="outline" onClick={() => handleFindPharmacies(false)} disabled={isSearchingPharmacies}>
                                    <Search className="mr-2 h-4 w-4" /> Find
                                </Button>
                            </div>
                            <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => handleFindPharmacies(true)} disabled={isSearchingPharmacies}>
                                <MapPin className="mr-1 h-4 w-4" /> Use My Device Location
                            </Button>
                        </div>
                        
                        {isSearchingPharmacies && (
                            <div className="flex items-center justify-center p-4 text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Searching for nearby pharmacies...
                            </div>
                        )}
                        
                        {nearbyPharmacies.length > 0 && (
                             <div className="space-y-2">
                                <Label htmlFor="pharmacy-select">Select a Pharmacy</Label>
                                <Select onValueChange={(pharmacyId) => {
                                    const pharmacy = nearbyPharmacies.find(p => p.id === pharmacyId);
                                    setSelectedPharmacy(pharmacy || null);
                                }} value={selectedPharmacy?.id}>
                                    <SelectTrigger id="pharmacy-select">
                                        <SelectValue placeholder="Select a nearby pharmacy..." />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60">
                                        {nearbyPharmacies.map(p => (
                                            <SelectItem key={p.id} value={p.id}>
                                                <div className="flex flex-col text-left">
                                                   <span className="font-semibold">{p.name}</span>
                                                   <span className="text-xs text-muted-foreground">{p.street}, {p.city} - {p.distance} miles away</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                )}
                
                {selectedPharmacy && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="medication">Medication (NDC)</Label>
                            <Input id="medication" value={ndc} onChange={e => setNdc(e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sig">SIG</Label>
                            <Input id="sig" value={sig} onChange={e => setSig(e.target.value)} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="quantity">Quantity</Label>
                                <Input id="quantity" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="days-supply">Days Supply</Label>
                                <Input id="days-supply" type="number" value={daysSupply} onChange={e => setDaysSupply(e.target.value)} />
                            </div>
                        </div>
                    </div>
                )}
                
                <Button onClick={handleDispense} disabled={isPending || !selectedPharmacy} className="w-full">
                    {isPending ? <Loader2 className="animate-spin" /> : "ePrescribe via DoseSpot (USA)"}
                </Button>
            </CardContent>
        </Card>
    );
}
