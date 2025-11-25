'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/appwrite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, User } from 'lucide-react';

export default function PatientSignupPage() {
    const router = useRouter();
    const { signup } = useAuth();
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        phoneNumber: '',
        dateOfBirth: '',
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

        if (!formData.fullName) {
            newErrors.fullName = 'Full name is required';
        }

        if (!formData.phoneNumber) {
            newErrors.phoneNumber = 'Phone number is required';
        }

        if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = 'Date of birth is required';
        } else {
            const age = new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear();
            if (age < 18) {
                newErrors.dateOfBirth = 'You must be at least 18 years old';
            }
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
            // Create Appwrite user with patient profile
            await signup({
                email: formData.email,
                password: formData.password,
                name: formData.fullName,
                role: 'patient',
                additionalData: {
                    phoneNumber: formData.phoneNumber,
                    dateOfBirth: formData.dateOfBirth,
                    patientProfile: {
                        dob: formData.dateOfBirth,
                    },
                },
            });

            toast({
                title: 'Account created successfully!',
                description: 'Redirecting to complete your profile...',
            });

            // Redirect to patient onboarding
            router.push('/onboarding');
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
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl shadow-xl">
                <CardHeader className="space-y-4">
                    <Link href="/signup" className="flex items-center text-sm text-muted-foreground hover:text-primary">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to role selection
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">Create Patient Account</CardTitle>
                            <CardDescription>Join thousands getting quality healthcare from home</CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name *</Label>
                            <Input
                                id="fullName"
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={(e) => handleInputChange('fullName', e.target.value)}
                                disabled={isLoading}
                            />
                            {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                disabled={isLoading}
                            />
                            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                        </div>

                        {/* Phone */}
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

                        {/* Date of Birth */}
                        <div className="space-y-2">
                            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                            <Input
                                id="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                disabled={isLoading}
                                max={new Date().toISOString().split('T')[0]}
                            />
                            {errors.dateOfBirth && <p className="text-sm text-red-500">{errors.dateOfBirth}</p>}
                        </div>

                        {/* Password */}
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

                        {/* Password Requirements */}
                        <div className="text-xs text-muted-foreground bg-slate-50 p-3 rounded">
                            <p className="font-medium mb-1">Password must contain:</p>
                            <ul className="list-disc list-inside space-y-0.5">
                                <li>At least 8 characters</li>
                                <li>One uppercase letter</li>
                                <li>One number</li>
                            </ul>
                        </div>

                        {/* Terms & Conditions */}
                        <div className="flex items-start space-x-2">
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
                                {' '}and{' '}
                                <Link href="/privacy" className="text-primary hover:underline" target="_blank">
                                    Privacy Policy
                                </Link>
                            </label>
                        </div>
                        {errors.acceptTerms && <p className="text-sm text-red-500">{errors.acceptTerms}</p>}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            size="lg"
                            disabled={isLoading}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Account
                        </Button>

                        {/* Login Link */}
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
