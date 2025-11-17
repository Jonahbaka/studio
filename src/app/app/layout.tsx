
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
} from "lucide-react";
import { useUser, useAuth, useFirestore } from "@/firebase";
import { signOut } from "firebase/auth";
import { useEffect } from "react";
import { BottomNavBar } from "@/components/shared/bottom-nav-bar";


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

  const isLoading = isUserLoading || !firestore;

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (!isLoading && user && !user.emailVerified) {
        // Optional: you can add a banner or a modal to prompt for verification
        // For now, we allow access but they may be restricted in certain features.
        console.log("User email is not verified.");
    }
  }, [isLoading, user, router]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
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
             {!user.emailVerified && (
                <div className="text-xs text-destructive-foreground bg-destructive p-2 rounded-md">
                    Please verify your email address.
                </div>
             )}
        </header>
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</main>
        <BottomNavBar menuItems={menuItems} />
      </SidebarInset>
    </SidebarProvider>
  );
}
