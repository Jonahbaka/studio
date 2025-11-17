'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/shared/logo';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { User as FirebaseUser, signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTestProviderLoading, setIsTestProviderLoading] = useState(false);

  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const redirectToPortal = async (user: FirebaseUser) => {
    if (!firestore) {
      toast({ variant: "destructive", title: "Error", description: "Firestore service is not available." });
      return;
    }
    
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
        // This can happen if a user authenticated but profile creation failed.
        // We'll treat them as a new patient as a fallback.
        await createUserProfile(user, { role: 'patient' });
        router.push('/app');
      }
    } catch (error) {
      console.error("Error fetching user role, redirecting to default:", error);
      toast({ variant: "destructive", title: "Redirect Failed", description: "Could not determine your user role." });
      router.push('/app'); // Fallback redirect
    }
  };

  useEffect(() => {
    // If the user object is available (and not loading), redirect them.
    if (!isUserLoading && user) {
        redirectToPortal(user);
    }
  }, [user, isUserLoading]);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!auth) {
        toast({ variant: "destructive", title: "Login failed", description: "Authentication service is not available." });
        return;
    }
    setIsLoading(true);
    try {
        await signInWithEmailAndPassword(auth, email, password);
        // The useEffect hook will now handle the redirection after the user state is updated.
    } catch (error: any) {
        let description = "An unknown error occurred.";
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            description = "Invalid email or password. Please try again or sign up.";
        }
        toast({
            variant: "destructive",
            title: "Login failed",
            description,
        });
    } finally {
        setIsLoading(false);
    }
  };

  const createUserProfile = async (user: FirebaseUser, additionalData: any = {}) => {
        if (!firestore) return;
        const userProfileRef = doc(firestore, 'users', user.uid);
        const userProfileSnap = await getDoc(userProfileRef);

        if (userProfileSnap.exists()) {
          return; // Profile already exists
        }

        const [firstName, ...lastNameParts] = (user.displayName || 'Anonymous').split(' ');
        const lastName = lastNameParts.join(' ');
        
        const profileData: any = {
            id: user.uid,
            email: user.email || `anon-${user.uid}@example.com`,
            firstName: firstName || 'Anonymous',
            lastName: lastName || (additionalData.role === 'doctor' ? 'Provider' : 'User'),
            role: additionalData.role || 'patient',
            createdAt: serverTimestamp(),
        };

        if (profileData.role === 'doctor') {
              profileData.licenseNumber = 'D-ANON123';
              profileData.npi = 'NPI-ANON456';
              profileData.licenseStatus = 'approved';
        }
        
        await setDoc(userProfileRef, profileData);
    };

    const handleTestProviderLogin = async () => {
      if (!auth || !firestore) return;
      setIsTestProviderLoading(true);
      try {
        const userCredential = await signInAnonymously(auth);
        // **FIX**: Explicitly `await` profile creation BEFORE redirecting.
        // This solves the race condition.
        await createUserProfile(userCredential.user, { role: 'doctor' });
        // Now that the profile is guaranteed to exist, redirect.
        router.push('/provider');
      } catch (error: any) {
          toast({
              variant: "destructive",
              title: "Anonymous Login Failed",
              description: error.message,
            });
      } finally {
        setIsTestProviderLoading(false);
      }
    };

    // Show a loading spinner while checking auth state or if user object is present (pre-redirect).
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
          <CardTitle className="text-3xl font-headline">Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </Link>
              </div>
              <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || isTestProviderLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Log In
            </Button>
             <Button type="button" variant="secondary" onClick={handleTestProviderLogin} className="w-full" disabled={isLoading || isTestProviderLoading}>
                {isTestProviderLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Log In as Provider (No Credentials)'}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
