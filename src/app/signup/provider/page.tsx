'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/appwrite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Stethoscope, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ProviderSignupPage() {
    const router = useRouter();
    const { signup } = useAuth();
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        title: '',
        specialty: '',
        licenseNumber: '',
        licenseState: '',
        npi: '',
        phoneNumber: '',
        acceptTerms: false,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validatePassword = (password: string): boolean => {
        if (password.length < 8) {
            setErrors(prev => ({ ...prev, password: 'Password must be at least 8 characters' }));
            return false;
        }
        if (!/[A-Z]/.test(password)) {
            setErrors(prev => ({ ...prev, password: 'Password must contain an uppercase letter' }));
            return false;
        }
        if (!/[0-9]/.test(password)) {
            setErrors(prev => ({ ...prev, password: 'Password must contain a number' }));
            return false;
        }
        setErrors(prev => ({ ...prev, password: '' }));
        return true;
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!validatePassword(formData.password)) {
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.fullName) newErrors.fullName = 'Full name is required';
        if (!formData.title) newErrors.title = 'Professional title is required';
        if (!formData.specialty) newErrors.specialty = 'Specialty is required';
        if (!formData.licenseNumber) newErrors.licenseNumber = 'License number is required';
        if (!formData.licenseState) newErrors.licenseState = 'License state is required';
        if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';

        if (formData.npi && formData.npi.length !== 10) {
            newErrors.npi = 'NPI must be 10 digits';
        }

        if (!formData.acceptTerms) {
            newErrors.acceptTerms = 'You must accept the terms and conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            // Create Appwrite user with provider profile
            await signup({
                email: formData.email,
                password: formData.password,
                name: formData.fullName,
                role: 'provider',
                additionalData: {
                    phoneNumber: formData.phoneNumber,
                    providerProfile: {
                        title: formData.title,
                        specialty: formData.specialty,
                        licenseNumber: formData.licenseNumber,
                        licenseState: formData.licenseState,
                        npiNumber: formData.npi,
                        verified: false,
                        onboardingCompleted: false,
                    },
                },
            });

            toast({
                title: 'Account created successfully!',
                description: 'Redirecting to complete your credentialing profile...',
            });

            router.push('/provider/onboarding');
        } catch (error: any) {
            console.error('Signup error:', error);

            let errorMessage = 'An error occurred during signup';
            if (error.code === 409 || error.type === 'user_already_exists') {
                errorMessage = 'This email is already registered';
            } else if (error.code === 400) {
                errorMessage = 'Invalid email or password';
            }

            toast({
                variant: 'destructive',
                title: 'Signup Failed',
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-3xl shadow-xl my-8">
                <CardHeader className="space-y-4">
                    <Link href="/signup" className="flex items-center text-sm text-muted-foreground hover:text-primary">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to role selection
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <Stethoscope className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">Create Provider Account</CardTitle>
                            <CardDescription>Join our network of healthcare professionals</CardDescription>
                        </div>
                    </div>

                    <Alert className="border-blue-200 bg-blue-50">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-sm text-blue-900">
                            After registration, you'll complete a detailed credentialing process. Our team will review your application within 48 hours.
                        </AlertDescription>
                    </Alert>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Personal Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name *</Label>
                                    <Input
                                        id="fullName"
                                        placeholder="Dr. Jane Smith"
                                        value={formData.fullName}
                                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                                        disabled={isLoading}
                                    />
                                    {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                                    <Input
                                        id="phoneNumber"
                                        type="tel"
                                        placeholder="(555) 123-4567"
                                        value={formData.phoneNumber}
                                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                        disabled={isLoading}
                                    />
                                    {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="doctor@clinic.com"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    disabled={isLoading}
                                />
                                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="font-semibold text-lg">Professional Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Professional Title *</Label>
                                    <Select value={formData.title} onValueChange={(v) => handleInputChange('title', v)} disabled={isLoading}>
                                        <SelectTrigger id="title">
                                            <SelectValue placeholder="Select title" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MD">MD - Doctor of Medicine</SelectItem>
                                            <SelectItem value="DO">DO - Doctor of Osteopathic Medicine</SelectItem>
                                            <SelectItem value="NP">NP - Nurse Practitioner</SelectItem>
                                            <SelectItem value="PA">PA - Physician Assistant</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="specialty">Primary Specialty *</Label>
                                    <Select value={formData.specialty} onValueChange={(v) => handleInputChange('specialty', v)} disabled={isLoading}>
                                        <SelectTrigger id="specialty">
                                            <SelectValue placeholder="Select specialty" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Family Medicine">Family Medicine</SelectItem>
                                            <SelectItem value="Internal Medicine">Internal Medicine</SelectItem>
                                            <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                                            <SelectItem value="Dermatology">Dermatology</SelectItem>
                                            <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.specialty && <p className="text-sm text-red-500">{errors.specialty}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="licenseNumber">License Number *</Label>
                                    <Input
                                        id="licenseNumber"
                                        placeholder="A12345"
                                        value={formData.licenseNumber}
                                        onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                                        disabled={isLoading}
                                    />
                                    {errors.licenseNumber && <p className="text-sm text-red-500">{errors.licenseNumber}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="licenseState">License State *</Label>
                                    <Input
                                        id="licenseState"
                                        placeholder="CA"
                                        maxLength={2}
                                        value={formData.licenseState}
                                        onChange={(e) => handleInputChange('licenseState', e.target.value.toUpperCase())}
                                        disabled={isLoading}
                                    />
                                    {errors.licenseState && <p className="text-sm text-red-500">{errors.licenseState}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="npi">NPI Number <span className="text-muted-foreground">(Optional)</span></Label>
                                <Input
                                    id="npi"
                                    placeholder="1234567890"
                                    maxLength={10}
                                    value={formData.npi}
                                    onChange={(e) => handleInputChange('npi', e.target.value.replace(/\D/g, ''))}
                                    disabled={isLoading}
                                />
                                {errors.npi && <p className="text-sm text-red-500">{errors.npi}</p>}
                                <p className="text-xs text-muted-foreground">10-digit National Provider Identifier</p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="font-semibold text-lg">Security</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password *</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => {
                                            handleInputChange('password', e.target.value);
                                            validatePassword(e.target.value);
                                        }}
                                        disabled={isLoading}
                                    />
                                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                        disabled={isLoading}
                                    />
                                    {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                                </div>
                            </div>

                            <div className="text-xs text-muted-foreground bg-slate-50 p-3 rounded">
                                <p className="font-medium mb-1">Password must contain:</p>
                                <ul className="list-disc list-inside space-y-0.5">
                                    <li>At least 8 characters</li>
                                    <li>One uppercase letter</li>
                                    <li>One number</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex items-start space-x-2 pt-2">
                            <Checkbox
                                id="acceptTerms"
                                checked={formData.acceptTerms}
                                onCheckedChange={(checked) => handleInputChange('acceptTerms', checked as boolean)}
                                disabled={isLoading}
                            />
                            <label htmlFor="acceptTerms" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                I agree to the{' '}
                                <Link href="/terms" className="text-primary hover:underline" target="_blank">
                                    Terms of Service
                                </Link>
                                {', '}
                                <Link href="/privacy" className="text-primary hover:underline" target="_blank">
                                    Privacy Policy
                                </Link>
                                {', and '}
                                <Link href="/provider-agreement" className="text-primary hover:underline" target="_blank">
                                    Provider Agreement
                                </Link>
                            </label>
                        </div>
                        {errors.acceptTerms && <p className="text-sm text-red-500">{errors.acceptTerms}</p>}

                        <Button
                            type="submit"
                            className="w-full bg-green-600 hover:bg-green-700"
                            size="lg"
                            disabled={isLoading}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Provider Account
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary font-semibold hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
