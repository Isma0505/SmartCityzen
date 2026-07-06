'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Clock,
  User,
  MessageSquare,
  MapPin,
  Tag,
  Sparkles,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';

interface ReportData {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  category: string;
  status: string;
  priority: string;
  aiSummary: string | null;
  address: string | null;
  history: Array<{
    id: string;
    status: string;
    comment: string | null;
    createdAt: string;
    user: {
      id: string;
      name: string;
      role: string;
    };
  }>;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

const STATUS_FLOW = ['DITERIMA', 'DIPROSES', 'DALAM_PERBAIKAN', 'SELESAI'];

const STATUS_LABELS: Record<string, string> = {
  DITERIMA: 'Diterima',
  DIPROSES: 'Diproses',
  DALAM_PERBAIKAN: 'Dalam Perbaikan',
  SELESAI: 'Selesai',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  DITERIMA: <AlertCircle className="h-4 w-4" />,
  DIPROSES: <Clock className="h-4 w-4" />,
  DALAM_PERBAIKAN: <Sparkles className="h-4 w-4" />,
  SELESAI: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TrackingPage() {
  const { selectedReportId, navigateTo } = useStore();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedReportId) {
      setError('ID laporan tidak ditemukan');
      setLoading(false);
      return;
    }

    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/reports/${selectedReportId}`);
        if (!res.ok) {
          setError('Laporan tidak ditemukan');
          return;
        }
        const data = await res.json();
        setReport(data);
      } catch {
        setError('Gagal memuat data laporan');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [selectedReportId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="mx-auto max-w-lg space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="flex flex-col items-center gap-3 p-8">
            <AlertCircle className="h-10 w-10 text-slate-300" />
            <p className="text-sm text-slate-500 text-center">{error || 'Data tidak tersedia'}</p>
            <Button variant="outline" onClick={() => navigateTo('dashboard-warga')} className="mt-2">
              Kembali ke Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStatusIndex = STATUS_FLOW.indexOf(report.status);

  // Map history events by status for display
  const historyByStatus = new Map<string, typeof report.history[0]>();
  for (const h of report.history) {
    if (!historyByStatus.has(h.status)) {
      historyByStatus.set(h.status, h);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-lg">
        {/* Back button */}
        <button
          onClick={() => navigateTo('dashboard-warga')}
          className="mb-4 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </button>

        {/* Report Summary Card */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {report.imageUrl && (
                <img
                  src={report.imageUrl}
                  alt={report.title}
                  className="h-20 w-20 shrink-0 rounded-lg border border-slate-200 object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold text-slate-900 line-clamp-2">{report.title}</h2>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <Tag className="mr-1 h-3 w-3" />
                    {report.category}
                  </Badge>
                  <Badge
                    className={`text-xs ${
                      report.status === 'SELESAI'
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent'
                        : report.status === 'DALAM_PERBAIKAN'
                        ? 'bg-amber-500 hover:bg-amber-600 text-white border-transparent'
                        : 'bg-slate-700 hover:bg-slate-800 text-white border-transparent'
                    }`}
                  >
                    {report.status}
                  </Badge>
                </div>
                {report.address && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="h-3 w-3" />
                    {report.address}
                  </p>
                )}
              </div>
            </div>

            {report.aiSummary && (
              <>
                <Separator className="my-3" />
                <div className="flex items-start gap-2 rounded-lg bg-teal-50 border border-teal-200 p-2.5">
                  <Sparkles className="h-4 w-4 mt-0.5 text-teal-600 shrink-0" />
                  <p className="text-xs text-teal-700 leading-relaxed">{report.aiSummary}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Timeline Header */}
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700 uppercase tracking-wider">
          <Clock className="h-4 w-4" />
          Status Pelacakan
        </h3>

        {/* Vertical Timeline */}
        <Card className="shadow-lg overflow-hidden">
          <CardContent className="p-6">
            <div className="relative">
              {STATUS_FLOW.map((status, index) => {
                const isCompleted = index < currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const isPending = index > currentStatusIndex;
                const historyEntry = historyByStatus.get(status);

                return (
                  <div key={status} className="relative flex gap-4 pb-8 last:pb-0">
                    {/* Vertical Line */}
                    {index < STATUS_FLOW.length - 1 && (
                      <div className="absolute left-[15px] top-8 h-[calc(100%-16px)] w-0.5">
                        <div
                          className={`h-full w-full ${
                            isCompleted || isCurrent
                              ? 'bg-emerald-500'
                              : 'bg-slate-200'
                          }`}
                        />
                      </div>
                    )}

                    {/* Dot */}
                    <div
                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        isCompleted
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : isCurrent
                          ? 'border-emerald-500 bg-white text-emerald-600 shadow-md shadow-emerald-200'
                          : 'border-slate-200 bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isCurrent && (
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-30" />
                      )}
                      <span className="relative">{STATUS_ICONS[status]}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold ${
                            isCompleted
                              ? 'text-slate-700'
                              : isCurrent
                              ? 'text-emerald-700'
                              : 'text-slate-400'
                          }`}
                        >
                          {STATUS_LABELS[status]}
                        </span>
                        {isCurrent && (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">
                            Saat ini
                          </Badge>
                        )}
                      </div>

                      {historyEntry ? (
                        <div className="mt-1.5 space-y-1">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Clock className="h-3 w-3" />
                            {formatDate(historyEntry.createdAt)}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <User className="h-3 w-3" />
                            {historyEntry.user.name}
                            {historyEntry.user.role === 'ADMIN' && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                                Admin
                              </Badge>
                            )}
                          </div>
                          {historyEntry.comment && (
                            <div className="flex items-start gap-2 mt-1 rounded-md bg-slate-50 border border-slate-100 p-2">
                              <MessageSquare className="h-3 w-3 mt-0.5 text-slate-400 shrink-0" />
                              <p className="text-xs text-slate-600">{historyEntry.comment}</p>
                            </div>
                          )}
                        </div>
                      ) : isPending ? (
                        <p className="mt-1.5 text-xs text-slate-400 italic">Menunggu...</p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}