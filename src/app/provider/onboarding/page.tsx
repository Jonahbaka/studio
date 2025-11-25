'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, FileBadge, Stethoscope, Building2, GraduationCap } from 'lucide-react';

const STEPS = [
    { id: 'professional', title: 'Professional Info', icon: Stethoscope },
    { id: 'credentials', title: 'Credentials & License', icon: FileBadge },
    { id: 'education', title: 'Education', icon: GraduationCap },
    { id: 'practice', title: 'Practice Details', icon: Building2 },
];

export default function ProviderOnboardingPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        specialty: '',
        npi: '',
        licenseNumber: '',
        licenseState: '',
        medicalSchool: '',
        graduationYear: '',
        bio: '',
        availability: '9-5',
    });

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateStep = () => {
        switch (currentStep) {
            case 0: // Professional
                return formData.title && formData.specialty && formData.bio;
            case 1: // Credentials
                return formData.npi && formData.licenseNumber && formData.licenseState;
            case 2: // Education
                return formData.medicalSchool && formData.graduationYear;
            case 3: // Practice
                return true; // Defaults are fine
            default:
                return true;
        }
    };

    const handleNext = async () => {
        if (!validateStep()) {
            toast({ variant: "destructive", title: "Missing Information", description: "Please fill in all required fields." });
            return;
        }

        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            await handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (!user || !firestore) return;
        setIsLoading(true);

        try {
            const userRef = doc(firestore, 'users', user.uid);

            await updateDoc(userRef, {
                providerProfile: {
                    title: formData.title,
                    specialty: formData.specialty,
                    npi: formData.npi,
                    licenseNumber: formData.licenseNumber,
                    licenseState: formData.licenseState,
                    education: {
                        school: formData.medicalSchool,
                        graduationYear: formData.graduationYear
                    },
                    bio: formData.bio,
                    availability: {
                        schedule: formData.availability // Simplified for MVP
                    },
                    verified: false, // Requires admin approval
                    onboardingCompleted: true
                },
                role: 'doctor' // Enforce provider role
            });

            toast({ title: "Application Submitted", description: "Your profile is under review for credentialing." });
            router.push('/provider'); // Redirect to provider dashboard
        } catch (error) {
            console.error("Error saving provider profile:", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to save profile." });
        } finally {
            setIsLoading(false);
        }
    };

    if (isUserLoading || !user) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: // Professional Info
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Professional Title</Label>
                            <Select value={formData.title} onValueChange={v => handleInputChange('title', v)}>
                                <SelectTrigger><SelectValue placeholder="Select Title" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MD">MD - Doctor of Medicine</SelectItem>
                                    <SelectItem value="DO">DO - Doctor of Osteopathic Medicine</SelectItem>
                                    <SelectItem value="NP">NP - Nurse Practitioner</SelectItem>
                                    <SelectItem value="PA">PA - Physician Assistant</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Primary Specialty</Label>
                            <Select value={formData.specialty} onValueChange={v => handleInputChange('specialty', v)}>
                                <SelectTrigger><SelectValue placeholder="Select Specialty" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Family Medicine">Family Medicine</SelectItem>
                                    <SelectItem value="Internal Medicine">Internal Medicine</SelectItem>
                                    <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                                    <SelectItem value="Dermatology">Dermatology</SelectItem>
                                    <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Professional Bio</Label>
                            <Textarea
                                placeholder="Describe your experience and approach to care..."
                                value={formData.bio}
                                onChange={e => handleInputChange('bio', e.target.value)}
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>
                );
            case 1: // Credentials
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>NPI Number</Label>
                            <Input placeholder="10-digit NPI" value={formData.npi} onChange={e => handleInputChange('npi', e.target.value)} maxLength={10} />
                            <p className="text-xs text-muted-foreground">National Provider Identifier</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>License Number</Label>
                                <Input placeholder="License #" value={formData.licenseNumber} onChange={e => handleInputChange('licenseNumber', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Issuing State</Label>
                                <Input placeholder="State (e.g., CA)" value={formData.licenseState} onChange={e => handleInputChange('licenseState', e.target.value)} maxLength={2} />
                            </div>
                        </div>
                    </div>
                );
            case 2: // Education
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Medical School / Institution</Label>
                            <Input placeholder="University of Medicine" value={formData.medicalSchool} onChange={e => handleInputChange('medicalSchool', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Graduation Year</Label>
                            <Input placeholder="YYYY" value={formData.graduationYear} onChange={e => handleInputChange('graduationYear', e.target.value)} maxLength={4} />
                        </div>
                    </div>
                );
            case 3: // Practice
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Standard Availability</Label>
                            <Select value={formData.availability} onValueChange={v => handleInputChange('availability', v)}>
                                <SelectTrigger><SelectValue placeholder="Select Availability" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="9-5">Weekdays 9 AM - 5 PM</SelectItem>
                                    <SelectItem value="evenings">Evenings & Weekends</SelectItem>
                                    <SelectItem value="flexible">Flexible / By Appointment</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-800">
                            <p className="font-semibold mb-1">Credentialing Notice</p>
                            <p>Your profile will be reviewed by our credentialing team. You will be notified via email once your account is active and ready to see patients.</p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                        {STEPS.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = index === currentStep;
                            const isCompleted = index < currentStep;
                            return (
                                <div key={step.id} className={`flex flex-col items-center space-y-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isActive ? 'border-primary bg-primary/10' : isCompleted ? 'border-green-500 bg-green-50' : 'border-muted'}`}>
                                        {isCompleted ? <CheckCircle className="w-6 h-6 text-green-500" /> : <Icon className="w-5 h-5" />}
                                    </div>
                                    <span className="text-xs font-medium hidden sm:block">{step.title}</span>
                                </div>
                            );
                        })}
                    </div>
                    <CardTitle>{STEPS[currentStep].title}</CardTitle>
                    <CardDescription>Provider Credentialing & Onboarding</CardDescription>
                </CardHeader>
                <CardContent>
                    {renderStepContent()}
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={handleBack} disabled={currentStep === 0 || isLoading}>
                        Back
                    </Button>
                    <Button onClick={handleNext} disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                        {currentStep === STEPS.length - 1 ? 'Submit Application' : 'Next'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
