'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { Loader2, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

// Mock time slots
const TIME_SLOTS = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "01:00 PM", "01:30 PM",
    "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
    "04:00 PM", "04:30 PM"
];

export default function SchedulePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        if (!date || !selectedTime) {
            toast({ variant: "destructive", title: "Selection Required", description: "Please select a date and time." });
            return;
        }

        setIsLoading(true);
        try {
            // In a real app, reserve the slot here
            console.log("Reserving slot:", { date, time: selectedTime });

            // Simulate delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            router.push('/consultation/payment');
        } catch (error) {
            console.error("Error reserving slot:", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to reserve appointment." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-12 flex items-center justify-center">
                <Card className="w-full max-w-4xl">
                    <CardHeader>
                        <CardTitle>Schedule Your Visit</CardTitle>
                        <CardDescription>Select a date and time for your consultation.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1">
                            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                <CalendarIcon className="w-5 h-5" /> Select Date
                            </h3>
                            <div className="border rounded-md p-4 flex justify-center">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className="rounded-md border"
                                    disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                                    initialFocus
                                />
                            </div>
                        </div>

                        <div className="flex-1">
                            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5" /> Select Time
                            </h3>
                            {date ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {TIME_SLOTS.map((time) => (
                                        <Button
                                            key={time}
                                            variant={selectedTime === time ? "default" : "outline"}
                                            className={`w-full ${selectedTime === time ? "bg-primary text-primary-foreground" : ""}`}
                                            onClick={() => setSelectedTime(time)}
                                        >
                                            {time}
                                        </Button>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-64 text-muted-foreground border rounded-md border-dashed">
                                    Please select a date first
                                </div>
                            )}

                            {date && selectedTime && (
                                <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
                                    <h4 className="font-medium text-primary mb-1">Selected Appointment</h4>
                                    <p className="text-sm text-gray-600">
                                        {format(date, 'EEEE, MMMM do, yyyy')} at {selectedTime}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-6">
                        <Button variant="outline" onClick={() => router.back()}>Back</Button>
                        <Button onClick={handleConfirm} disabled={isLoading || !date || !selectedTime}>
                            {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                            Continue to Payment
                        </Button>
                    </CardFooter>
                </Card>
            </main>
            <Footer />
        </div>
    );
}
