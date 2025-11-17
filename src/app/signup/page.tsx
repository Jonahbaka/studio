'use client'

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Logo } from '@/components/shared/logo';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { updateProfile, User as FirebaseUser, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function SignupPage() {
    const [role, setRole] = useState('patient');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [npiNumber, setNpiNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const auth = useAuth();
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const { toast } = useToast();

    const isClinicalRole = ['doctor', 'nurse', 'pharmacist'].includes(role);

    const redirectToPortal = async (user: FirebaseUser) => {
        if (!firestore) return;
        const userDocRef = doc(firestore, 'users', user.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            if (['doctor', 'nurse', 'admin'].includes(userData.role)) {
              router.push('/provider');
            } else {
              router.push('/app');
            }
          } else {
            // Fallback for social signups or interrupted signups
            await createUserProfile(user, { role: 'patient' });
            router.push('/app');
          }
        } catch (error) {
          console.error("Error redirecting user:", error);
          router.push('/app');
        }
    };

    useEffect(() => {
        if (!isUserLoading && user) {
            redirectToPortal(user);
        }
    }, [user, isUserLoading]);


    const createUserProfile = async (user: FirebaseUser, additionalData: any = {}) => {
        if (!firestore) return;
        const userProfileRef = doc(firestore, 'users', user.uid);
        
        const userProfileSnap = await getDoc(userProfileRef);
        if (userProfileSnap.exists()) {
            console.log("User profile already exists.");
            return;
        }

        const [fName, ...lNameParts] = (user.displayName || `${additionalData.firstName || ''} ${additionalData.lastName || ''}`).split(' ');
        const lName = lNameParts.join(' ');
        
        const finalRole = additionalData.role || 'patient';
        
        const profileData: any = {
            id: user.uid,
            email: user.email,
            firstName: fName || 'New',
            lastName: lName || 'User',
            role: finalRole,
            createdAt: serverTimestamp(),
            isGoldMember: false,
        };
        
        if (['doctor', 'nurse', 'pharmacist'].includes(finalRole)) {
            profileData.licenseNumber = additionalData.licenseNumber || 'PENDING_APPROVAL';
            profileData.npi = additionalData.npiNumber || 'PENDING_APPROVAL';
            profileData.licenseStatus = 'pending';

            const licenseRequestRef = doc(firestore, 'licenseRequests', user.uid);
            await setDoc(licenseRequestRef, {
                userId: user.uid,
                name: `${profileData.firstName} ${profileData.lastName}`,
                email: user.email,
                role: finalRole,
                licenseNumber: profileData.licenseNumber,
                npi: profileData.npi,
                status: 'pending', 
                submittedAt: serverTimestamp(),
            });
        }

        await setDoc(userProfileRef, profileData);
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth || !firestore) {
            toast({ variant: "destructive", title: "Sign up failed", description: "Firebase service is not available." });
            return;
        }
        if (isClinicalRole && (!licenseNumber || !npiNumber)) {
            toast({ variant: "destructive", title: "Missing Information", description: "License and NPI numbers are required for clinical roles."});
            return;
        }
        setIsLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const newUser = userCredential.user;
            
            await updateProfile(newUser, { displayName: `${firstName} ${lastName}`.trim() });
            await sendEmailVerification(newUser);

            await createUserProfile(newUser, { 
                firstName, 
                lastName, 
                role,
                licenseNumber,
                npiNumber,
            });
            
            toast({
                title: "Welcome to ZumaiDoc!",
                description: isClinicalRole 
                    ? "Your account is pending approval. Please check your email to verify your address."
                    : "Please check your inbox to verify your email address. You will be redirected shortly."
            });

        } catch (error: any) {
            console.error("Error signing up:", error);
            let description = error.message;
            if (error.code === 'auth/email-already-in-use') {
                description = "This email is already registered. Please log in instead.";
            }
            toast({ variant: "destructive", title: "Sign up failed", description });
        } finally {
            setIsLoading(false);
        }
    };
    
    if (isUserLoading || user) {
        return (
          <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md mx-auto">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4">
                        <Logo />
                    </div>
                    <CardTitle className="text-3xl font-headline">Create an Account</CardTitle>
                    <CardDescription>Join ZumaiDoc to access modern healthcare.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={handleSignUp}>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first-name">First Name</Label>
                                <Input id="first-name" placeholder="John" required value={firstName} onChange={e => setFirstName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last-name">Last Name</Label>
                                <Input id="last-name" placeholder="Doe" required value={lastName} onChange={e => setLastName(e.target.value)} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="role">I am a...</Label>
                            <Select onValueChange={setRole} defaultValue="patient">
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="patient">Patient</SelectItem>
                                    <SelectItem value="doctor">Doctor</SelectItem>
                                    <SelectItem value="nurse">Nurse</SelectItem>
                                    <SelectItem value="pharmacist">Pharmacist</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {isClinicalRole && (
                            <div className="space-y-4 rounded-lg border p-4 bg-secondary/50">
                                <p className="text-sm font-medium text-foreground">Clinical Information</p>
                                <div className="space-y-2">
                                    <Label htmlFor="license-number">License Number</Label>
                                    <Input id="license-number" placeholder="Enter your license number" required={isClinicalRole} value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="npi-number">NPI Number</Label>
                                    <Input id="npi-number" placeholder="Enter your NPI number" required={isClinicalRole} value={npiNumber} onChange={e => setNpiNumber(e.target.value)}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="license-upload">Upload License (Optional)</Label>
                                    <Input id="license-upload" type="file" />
                                    <p className="text-xs text-muted-foreground">Your account will be pending approval by an admin.</p>
                                </div>
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Create Account'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        Already have an account?{" "}
                        <Link href="/login" className="underline">
                            Log in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
