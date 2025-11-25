'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/logo';
import { User, Stethoscope, Heart, Video, MessageSquare, Calendar, Award, Clock, Shield } from 'lucide-react';

export default function SignupPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between">
                    <Logo />
                    <div className="text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary font-semibold hover:underline">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="container mx-auto px-4 py-12 text-center">
                <h1 className="text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Join Our Healthcare Platform
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
                    Connect with care providers, manage your health, or provide exceptional telehealth services.
                </p>

                {/* Role Selection Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Patient Card */}
                    <Card className="relative overflow-hidden border-2 hover:border-blue-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <CardHeader className="relative">
                            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-8 h-8 text-blue-600" />
                            </div>
                            <CardTitle className="text-2xl">I'm a Patient</CardTitle>
                            <CardDescription className="text-base">
                                Access quality healthcare from the comfort of your home
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="relative space-y-4">
                            <div className="space-y-3 text-left">
                                <div className="flex items-start gap-3">
                                    <Video className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium">HD Video Consultations</p>
                                        <p className="text-sm text-muted-foreground">Connect face-to-face with licensed providers</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium">Secure Messaging</p>
                                        <p className="text-sm text-muted-foreground">Chat with your care team 24/7</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium">Easy Scheduling</p>
                                        <p className="text-sm text-muted-foreground">Book appointments that fit your schedule</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Heart className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium">Comprehensive Care</p>
                                        <p className="text-sm text-muted-foreground">From primary care to specialty consultations</p>
                                    </div>
                                </div>
                            </div>

                            <Button asChild className="w-full mt-6 bg-blue-600 hover:bg-blue-700" size="lg">
                                <Link href="/signup/patient">
                                    Get Started as Patient
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Provider Card */}
                    <Card className="relative overflow-hidden border-2 hover:border-green-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl group">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <CardHeader className="relative">
                            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                                <Stethoscope className="w-8 h-8 text-green-600" />
                            </div>
                            <CardTitle className="text-2xl">I'm a Provider</CardTitle>
                            <CardDescription className="text-base">
                                Deliver exceptional care with cutting-edge telehealth tools
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="relative space-y-4">
                            <div className="space-y-3 text-left">
                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium">Flexible Scheduling</p>
                                        <p className="text-sm text-muted-foreground">Set your availability, work on your terms</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium">HIPAA Compliant</p>
                                        <p className="text-sm text-muted-foreground">Secure platform with full compliance</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Award className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium">Credentialing Support</p>
                                        <p className="text-sm text-muted-foreground">We handle the paperwork</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MessageSquare className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium">Integrated EHR</p>
                                        <p className="text-sm text-muted-foreground">Streamlined clinical documentation</p>
                                    </div>
                                </div>
                            </div>

                            <Button asChild className="w-full mt-6 bg-green-600 hover:bg-green-700" size="lg">
                                <Link href="/signup/provider">
                                    Get Started as Provider
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Trust Indicators */}
                <div className="mt-16 max-w-3xl mx-auto">
                    <div className="grid grid-cols-3 gap-8 text-center">
                        <div>
                            <p className="text-3xl font-bold text-blue-600">50K+</p>
                            <p className="text-sm text-muted-foreground">Active Patients</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-green-600">2K+</p>
                            <p className="text-sm text-muted-foreground">Licensed Providers</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-purple-600">99.9%</p>
                            <p className="text-sm text-muted-foreground">Uptime</p>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
