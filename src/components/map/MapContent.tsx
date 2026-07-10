'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Badge } from '@/components/ui/badge';
import { MapPin, Layers } from 'lucide-react';

// Banjarnegara Regency Government Office (Kantor Bupati Banjarnegara)
const BANJARNEGARA_CENTER: [number, number] = [-7.3524, 109.7091];
const DEFAULT_ZOOM = 13;

type ReportStatus = 'DITERIMA' | 'DIPROSES' | 'DALAM_PERBAIKAN' | 'SELESAI';

export interface MapReport {
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

// Fix Leaflet default icon issue (broken images in Next.js)
function fixLeafletIcons() {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

// Create colored marker icons for different statuses
function createStatusIcon(color: string) {
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="12" cy="9" r="3" fill="white"/>
    </svg>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

// Center marker icon for Banjarnegara
function createCenterIcon() {
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#059669" stroke="white" stroke-width="2"/>
      <text x="12" y="11" text-anchor="middle" fill="white" font-size="7" font-weight="bold" font-family="system-ui">W</text>
    </svg>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
}

const statusIcons: Record<string, L.DivIcon> = {};
const centerIcon = createCenterIcon();

// Initialize icons once
for (const [status, color] of Object.entries(STATUS_COLORS)) {
  statusIcons[status] = createStatusIcon(color);
}

interface MapContentProps {
  reports: MapReport[];
  filteredCount: number;
  activeFilterLabel: string;
  statusCounts: Record<string, number>;
}

export default function MapContent({ reports, filteredCount, activeFilterLabel, statusCounts }: MapContentProps) {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  return (
    <>
      <MapContainer
        center={BANJARNEGARA_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full rounded-xl"
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Banjarnegara center marker */}
        <Marker position={BANJARNEGARA_CENTER} icon={centerIcon}>
          <Popup>
            <div style={{ fontFamily: 'system-ui, sans-serif', fontSize: '14px', textAlign: 'center' }}>
              <strong style={{ color: '#059669', fontSize: '15px' }}>🏛️ Banjarnegara</strong>
              <br />
              <span style={{ color: '#6b7280', fontSize: '12px' }}>Kabupaten Banjarnegara, Jawa Tengah</span>
            </div>
          </Popup>
        </Marker>

        {/* Report markers */}
        {reports.map((report) => (
          <Marker
            key={report.id}
            position={[report.latitude, report.longitude]}
            icon={statusIcons[report.status] || undefined}
          >
            <Popup maxWidth={280} minWidth={200}>
              <div style={{ fontFamily: 'system-ui, sans-serif', fontSize: '14px' }}>
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
            {filteredCount} laporan
            {activeFilterLabel && ` (${activeFilterLabel})`}
          </span>
        </Badge>
      </div>

      {/* Banjarnegara label */}
      <div className="absolute top-4 right-4 z-[1000]">
        <Badge className="bg-emerald-600 text-white shadow-sm gap-1.5 px-3 py-1 border-0">
          <MapPin className="size-3.5" />
          <span className="text-xs font-semibold">Kab. Banjarnegara</span>
        </Badge>
      </div>
    </>
  );
}
