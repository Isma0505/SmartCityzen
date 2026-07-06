'use client';

import { useState, useEffect } from 'react';
import { useStore, type Page } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Building2,
  Bell,
  LogOut,
  Menu,
  LayoutDashboard,
  FilePlus,
  MapPin,
  BarChart3,
  UserCircle,
} from 'lucide-react';

interface NavItem {
  label: string;
  page: Page;
  icon: React.ReactNode;
}

export default function Navbar() {
  const { user, currentPage, navigateTo, logout, unreadCount, setUnreadCount } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLoggedIn = !!user;
  const isAdmin = user?.role === 'ADMIN';

  // Fetch unread notification count
  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const res = await fetch(`/api/notifications?userId=${user.id}&unreadOnly=true`);
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.notifications?.length ?? 0);
        }
      } catch {
        // silently fail
      }
    };
    fetchUnread();
  }, [user, setUnreadCount]);

  const wargaLinks: NavItem[] = [
    { label: 'Dashboard', page: 'dashboard-warga', icon: <LayoutDashboard className="size-4" /> },
    { label: 'Buat Laporan', page: 'buat-laporan', icon: <FilePlus className="size-4" /> },
    { label: 'Peta', page: 'peta', icon: <MapPin className="size-4" /> },
    { label: 'Statistik', page: 'statistik', icon: <BarChart3 className="size-4" /> },
    { label: 'Profil', page: 'profil', icon: <UserCircle className="size-4" /> },
  ];

  const adminLinks: NavItem[] = [
    { label: 'Dashboard Pemerintah', page: 'dashboard-pemerintah', icon: <LayoutDashboard className="size-4" /> },
    { label: 'Peta', page: 'peta', icon: <MapPin className="size-4" /> },
    { label: 'Statistik', page: 'statistik', icon: <BarChart3 className="size-4" /> },
    { label: 'Profil', page: 'profil', icon: <UserCircle className="size-4" /> },
  ];

  const links = isAdmin ? adminLinks : wargaLinks;

  const handleNav = (page: Page) => {
    navigateTo(page);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
  };

  const isActive = (page: Page) => currentPage === page;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <button
          onClick={() => handleNav(isLoggedIn ? (isAdmin ? 'dashboard-pemerintah' : 'dashboard-warga') : 'landing')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Building2 className="size-6 text-emerald-600" />
          <span className="text-lg font-bold text-emerald-600 tracking-tight">
            Smart<span className="text-emerald-800">Cityzen</span>
          </span>
        </button>

        {/* Desktop Nav Links (logged in) */}
        {isLoggedIn && (
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <button
                key={link.page}
                onClick={() => handleNav(link.page)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.page)
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {link.icon}
                {link.label}
              </button>
            ))}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2">
          {!isLoggedIn ? (
            <>
              {/* Not logged in: Masuk & Daftar */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => handleNav('login')}
              >
                Masuk
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => handleNav('register')}
              >
                Daftar
              </Button>
            </>
          ) : (
            <>
              {/* Notification bell (WARGA only) */}
              {!isAdmin && (
                <button
                  onClick={() => handleNav('dashboard-warga')}
                  className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Notifikasi"
                >
                  <Bell className="size-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center size-4 rounded-full bg-red-500 text-white text-[10px] font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              )}

              {/* User name + Keluar (desktop) */}
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm font-medium text-foreground max-w-[140px] truncate">
                  {user.name}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive hover:text-destructive">
                  <LogOut className="size-4" />
                  <span className="hidden lg:inline">Keluar</span>
                </Button>
              </div>
            </>
          )}

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="size-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Building2 className="size-5 text-emerald-600" />
                  <span className="text-emerald-600">SmartCityzen</span>
                </SheetTitle>
              </SheetHeader>

              {isLoggedIn ? (
                <div className="flex flex-col gap-1 mt-2">
                  {/* User info */}
                  <div className="px-3 py-2 mb-2 border-b">
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <Badge
                      variant="outline"
                      className={`mt-1.5 text-xs ${isAdmin ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}
                    >
                      {user.role}
                    </Badge>
                  </div>

                  {/* Nav links */}
                  {links.map((link) => (
                    <SheetClose asChild key={link.page}>
                      <button
                        onClick={() => handleNav(link.page)}
                        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                          isActive(link.page)
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        {link.icon}
                        {link.label}
                      </button>
                    </SheetClose>
                  ))}

                  {/* Logout */}
                  <div className="border-t mt-4 pt-4">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium text-destructive hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="size-4" />
                      Keluar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 mt-6 px-1">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleNav('login')}
                  >
                    Masuk
                  </Button>
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleNav('register')}
                  >
                    Daftar
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}