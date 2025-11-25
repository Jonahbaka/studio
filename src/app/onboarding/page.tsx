'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, ShieldCheck, CreditCard, User as UserIcon, FileText, AlertTriangle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const STEPS = [
    { id: 'emergency', title: 'Safety Check', icon: AlertTriangle },
    { id: 'hipaa', title: 'Consent', icon: FileText },
    { id: 'demographics', title: 'Personal Info', icon: UserIcon },
    { id: 'medical', title: 'Medical History', icon: FileText },
    { id: 'insurance', title: 'Insurance', icon: CreditCard },
    { id: 'identity', title: 'Identity', icon: ShieldCheck },
];

export default function OnboardingPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        hipaaConsent: false,
        dob: '',
        gender: '',
        address: { street: '', city: '', state: '', zip: '', country: 'USA' },
        medicalHistory: '',
        allergies: '',
        currentMedications: '',
        insurance: { provider: '', policyNumber: '', groupNumber: '' },
    });

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);

    const handleInputChange = (section: string, field: string, value: string | boolean) => {
        if (section === 'root') {
            setFormData(prev => ({ ...prev, [field]: value }));
        } else {
            setFormData(prev => ({
                ...prev,
                [section]: { ...prev[section as keyof typeof prev] as any, [field]: value }
            }));
        }
    };

    const validateStep = () => {
        switch (currentStep) {
            case 0: // Emergency
                return true; // Blocking check handled in UI
            case 1: // HIPAA
                return formData.hipaaConsent;
            case 2: // Demographics
                return formData.dob && formData.gender && formData.address.street && formData.address.city && formData.address.state && formData.address.zip;
            case 3: // Medical History
                return true;
            case 4: // Insurance
                return formData.insurance.provider && formData.insurance.policyNumber;
            case 5: // Identity
                return true; // Mock verification
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
        console.log("handleSubmit called");
        if (!user || !firestore) {
            console.error("Missing user or firestore", { user, firestore });
            return;
        }
        setIsLoading(true);

        try {
            console.log("Updating user doc...", user.uid);
            const userRef = doc(firestore, 'users', user.uid);

            // Parse arrays
            const medicalHistoryArray = formData.medicalHistory.split(',').map(s => s.trim()).filter(Boolean);
            const allergiesArray = formData.allergies.split(',').map(s => s.trim()).filter(Boolean);
            const medicationsArray = formData.currentMedications.split(',').map(s => s.trim()).filter(Boolean);

            await updateDoc(userRef, {
                patientProfile: {
                    dob: formData.dob,
                    gender: formData.gender,
                    address: formData.address,
                    medicalHistory: medicalHistoryArray,
                    allergies: allergiesArray,
                    currentMedications: medicationsArray,
                    insurance: {
                        ...formData.insurance,
                        verified: false // Needs backend verification
                    },
                    onboardingCompleted: true
                },
                isVerified: false // Identity verification pending
            });

            console.log("User doc updated successfully");
            toast({ title: "Profile Completed", description: "Your information has been saved." });
            console.log("Redirecting to /consultation/intake");
            router.push('/consultation/intake'); // Redirect to intake
        } catch (error) {
            console.error("Error saving profile:", error);
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
            case 0: // Emergency
                return (
                    <div className="space-y-6">
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Emergency Warning</AlertTitle>
                            <AlertDescription>
                                If you are experiencing chest pain, severe bleeding, or difficulty breathing, please call 911 or go to the nearest emergency room immediately.
                            </AlertDescription>
                        </Alert>
                        <div className="text-center space-y-4">
                            <p className="text-lg font-medium">Do you have any of these emergency symptoms?</p>
                            <div className="flex justify-center gap-4">
                                <Button variant="destructive" onClick={() => window.location.href = 'tel:911'}>
                                    Yes, I need help
                                </Button>
                                <Button variant="outline" onClick={handleNext}>
                                    No, I am safe
                                </Button>
                            </div>
                        </div>
                    </div>
                );
            case 1: // HIPAA
                return (
                    <div className="space-y-6">
                        <div className="prose max-w-none">
                            <h3>Informed Consent & Privacy Policy</h3>
                            <p className="text-sm text-muted-foreground">
                                By continuing, you agree to receive telehealth treatment. You acknowledge that telehealth is not a substitute for emergency care.
                                You also agree to our Privacy Policy and HIPAA practices regarding your health information.
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="hipaa"
                                checked={formData.hipaaConsent}
                                onCheckedChange={(checked) => handleInputChange('root', 'hipaaConsent', checked as boolean)}
                            />
                            <Label htmlFor="hipaa" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                I agree to the Telehealth Consent and Privacy Policy
                            </Label>
                        </div>
                    </div>
                );
            case 2: // Demographics
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Date of Birth</Label>
                                <Input type="date" value={formData.dob} onChange={e => handleInputChange('root', 'dob', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Gender</Label>
                                <Select value={formData.gender} onValueChange={v => handleInputChange('root', 'gender', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Street Address</Label>
                            <Input placeholder="123 Main St" value={formData.address.street} onChange={e => handleInputChange('address', 'street', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>City</Label>
                                <Input placeholder="New York" value={formData.address.city} onChange={e => handleInputChange('address', 'city', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>State</Label>
                                <Input placeholder="NY" value={formData.address.state} onChange={e => handleInputChange('address', 'state', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Zip Code</Label>
                                <Input placeholder="10001" value={formData.address.zip} onChange={e => handleInputChange('address', 'zip', e.target.value)} />
                            </div>
                        </div>
                    </div>
                );
            case 3: // Medical History
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Medical Conditions (comma separated)</Label>
                            <Textarea placeholder="Diabetes, Hypertension..." value={formData.medicalHistory} onChange={e => handleInputChange('root', 'medicalHistory', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Allergies (comma separated)</Label>
                            <Textarea placeholder="Penicillin, Peanuts..." value={formData.allergies} onChange={e => handleInputChange('root', 'allergies', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Current Medications (comma separated)</Label>
                            <Textarea placeholder="Lisinopril 10mg, Metformin..." value={formData.currentMedications} onChange={e => handleInputChange('root', 'currentMedications', e.target.value)} />
                        </div>
                    </div>
                );
            case 4: // Insurance
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Insurance Provider</Label>
                            <Input placeholder="Blue Cross Blue Shield" value={formData.insurance.provider} onChange={e => handleInputChange('insurance', 'provider', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Policy Number</Label>
                                <Input placeholder="XYZ123456789" value={formData.insurance.policyNumber} onChange={e => handleInputChange('insurance', 'policyNumber', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Group Number</Label>
                                <Input placeholder="GRP98765" value={formData.insurance.groupNumber} onChange={e => handleInputChange('insurance', 'groupNumber', e.target.value)} />
                            </div>
                        </div>
                    </div>
                );
            case 5: // Identity
                return (
                    <div className="space-y-4 text-center">
                        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <ShieldCheck className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-medium">Verify Your Identity</h3>
                        <p className="text-sm text-muted-foreground">
                            We use Stripe Identity to securely verify your government-issued ID.
                            This step is required for HIPAA compliance.
                        </p>
                        <Button variant="outline" className="w-full mt-4" onClick={() => toast({ title: "Mock Verification", description: "Identity verification simulated." })}>
                            Start Verification (Mock)
                        </Button>
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
                    <CardDescription>Please complete your profile to continue.</CardDescription>
                </CardHeader>
                <CardContent>
                    {renderStepContent()}
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={handleBack} disabled={currentStep === 0 || isLoading}>
                        Back
                    </Button>
                    <Button onClick={handleNext} disabled={isLoading || (currentStep === 0)}>
                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                        {currentStep === STEPS.length - 1 ? 'Complete Setup' : 'Next'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
