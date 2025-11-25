'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/shared/logo';
import { useAuth } from '@/appwrite/hooks/useAuth';
import { useUser } from '@/appwrite/hooks/useUser';
import { useDocument } from '@/appwrite/hooks/useDocument';
import { getDatabases, APPWRITE_DATABASE_ID, COLLECTION_IDS } from '@/appwrite/config';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  // Get user document to check role
  const { data: userDoc } = useDocument(COLLECTION_IDS.USERS, user?.uid || null);

  const redirectToPortal = async () => {
    if (!user) return;

    try {
      const userData = userDoc as any;
      if (userData?.role === 'provider') {
        router.push('/provider');
      } else if (userData?.role === 'admin') {
        router.push('/admin');
      } else {
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
      redirectToPortal();
    }
  }, [user, isUserLoading, userDoc]);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsLoading(true);
    try {
      await auth.login(email, password);
      // The useEffect hook will now handle the redirection after the user state is updated.
    } catch (error: any) {
      let description = "Invalid email or password. Please try again or sign up.";
      toast({
        variant: "destructive",
        title: "Login failed",
        description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show a loading spinner while checking auth state or if user object is present (pre-redirect).
  if (isUserLoading || (user && !userDoc)) {
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
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Log In
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
