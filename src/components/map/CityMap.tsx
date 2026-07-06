'use client';

import { useEffect, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Filter, Layers } from 'lucide-react';
import { useStore } from '@/store/useStore';

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

// This component is loaded entirely client-side via dynamic import
function MapInner({ reports }: { reports: Report[] }) {
  const [MapContainer, setMapContainer] = useState<React.ComponentType<any> | null>(null);
  const [TileLayer, setTileLayer] = useState<React.ComponentType<any> | null>(null);
  const [Marker, setMarker] = useState<React.ComponentType<any> | null>(null);
  const [Popup, setPopup] = useState<React.ComponentType<any> | null>(null);
  const [L, setL] = useState<any>(null);
  const [icons, setIcons] = useState<Record<string, any>>({});

  useEffect(() => {
    async function loadLeaflet() {
      // Load Leaflet library
      const leaflet = await import('leaflet');
      const reactLeaflet = await import('react-leaflet');

      // Fix default icon issue
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Create custom colored icons
      const newIcons: Record<string, any> = {};
      for (const [status, color] of Object.entries(STATUS_COLORS)) {
        newIcons[status] = leaflet.divIcon({
          html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${color}" stroke="white" stroke-width="1.5"/>
            <circle cx="12" cy="9" r="3" fill="white"/>
          </svg>`,
          className: '',
          iconSize: [28, 28],
          iconAnchor: [14, 28],
          popupAnchor: [0, -28],
        });
      }

      setL(leaflet);
      setMapContainer(() => reactLeaflet.MapContainer);
      setTileLayer(() => reactLeaflet.TileLayer);
      setMarker(() => reactLeaflet.Marker);
      setPopup(() => reactLeaflet.Popup);
      setIcons(newIcons);
    }
    loadLeaflet();
  }, []);

  if (!MapContainer || !TileLayer || !Marker || !Popup || !L) {
    return <MapSkeleton />;
  }

  return (
    <MapContainer
      center={WONOSOBO_CENTER}
      zoom={DEFAULT_ZOOM}
      className="w-full h-full"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {reports.map((report) => (
        <Marker
          key={report.id}
          position={[report.latitude, report.longitude]}
          icon={icons[report.status] || undefined}
        >
          <Popup maxWidth={280} minWidth={200}>
            <div style={{ fontFamily: 'var(--font-sans, system-ui, sans-serif)', fontSize: '14px' }}>
              <h3 style={{ fontWeight: 600, margin: '0 0 6px', color: '#111827', lineHeight: 1.3 }}>
                {report.title}
              </h3>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '2px 8px', borderRadius: 9999, fontSize: 10, fontWeight: 600,
                  border: `1px solid`,
                  backgroundColor: STATUS_COLORS[report.status] + '20',
                  color: STATUS_COLORS[report.status],
                }}>
                  {STATUS_LABELS[report.status]}
                </span>
                <span style={{
                  padding: '2px 8px', borderRadius: 9999, fontSize: 10,
                  backgroundColor: '#f4f4f5', color: '#71717a',
                }}>
                  {report.category}
                </span>
              </div>
              {report.address && (
                <p style={{ margin: 0, fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                  📍 {report.address}
                </p>
              )}
              <p style={{ margin: '4px 0 0', fontSize: 10, color: '#9ca3af' }}>
                {new Date(report.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default function CityMap() {
  const { navigateTo, setSelectedReportId } = useStore();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<ReportStatus | 'SEMUA'>('SEMUA');
  const [mapLoaded, setMapLoaded] = useState(false);

  // Load Leaflet CSS via link tag
  useEffect(() => {
    if (document.getElementById('leaflet-css')) {
      setMapLoaded(true);
      return;
    }
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = '/leaflet.css';
    link.onload = () => setMapLoaded(true);
    document.head.appendChild(link);
    // Fallback in case onload doesn't fire
    const timer = setTimeout(() => setMapLoaded(true), 2000);
    return () => clearTimeout(timer);
  }, []);

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
              {mapLoaded && <MapInner reports={filteredReports} />}

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