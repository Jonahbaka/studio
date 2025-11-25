'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useAuth } from '@/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
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
import { Loader2, Mail, AlertCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { sendEmailVerification } from 'firebase/auth';

export default function AccountSettingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();

  // Personal info state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Notification preferences state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [promotionalOffers, setPromotionalOffers] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  // Load user data from Firestore
  useEffect(() => {
    async function loadUserData() {
      if (!user || !firestore) return;

      try {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFirstName(data.firstName || '');
          setLastName(data.lastName || '');
          setEmail(data.email || user.email || '');
          setPhone(data.phoneNumber || data.phone || '');
          setDateOfBirth(data.dateOfBirth || '');

          // Load notification preferences
          if (data.notificationPreferences) {
            setEmailNotifications(data.notificationPreferences.email ?? true);
            setSmsNotifications(data.notificationPreferences.sms ?? false);
            setPushNotifications(data.notificationPreferences.push ?? true);
            setPromotionalOffers(data.notificationPreferences.promotional ?? false);
          }
        } else {
          // Fallback to display name parsing
          const nameParts = user.displayName?.split(' ') || ['', ''];
          setFirstName(nameParts[0] || '');
          setLastName(nameParts.slice(1).join(' ') || '');
          setEmail(user.email || '');
        }
      } catch (error: any) {
        // Silently handle permission errors - user may not have document yet
        if (error.code !== 'permission-denied') {
          console.error('Error loading user data:', error);
        }
        // Fallback to display name parsing
        const nameParts = user.displayName?.split(' ') || ['', ''];
        setFirstName(nameParts[0] || '');
        setLastName(nameParts.slice(1).join(' ') || '');
        setEmail(user.email || '');
      }
    }

    loadUserData();
  }, [user, firestore]);

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
      await setDoc(userProfileRef, {
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`.trim(),
        phoneNumber: phone,
        dateOfBirth,
        updatedAt: new Date(),
      }, { merge: true });

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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !auth) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to change your password.",
      });
      return;
    }

    if (!currentPassword || !newPassword) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all password fields.",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        variant: "destructive",
        title: "Weak Password",
        description: "Password must be at least 8 characters long.",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });

      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      console.error("Error changing password:", error);

      let errorMessage = "Could not change your password.";
      if (error.code === 'auth/wrong-password') {
        errorMessage = "Current password is incorrect.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "New password is too weak.";
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = "Please log out and log back in before changing your password.";
      }

      toast({
        variant: "destructive",
        title: "Password Change Failed",
        description: errorMessage,
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleNotificationPreferencesUpdate = async () => {
    if (!user || !firestore) return;

    setIsSavingPreferences(true);
    try {
      const userProfileRef = doc(firestore, 'users', user.uid);
      await updateDoc(userProfileRef, {
        notificationPreferences: {
          email: emailNotifications,
          sms: smsNotifications,
          push: pushNotifications,
          promotional: promotionalOffers,
        },
        updatedAt: new Date(),
      });

      toast({
        title: "Preferences Saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error: any) {
      console.error("Error updating preferences:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not save your notification preferences.",
      });
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handleResendVerification = async () => {
    if (!user) return;

    try {
      await sendEmailVerification(user);
      toast({
        title: "Verification Email Sent",
        description: "Please check your inbox and spam folder.",
      });
    } catch (error) {
      console.error("Error sending verification email:", error);
      toast({
        variant: "destructive",
        title: "Failed to Send Email",
        description: "Please try again later.",
      });
    }
  };

  if (isUserLoading) {
    return (
      <DashboardShell>
        <DashboardHeader>
          <DashboardHeaderTitle>Account Settings</DashboardHeaderTitle>
        </DashboardHeader>
        <DashboardContent>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DashboardContent>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <DashboardHeader>
        <DashboardHeaderTitle>Patient Portal</DashboardHeaderTitle>
        <CardDescription>Manage your account details and preferences.</CardDescription>
      </DashboardHeader>
      <DashboardContent>
        <div className="grid gap-6">
          {/* Email Verification Alert */}
          {user && !user.emailVerified && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Please verify your email address.</span>
                <Button variant="outline" size="sm" onClick={handleResendVerification}>
                  <Mail className="mr-2 h-4 w-4" />
                  Resend Email
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your name, email, phone number, and date of birth.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jonah"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Baka"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jonahbaka00@gmail.com"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">Changing your email requires support assistance.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(123) 456-7890"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
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

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Change your password.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter a new password (min 8 characters)"
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isChangingPassword}>
                    {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Communication Preferences */}
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
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={(checked) => {
                    setEmailNotifications(checked);
                    handleNotificationPreferencesUpdate();
                  }}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h4 className="font-medium">Push Notifications</h4>
                  <p className="text-sm text-muted-foreground">Get browser notifications for important updates.</p>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={(checked) => {
                    setPushNotifications(checked);
                    handleNotificationPreferencesUpdate();
                  }}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h4 className="font-medium">SMS Notifications</h4>
                  <p className="text-sm text-muted-foreground">Get text reminders for upcoming visits.</p>
                </div>
                <Switch
                  checked={smsNotifications}
                  onCheckedChange={(checked) => {
                    setSmsNotifications(checked);
                    handleNotificationPreferencesUpdate();
                  }}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h4 className="font-medium">Promotional Offers</h4>
                  <p className="text-sm text-muted-foreground">Receive news and special offers from ZumaiDoc.</p>
                </div>
                <Switch
                  checked={promotionalOffers}
                  onCheckedChange={(checked) => {
                    setPromotionalOffers(checked);
                    handleNotificationPreferencesUpdate();
                  }}
                />
              </div>

              {isSavingPreferences && (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Saving preferences...</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardContent>
    </DashboardShell>
  );
}
