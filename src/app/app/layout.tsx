
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/shared/logo";
import {
  Home,
  User,
  LogOut,
  LifeBuoy,
  CalendarClock,
  Video,
  Loader2,
  DollarSign,
  Mail,
} from "lucide-react";
import { useUser, useAuth, useFirestore } from "@/firebase";
import { sendEmailVerification, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { BottomNavBar } from "@/components/shared/bottom-nav-bar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";


const menuItems = [
    { href: "/app", label: "Dashboard", icon: Home },
    { href: "/app/book-visit", label: "Book a Visit", icon: Video },
    { href: "/app/visits", label: "My Visits", icon: CalendarClock },
    { href: "/app/billing", label: "Billing", icon: DollarSign },
    { href: "/app/account", label: "Account", icon: User },
];

export default function PatientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore(); // Get firestore instance
  const router = useRouter();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);


  const isLoading = isUserLoading || !firestore;

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };
  
  const handleResendVerification = async () => {
    if (!user) {
        toast({ variant: "destructive", title: "Not Logged In", description: "You must be logged in to resend a verification email."});
        return;
    }
    setIsResending(true);
    try {
        await sendEmailVerification(user);
        toast({
            title: "Email Sent!",
            description: "A new verification email has been sent to your address. Please check your inbox."
        });
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error Sending Email",
            description: error.message || "Could not send the verification email. Please try again later."
        });
    } finally {
        setIsResending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  className="w-full"
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="gap-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <LifeBuoy />
                <span>Support</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="w-full"
                >
                  <LogOut />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
          </SidebarMenu>
          {user && (
            <div className="flex items-center gap-2 rounded-md p-2 bg-sidebar-accent">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? ''}/>
                <AvatarFallback>
                    {user.displayName ? user.displayName.charAt(0) : user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{user.displayName ?? 'User'}</p>
                <p className="truncate text-xs text-sidebar-foreground/70">{user.email}</p>
              </div>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1">
                <h1 className="text-xl font-headline">Patient Portal</h1>
            </div>
             {user.email && !user.emailVerified && (
                <div className="flex items-center gap-2 text-xs text-destructive-foreground bg-destructive p-2 rounded-md">
                    <span>Please verify your email address.</span>
                     <Button
                        size="sm"
                        variant="destructive"
                        className="h-auto px-2 py-0.5 border border-destructive-foreground/50 hover:bg-destructive/80"
                        onClick={handleResendVerification}
                        disabled={isResending}
                    >
                        {isResending ? <Loader2 className="h-4 w-4 animate-spin"/> : <><Mail className="mr-1 h-3 w-3"/> Resend Email</>}
                    </Button>
                </div>
             )}
        </header>
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</main>
        <BottomNavBar menuItems={menuItems} />
      </SidebarInset>
    </SidebarProvider>
  );
}
