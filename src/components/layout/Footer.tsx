'use client';

import { Building2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t bg-gray-50 py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <Building2 className="size-3.5 text-emerald-500" />
          <p className="text-sm text-muted-foreground font-medium">
            © 2025 SmartCityzen Wonosobo. Platform Aspirasi & Pelaporan Kota.
          </p>
        </div>
        <p className="text-xs text-muted-foreground/70">
          Dibuat untuk masyarakat Wonosobo
        </p>
      </div>
    </footer>
  );
}