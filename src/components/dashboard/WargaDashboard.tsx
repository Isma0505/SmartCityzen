'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  MapPin,
  Bell,
  Star,
  ChevronRight,
  Inbox,
} from 'lucide-react';
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

const STATUS_BADGE_CLASSES: Record<ReportStatus, string> = {
  DITERIMA: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30',
  DIPROSES: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/15 dark:text-yellow-400 dark:border-yellow-500/30',
  DALAM_PERBAIKAN: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/30',
  SELESAI: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/15 dark:text-green-400 dark:border-green-500/30',
};

const STATUS_DOT_CLASSES: Record<ReportStatus, string> = {
  DITERIMA: 'bg-red-500',
  DIPROSES: 'bg-yellow-500',
  DALAM_PERBAIKAN: 'bg-orange-500',
  SELESAI: 'bg-green-500',
};

const PRIORITY_LABELS: Record<string, string> = {
  RENDAH: 'Rendah',
  SEDANG: 'Sedang',
  TINGGI: 'Tinggi',
};

const PRIORITY_BADGE_CLASSES: Record<string, string> = {
  RENDAH: 'bg-slate-100 text-slate-600 border-slate-200',
  SEDANG: 'bg-amber-100 text-amber-700 border-amber-200',
  TINGGI: 'bg-red-100 text-red-700 border-red-200',
};

function StatsCard({
  icon: Icon,
  label,
  value,
  color,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  loading: boolean;
}) {
  return (
    <Card className="py-4">
      <CardContent className="flex items-center gap-3 px-4">
        <div
          className="flex items-center justify-center size-10 rounded-lg shrink-0"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="size-5" style={{ color }} />
        </div>
        <div className="min-w-0">
          {loading ? (
            <Skeleton className="h-7 w-8 mb-1" />
          ) : (
            <p className="text-2xl font-bold leading-tight tabular-nums">{value}</p>
          )}
          <p className="text-xs text-muted-foreground truncate">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function ReportCard({ report, onClick }: { report: Report; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h4 className="font-medium text-sm leading-snug line-clamp-1 group-hover:text-primary transition-colors">
          {report.title}
        </h4>
        <ChevronRight className="size-4 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="flex items-center gap-1.5 flex-wrap mb-2">
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-medium">
          {report.category}
        </Badge>
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0 rounded-full text-[10px] font-semibold border ${STATUS_BADGE_CLASSES[report.status]}`}
        >
          <span className={`size-1.5 rounded-full ${STATUS_DOT_CLASSES[report.status]}`} />
          {STATUS_LABELS[report.status]}
        </span>
        <span
          className={`inline-flex items-center px-1.5 py-0 rounded-full text-[10px] font-medium border ${PRIORITY_BADGE_CLASSES[report.priority] || PRIORITY_BADGE_CLASSES.SEDANG}`}
        >
          {PRIORITY_LABELS[report.priority] || report.priority}
        </span>
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="size-3" />
          {formatDate(report.createdAt)}
        </span>
        {report._count && report._count.comments > 0 && (
          <span className="flex items-center gap-0.5">
            <Bell className="size-3" />
            {report._count.comments}
          </span>
        )}
      </div>
    </button>
  );
}

export default function WargaDashboard() {
  const { user, navigateTo, setSelectedReportId, refreshReports } = useStore();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/reports?userId=${user.id}&role=WARGA`);
      if (res.ok) {
        const data = await res.json();
        setReports(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch user reports:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports, refreshReports]);

  // Stats calculations
  const totalReports = reports.length;
  const menungguCount = reports.filter((r) => r.status === 'DITERIMA').length;
  const diprosesCount = reports.filter(
    (r) => r.status === 'DIPROSES' || r.status === 'DALAM_PERBAIKAN'
  ).length;
  const selesaiCount = reports.filter((r) => r.status === 'SELESAI').length;

  const handleReportClick = (reportId: string) => {
    setSelectedReportId(reportId);
    navigateTo('report-detail');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Selamat Datang, {user?.name || 'Warga'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Pantau laporan dan kontribusi Anda untuk Banjarnegara yang lebih baik.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-full">
          <Star className="size-4 fill-amber-500 text-amber-500" />
          <span className="text-sm font-semibold">{user?.points || 0} Poin</span>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard
          icon={FileText}
          label="Total Laporan"
          value={totalReports}
          color="#6366f1"
          loading={loading}
        />
        <StatsCard
          icon={AlertCircle}
          label="Menunggu"
          value={menungguCount}
          color="#ef4444"
          loading={loading}
        />
        <StatsCard
          icon={Clock}
          label="Diproses"
          value={diprosesCount}
          color="#eab308"
          loading={loading}
        />
        <StatsCard
          icon={CheckCircle}
          label="Selesai"
          value={selesaiCount}
          color="#22c55e"
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          size="lg"
          className="h-auto py-4 px-5 gap-3 text-base font-semibold shadow-md hover:shadow-lg transition-all"
          onClick={() => navigateTo('buat-laporan')}
        >
          <div className="flex items-center justify-center size-9 rounded-lg bg-white/20">
            <Plus className="size-5" />
          </div>
          <div className="text-left">
            <div>Buat Laporan Baru</div>
            <div className="text-xs font-normal opacity-80">Laporkan masalah di sekitar Anda</div>
          </div>
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="h-auto py-4 px-5 gap-3 text-base font-semibold border-2 hover:bg-accent/50 transition-all"
          onClick={() => navigateTo('peta')}
        >
          <div className="flex items-center justify-center size-9 rounded-lg bg-primary/10">
            <MapPin className="size-5 text-primary" />
          </div>
          <div className="text-left">
            <div>Lihat Peta Kota</div>
            <div className="text-xs font-normal text-muted-foreground">
              Lihat laporan di peta interaktif
            </div>
          </div>
        </Button>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Laporan Terbaru Anda</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {loading
                  ? 'Memuat...'
                  : `${reports.length} laporan tercatat`}
              </CardDescription>
            </div>
            {reports.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {reports.length}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 rounded-lg border space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="flex items-center justify-center size-14 rounded-full bg-muted mb-3">
                <Inbox className="size-7 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-sm mb-1">Belum ada laporan</h3>
              <p className="text-xs text-muted-foreground mb-4 max-w-[240px]">
                Mulai laporkan masalah infrastruktur atau pelayanan publik di sekitar Anda.
              </p>
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => navigateTo('buat-laporan')}
              >
                <Plus className="size-3.5" />
                Buat Laporan Pertama
              </Button>
            </div>
          ) : (
            <ScrollArea className="max-h-96 overflow-y-auto">
              <div className="space-y-2 pr-1">
                {reports.slice(0, 10).map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onClick={() => handleReportClick(report.id)}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}