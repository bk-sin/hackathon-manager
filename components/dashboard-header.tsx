"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Code,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Trophy,
  Users,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useSyncUser } from "@/hooks/useSyncUser";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Hackathons", href: "/hackathons", icon: Trophy },
  { name: "Equipos", href: "/teams", icon: Users },
  { name: "Proyectos", href: "/projects", icon: Code },
  { name: "Mensajes", href: "/messages", icon: MessageSquare },
];

export default function DashboardHeader() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  useSyncUser();
  return (
    <header className="sticky top-0 z-40 border-b bg-background ">
      <div className="container flex h-16 items-center justify-between py-4 justify-self-center px-4 md:px-8">
        <div className="flex items-center gap-4">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Alternar menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <div className="flex items-center gap-2 pb-4 pt-2">
                <Code className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">HackMatch</span>
              </div>
              <nav className="flex flex-col gap-2 pt-4">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2">
            <Code className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold hidden md:inline-block">
              HackMatch
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 text-sm font-medium ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <UserButton userProfileMode="navigation" userProfileUrl="/profile" />
        </div>
      </div>
    </header>
  );
}
