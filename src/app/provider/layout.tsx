
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
  LayoutDashboard,
  Users,
  Calendar,
  LogOut,
  LifeBuoy,
  Loader2,
  Search,
  Shield,
} from "lucide-react";
import { DashboardHeaderActions } from "@/components/dashboard-shell";
import { Input } from "@/components/ui/input";
import { useUser, useAuth, useFirestore } from "@/firebase";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";


const menuItems = [
    { href: "/provider", label: "Dashboard", icon: LayoutDashboard },
    { href: "/provider/queue", label: "Waiting Room", icon: Users },
    { href: "/provider/schedule", label: "Schedule", icon: Calendar },
];

function BottomNavBar() {
    const pathname = usePathname();
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t bg-background/95 backdrop-blur-sm md:hidden">
            <div className="grid h-full grid-cols-4">
                {menuItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 text-xs font-medium",
                            pathname === item.href ? 'text-primary' : 'text-muted-foreground'
                        )}
                    >
                        <item.icon className="h-5 w-5"/>
                        <span>{item.label}</span>
                    </Link>
                ))}
                 <Link
                    href="/app"
                    className={cn(
                        "flex flex-col items-center justify-center gap-1 text-xs font-medium",
                        'text-muted-foreground'
                    )}
                >
                    <Users className="h-5 w-5" />
                    <span>Patient</span>
                </Link>
            </div>
        </nav>
    )
}

export default function ProviderPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const isLoading = isUserLoading || !firestore;

  useEffect(() => {
    // Redirect if loading is complete and there is definitively no user.
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
                <SidebarMenuButton asChild className="w-full" variant="outline">
                    <Link href="/admin">
                        <Shield />
                        <span>Admin Portal</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton asChild className="w-full">
                    <Link href="/app">
                        <Users />
                        <span>Patient Portal</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
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
                <p className="truncate text-sm font-medium">{user.displayName ?? 'Provider'}</p>
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
                <h1 className="text-xl font-headline">Provider Portal</h1>
            </div>
             <DashboardHeaderActions>
                <div className="relative hidden md:block w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                    <Input placeholder="Search patients..." className="pl-10"/>
                </div>
                <Button variant="outline" className="hidden md:inline-flex">Start Walk-in Visit</Button>
            </DashboardHeaderActions>
        </header>
        <main className="flex-1 p-4 md:p-6 bg-background pb-20 md:pb-6">{children}</main>
        <BottomNavBar />
      </SidebarInset>
    </SidebarProvider>
  );
}
