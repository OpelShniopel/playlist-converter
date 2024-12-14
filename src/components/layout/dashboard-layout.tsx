"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  HomeIcon,
  MusicalNoteIcon,
  ArrowPathIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType; // For HeroIcon components
}

interface SidebarContentProps {
  navigation: NavigationItem[];
  user: {
    photoURL?: string;
    displayName?: string;
    email?: string;
  };
  signOut: () => Promise<void>;
  onClose?: () => void; // Optional since desktop sidebar doesn't use it
}
export default function DashboardLayout({
  children,
}: Readonly<DashboardLayoutProps>) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    {
      name: "My Playlists",
      href: "/dashboard/playlists",
      icon: MusicalNoteIcon,
    },
    {
      name: "Conversions",
      href: "/dashboard/conversions",
      icon: ArrowPathIcon,
    },
    { name: "Profile", href: "/dashboard/profile", icon: UserIcon },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <button
          className="fixed top-4 left-4 z-50 p-2 rounded-md bg-card text-card-foreground shadow-lg"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>

        {sidebarOpen && (
          <div className="fixed inset-0 z-40">
            <div
              className="fixed inset-0 bg-black/30 dark:bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border shadow-lg">
              <SidebarContent
                navigation={navigation}
                user={user}
                signOut={signOut}
                onClose={() => setSidebarOpen(false)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-card border-r border-border">
          <SidebarContent
            navigation={navigation}
            user={user}
            signOut={signOut}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  navigation,
  user,
  signOut,
  onClose,
}: Readonly<SidebarContentProps>) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 mb-5">
          <h1 className="text-xl font-bold text-foreground">
            Playlist Converter
          </h1>
        </div>
        <nav className="mt-5 flex-1 space-y-1 px-2">
          {navigation.map((item: NavigationItem) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <item.icon
                className="mr-3 flex-shrink-0 h-6 w-6 text-muted-foreground group-hover:text-foreground"
                aria-hidden="true"
              />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex-shrink-0 flex border-t border-border p-4">
        <div className="flex items-center">
          {user.photoURL ? (
            <img
              className="inline-block h-8 w-8 rounded-full"
              src={user.photoURL}
              alt=""
            />
          ) : (
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <span className="text-sm font-medium text-primary-foreground">
                {user.displayName?.charAt(0) ?? user.email?.charAt(0)}
              </span>
            </div>
          )}
          <div className="ml-3">
            <p className="text-sm font-medium text-foreground">
              {user.displayName ?? user.email}
            </p>
            <button
              onClick={() => signOut()}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
