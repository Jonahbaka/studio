'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function IntakePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        symptoms: '',
        duration: '',
        severity: '',
        isPregnant: 'no',
        recentSurgeries: 'no',
        notes: ''
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.symptoms || !formData.duration || !formData.severity) {
            toast({ variant: "destructive", title: "Missing Information", description: "Please fill in all required fields." });
            return;
        }

        setIsLoading(true);
        try {
            // In a real app, save to backend here
            console.log("Saving intake data:", formData);

            // Simulate delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            router.push('/consultation/schedule');
        } catch (error) {
            console.error("Error saving intake:", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to save intake information." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-12 flex items-center justify-center">
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle>Reason for Visit</CardTitle>
                        <CardDescription>Please describe your symptoms and medical context.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="symptoms">What symptoms are you experiencing? *</Label>
                            <Textarea
                                id="symptoms"
                                placeholder="e.g., Sore throat, fever, cough..."
                                value={formData.symptoms}
                                onChange={(e) => handleInputChange('symptoms', e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="duration">How long have you had these symptoms? *</Label>
                                <Input
                                    id="duration"
                                    placeholder="e.g., 2 days"
                                    value={formData.duration}
                                    onChange={(e) => handleInputChange('duration', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="severity">Severity (1-10) *</Label>
                                <Input
                                    id="severity"
                                    type="number"
                                    min="1"
                                    max="10"
                                    placeholder="5"
                                    value={formData.severity}
                                    onChange={(e) => handleInputChange('severity', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label>Safety Questions</Label>

                            <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground">Are you currently pregnant or breastfeeding?</Label>
                                <RadioGroup value={formData.isPregnant} onValueChange={(v) => handleInputChange('isPregnant', v)} className="flex space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="yes" id="preg-yes" />
                                        <Label htmlFor="preg-yes">Yes</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="no" id="preg-no" />
                                        <Label htmlFor="preg-no">No</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground">Have you had any recent surgeries (last 3 months)?</Label>
                                <RadioGroup value={formData.recentSurgeries} onValueChange={(v) => handleInputChange('recentSurgeries', v)} className="flex space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="yes" id="surg-yes" />
                                        <Label htmlFor="surg-yes">Yes</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="no" id="surg-no" />
                                        <Label htmlFor="surg-no">No</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Additional Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                placeholder="Any other details..."
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={() => router.back()}>Back</Button>
                        <Button onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                            Continue to Scheduling
                        </Button>
                    </CardFooter>
                </Card>
            </main>
            <Footer />
        </div>
    );
}
