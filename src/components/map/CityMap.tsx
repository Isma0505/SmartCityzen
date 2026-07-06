'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Filter, Layers } from 'lucide-react';
import { useStore } from '@/store/useStore';

// Dynamic imports to avoid SSR issues with Leaflet
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false, loading: () => <MapSkeleton /> }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

const WONOSOBO_CENTER: [number, number] = [-7.3625, 109.7083];
const DEFAULT_ZOOM = 14;

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

const STATUS_COLORS: Record<ReportStatus, string> = {
  DITERIMA: '#ef4444',
  DIPROSES: '#eab308',
  DALAM_PERBAIKAN: '#f97316',
  SELESAI: '#22c55e',
};

const STATUS_LABELS: Record<ReportStatus, string> = {
  DITERIMA: 'Diterima',
  DIPROSES: 'Diproses',
  DALAM_PERBAIKAN: 'Dalam Perbaikan',
  SELESAI: 'Selesai',
};

const STATUS_BG_CLASSES: Record<ReportStatus, string> = {
  DITERIMA: 'bg-red-500/15 text-red-700 border-red-500/30',
  DIPROSES: 'bg-yellow-500/15 text-yellow-700 border-yellow-500/30',
  DALAM_PERBAIKAN: 'bg-orange-500/15 text-orange-700 border-orange-500/30',
  SELESAI: 'bg-green-500/15 text-green-700 border-green-500/30',
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

function createCustomIcon(color: string) {
  if (typeof window === 'undefined') return null;

  // Leaflet must be required at runtime since it's client-only
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const L = require('leaflet');
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="12" cy="9" r="3" fill="white"/>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

export default function CityMap() {
  const { navigateTo } = useStore();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<ReportStatus | 'SEMUA'>('SEMUA');
  const [mapReady, setMapReady] = useState(false);
  const [icons, setIcons] = useState<Record<ReportStatus, any>>({
    DITERIMA: null,
    DIPROSES: null,
    DALAM_PERBAIKAN: null,
    SELESAI: null,
  });

  // Load Leaflet CSS dynamically
  useEffect(() => {
    import('leaflet/dist/leaflet.css');
  }, []);

  // Initialize custom icons once client-side
  useEffect(() => {
    const newIcons = {} as Record<ReportStatus, any>;
    for (const [status, color] of Object.entries(STATUS_COLORS)) {
      newIcons[status as ReportStatus] = createCustomIcon(color);
    }
    setIcons(newIcons);
    setMapReady(true);
  }, []);

  // Fetch reports
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reports?role=ALL');
      if (res.ok) {
        const data = await res.json();
        setReports(data);
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

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {/* Status Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
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
              className={`shrink-0 gap-1.5 text-xs transition-all ${
                isActive ? 'shadow-sm' : ''
              }`}
              onClick={() => setActiveFilter(opt.value)}
            >
              <span className={`size-2 rounded-full ${dotColor}`} />
              {opt.label}
              {opt.value !== 'SEMUA' && (
                <span
                  className={`ml-0.5 text-[10px] ${
                    isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}
                >
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
              {mapReady && (
                <MapContainer
                  center={WONOSOBO_CENTER}
                  zoom={DEFAULT_ZOOM}
                  className="w-full h-full z-0"
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {filteredReports.map((report) => (
                    <Marker
                      key={report.id}
                      position={[report.latitude, report.longitude]}
                      icon={icons[report.status]}
                    >
                      <Popup maxWidth={280} minWidth={200}>
                        <div className="font-sans text-sm space-y-2">
                          <h3 className="font-semibold text-gray-900 leading-tight">
                            {report.title}
                          </h3>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                STATUS_BG_CLASSES[report.status]
                              }`}
                            >
                              <span
                                className={`size-1.5 rounded-full ${
                                  STATUS_DOT_CLASSES[report.status]
                                }`}
                              />
                              {STATUS_LABELS[report.status]}
                            </span>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {report.category}
                            </Badge>
                          </div>
                          {report.address && (
                            <p className="text-gray-500 text-xs flex items-start gap-1">
                              <MapPin className="size-3 mt-0.5 shrink-0" />
                              {report.address}
                            </p>
                          )}
                          <p className="text-gray-400 text-[10px]">
                            {formatDate(report.createdAt)}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}

              {/* Legend Overlay */}
              <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg border shadow-md p-3">
                <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-gray-700">
                  <Layers className="size-3.5" />
                  Legenda Status
                </div>
                <div className="space-y-1.5">
                  {(Object.entries(STATUS_LABELS) as [ReportStatus, string][]).map(
                    ([status, label]) => (
                      <div key={status} className="flex items-center gap-2 text-xs text-gray-600">
                        <span
                          className="size-3 rounded-full shrink-0 border border-white shadow-sm"
                          style={{ backgroundColor: STATUS_COLORS[status] }}
                        />
                        <span>{label}</span>
                        <span className="text-gray-400 ml-auto tabular-nums">
                          {statusCounts[status] || 0}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Report count badge */}
              <div className="absolute top-4 left-4 z-[1000]">
                <Badge variant="secondary" className="bg-white/95 backdrop-blur-sm shadow-sm border gap-1.5 px-3 py-1">
                  <MapPin className="size-3.5" />
                  <span className="text-xs font-medium">
                    {filteredReports.length} laporan
                    {activeFilter !== 'SEMUA' && ` (${STATUS_LABELS[activeFilter]})`}
                  </span>
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}