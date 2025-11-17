
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import {
  DashboardShell,
  DashboardHeader,
  DashboardHeaderTitle,
  DashboardContent,
} from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function AccountSettingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      const nameParts = user.displayName?.split(' ') || ['', ''];
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setEmail(user.email || '');
      // Assuming phone is stored in user profile, which we will build out
      // For now, it will be empty
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to update your profile.",
      });
      return;
    }
    setIsSaving(true);
    try {
      const userProfileRef = doc(firestore, 'users', user.uid);
      // NOTE: We now use the `users` collection.
      // We are using `setDoc` with `merge: true` to avoid overwriting other fields.
      await setDoc(userProfileRef, {
        firstName,
        lastName,
        email, // Note: changing email here won't change Firebase Auth email.
        phone,
      }, { merge: true });

      // We should also update the user's display name in Firebase Auth
      // but that requires re-authentication. For now, we update Firestore.
      
      toast({
        title: "Profile Updated",
        description: "Your information has been saved successfully.",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Could not save your profile changes.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isUserLoading) {
    return (
      <DashboardShell>
        <DashboardHeader>
            <DashboardHeaderTitle>Account Settings</DashboardHeaderTitle>
        </DashboardHeader>
        <DashboardContent>
            <Loader2 className="animate-spin" />
        </DashboardContent>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <DashboardHeader>
        <DashboardHeaderTitle>Account Settings</DashboardHeaderTitle>
        <CardDescription>Manage your account details and preferences.</CardDescription>
      </DashboardHeader>
      <DashboardContent>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your name, email, and phone number.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john.doe@example.com" disabled />
                    <p className="text-xs text-muted-foreground">Changing your email requires support assistance.</p>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(123) 456-7890" />
                </div>
                <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Developer Tools</CardTitle>
              <CardDescription>Switch between user roles for testing.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <Link href="/provider">
                  <Users className="mr-2 h-4 w-4" />
                  Switch to Provider View
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Change your password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                </div>
                 <div className="flex justify-end">
                    <Button>Update Password</Button>
                </div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
                <CardTitle>Communication Preferences</CardTitle>
                <CardDescription>Manage how we communicate with you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive updates about your account and appointments.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <h4 className="font-medium">SMS Notifications</h4>
                    <p className="text-sm text-muted-foreground">Get text reminders for upcoming visits.</p>
                  </div>
                  <Switch />
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <h4 className="font-medium">Promotional Offers</h4>
                    <p className="text-sm text-muted-foreground">Receive news and special offers from ZumaiDoc.</p>
                  </div>
                  <Switch />
                </div>
            </CardContent>
          </Card>
        </div>
      </DashboardContent>
    </DashboardShell>
  );
}
