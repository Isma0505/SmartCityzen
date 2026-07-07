'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Filter, MapPin } from 'lucide-react';
import { useStore } from '@/store/useStore';

type ReportStatus = 'DITERIMA' | 'DIPROSES' | 'DALAM_PERBAIKAN' | 'SELESAI';

interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  status: ReportStatus;
  priority: string;
  latitude: number;
  longitude: number;
  address: string | null;
  createdAt: string;
  _count?: { comments: number; supports: number };
}

const STATUS_LABELS: Record<ReportStatus, string> = {
  DITERIMA: 'Diterima',
  DIPROSES: 'Diproses',
  DALAM_PERBAIKAN: 'Dalam Perbaikan',
  SELESAI: 'Selesai',
};

const STATUS_DOT_CLASSES: Record<ReportStatus, string> = {
  DITERIMA: 'bg-red-500',
  DIPROSES: 'bg-yellow-500',
  DALAM_PERBAIKAN: 'bg-orange-500',
  SELESAI: 'bg-green-500',
};

const FILTER_OPTIONS: { value: ReportStatus | 'SEMUA'; label: string }[] = [
  { value: 'SEMUA', label: 'Semua' },
  { value: 'DITERIMA', label: 'Diterima' },
  { value: 'DIPROSES', label: 'Diproses' },
  { value: 'DALAM_PERBAIKAN', label: 'Dalam Perbaikan' },
  { value: 'SELESAI', label: 'Selesai' },
];

function MapSkeleton() {
  return (
    <div className="w-full h-[500px] md:h-[600px] rounded-xl border bg-muted flex items-center justify-center">
      <div className="text-center space-y-3">
        <Skeleton className="h-10 w-10 rounded-full mx-auto" />
        <Skeleton className="h-4 w-32 mx-auto" />
        <Skeleton className="h-3 w-24 mx-auto" />
      </div>
    </div>
  );
}

// Dynamically import MapContent with SSR disabled - this is the standard pattern for Leaflet in Next.js
const MapContent = dynamic(() => import('./MapContent'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

export default function CityMap() {
  const { navigateTo, setSelectedReportId } = useStore();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<ReportStatus | 'SEMUA'>('SEMUA');

  // Fetch reports
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reports?role=ALL');
      if (res.ok) {
        const data = await res.json();
        setReports(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch reports for map:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const filteredReports =
    activeFilter === 'SEMUA'
      ? reports
      : reports.filter((r) => r.status === activeFilter);

  const statusCounts = reports.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const activeFilterLabel = activeFilter === 'SEMUA' ? '' : STATUS_LABELS[activeFilter];

  return (
    <div className="space-y-4">
      {/* Status Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <div className="flex items-center gap-1.5 text-muted-foreground shrink-0 mr-1">
          <Filter className="size-4" />
          <span className="text-sm font-medium hidden sm:inline">Filter:</span>
        </div>
        {FILTER_OPTIONS.map((opt) => {
          const isActive = activeFilter === opt.value;
          const dotColor =
            opt.value === 'SEMUA'
              ? 'bg-gray-500'
              : STATUS_DOT_CLASSES[opt.value as ReportStatus];
          return (
            <Button
              key={opt.value}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              className={`shrink-0 gap-1.5 text-xs transition-all ${isActive ? 'shadow-sm' : ''}`}
              onClick={() => setActiveFilter(opt.value)}
            >
              <span className={`size-2 rounded-full ${dotColor}`} />
              {opt.label}
              {opt.value !== 'SEMUA' && (
                <span className={`ml-0.5 text-[10px] ${isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {statusCounts[opt.value] || 0}
                </span>
              )}
            </Button>
          );
        })}
      </div>

      {/* Map Container */}
      <Card className="overflow-hidden rounded-xl border shadow-sm">
        <CardContent className="p-0 relative">
          {loading ? (
            <MapSkeleton />
          ) : (
            <div className="w-full h-[500px] md:h-[600px] relative">
              <MapContent
                reports={filteredReports}
                filteredCount={filteredReports.length}
                activeFilterLabel={activeFilterLabel}
                statusCounts={statusCounts}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}