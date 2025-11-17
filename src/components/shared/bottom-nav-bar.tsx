
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type MenuItem = {
    href: string;
    label: string;
    icon: LucideIcon;
}

type BottomNavBarProps = {
    menuItems: MenuItem[];
}

export function BottomNavBar({ menuItems }: BottomNavBarProps) {
    const pathname = usePathname();
    const gridColsClass = `grid-cols-${menuItems.length}`;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t bg-background/95 backdrop-blur-sm md:hidden">
            <div className={cn("grid h-full", `grid-cols-${menuItems.length}`)}>
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
            </div>
        </nav>
    )
}
