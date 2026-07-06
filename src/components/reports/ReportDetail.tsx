'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  ThumbsUp,
  MessageSquare,
  Send,
  MapPin,
  Tag,
  Clock,
  User,
  Sparkles,
  TrendingUp,
  Building2,
  Calendar,
  AlertCircle,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  Target,
} from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
    role: string;
  };
}

interface HistoryEntry {
  id: string;
  status: string;
  comment: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
}

interface ReportData {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  category: string;
  status: string;
  priority: string;
  impactLevel: string;
  targetAgency: string | null;
  aiSummary: string | null;
  aiPrediction: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
  comments: Comment[];
  history: HistoryEntry[];
  _count: {
    supports: number;
    comments: number;
  };
}

const STATUS_FLOW: Record<string, string[]> = {
  DITERIMA: ['DIPROSES'],
  DIPROSES: ['DALAM_PERBAIKAN', 'DITERIMA'],
  DALAM_PERBAIKAN: ['SELESAI', 'DIPROSES'],
  SELESAI: [],
};

const STATUS_LABELS: Record<string, string> = {
  DITERIMA: 'Diterima',
  DIPROSES: 'Diproses',
  DALAM_PERBAIKAN: 'Dalam Perbaikan',
  SELESAI: 'Selesai',
};

const priorityStyles: Record<string, string> = {
  TINGGI: 'bg-red-100 text-red-700 border-red-200',
  SEDANG: 'bg-amber-100 text-amber-700 border-amber-200',
  RENDAH: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const statusStyles: Record<string, string> = {
  DITERIMA: 'bg-slate-100 text-slate-700 border-slate-200',
  DIPROSES: 'bg-blue-100 text-blue-700 border-blue-200',
  DALAM_PERBAIKAN: 'bg-amber-100 text-amber-700 border-amber-200',
  SELESAI: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ReportDetail() {
  const { user, selectedReportId, navigateTo, triggerRefreshReports } = useStore();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [supported, setSupported] = useState(false);
  const [supportCount, setSupportCount] = useState(0);
  const [changingStatus, setChangingStatus] = useState(false);
  const [statusComment, setStatusComment] = useState('');
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const fetchReport = useCallback(async () => {
    if (!selectedReportId) {
      setError('ID laporan tidak ditemukan');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/reports/${selectedReportId}`);
      if (!res.ok) {
        setError('Laporan tidak ditemukan');
        return;
      }
      const data = await res.json();
      setReport(data);
      setSupportCount(data._count?.supports || 0);

      // Check if user already supported
      if (user) {
        const res2 = await fetch(`/api/reports/${selectedReportId}/comments`);
        // We can't easily check support status from current API, assume false
      }
    } catch {
      setError('Gagal memuat data laporan');
    } finally {
      setLoading(false);
    }
  }, [selectedReportId, user]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [report?.comments]);

  const handleSupport = async () => {
    if (!user || !selectedReportId) return;
    try {
      const res = await fetch(`/api/reports/${selectedReportId}/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setSupported(data.supported);
        setSupportCount((prev) => (data.supported ? prev + 1 : prev - 1));
      }
    } catch {
      // silent
    }
  };

  const handleComment = async () => {
    if (!user || !selectedReportId || !commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/reports/${selectedReportId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText.trim(), userId: user.id }),
      });
      if (res.ok) {
        setCommentText('');
        fetchReport();
      }
    } catch {
      // silent
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!user || !selectedReportId || user.role !== 'ADMIN') return;
    setChangingStatus(true);
    try {
      const res = await fetch(`/api/reports/${selectedReportId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          comment: statusComment.trim() || null,
          userId: user.id,
        }),
      });
      if (res.ok) {
        setStatusComment('');
        fetchReport();
        triggerRefreshReports();
      } else {
        const data = await res.json();
        setError(data.error || 'Gagal mengubah status');
      }
    } catch {
      setError('Gagal mengubah status');
    } finally {
      setChangingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="mx-auto max-w-4xl space-y-4">
          <Skeleton className="h-8 w-32" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-60 w-full rounded-lg" />
              <Skeleton className="h-40 w-full rounded-lg" />
            </div>
            <Skeleton className="h-80 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="flex flex-col items-center gap-3 p-8">
            <AlertCircle className="h-10 w-10 text-slate-300" />
            <p className="text-sm text-slate-500 text-center">{error}</p>
            <Button variant="outline" onClick={() => navigateTo('dashboard-warga')} className="mt-2">
              Kembali ke Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!report) return null;

  const isAdmin = user?.role === 'ADMIN';
  const allowedTransitions = report.status ? STATUS_FLOW[report.status] || [] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Back button */}
        <button
          onClick={() => navigateTo('dashboard-warga')}
          className="mb-4 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </button>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Left Column - Report Info */}
          <div className="md:col-span-2 space-y-4">
            {/* Main Report Card */}
            <Card className="shadow-lg">
              <CardContent className="p-4 md:p-6">
                {/* Title & Badges */}
                <div className="flex flex-wrap items-start gap-2 mb-3">
                  <h1 className="flex-1 text-xl font-bold text-slate-900 md:text-2xl">
                    {report.title}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge variant="outline" className={statusStyles[report.status] || ''}>
                    {STATUS_LABELS[report.status] || report.status}
                  </Badge>
                  <Badge variant="outline" className={priorityStyles[report.priority] || ''}>
                    <ShieldAlert className="mr-1 h-3 w-3" />
                    Prioritas: {report.priority}
                  </Badge>
                  <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">
                    <Tag className="mr-1 h-3 w-3" />
                    {report.category}
                  </Badge>
                </div>

                {/* Image */}
                {report.imageUrl && (
                  <div className="mb-4 overflow-hidden rounded-lg border border-slate-200">
                    <img
                      src={report.imageUrl}
                      alt={report.title}
                      className="h-auto max-h-80 w-full object-contain bg-slate-50"
                    />
                  </div>
                )}

                {/* Description */}
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Deskripsi
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {report.description}
                  </p>
                </div>

                <Separator className="my-4" />

                {/* Meta Info */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-500">Pelapor:</span>
                    <span className="font-medium text-slate-900">{report.user.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-500">Tanggal:</span>
                    <span className="text-slate-700">{formatDate(report.createdAt)}</span>
                  </div>
                  {report.address && (
                    <div className="flex items-center gap-2 text-sm sm:col-span-2">
                      <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="text-slate-500">Lokasi:</span>
                      <span className="text-slate-700">{report.address}</span>
                    </div>
                  )}
                  {report.targetAgency && (
                    <div className="flex items-center gap-2 text-sm sm:col-span-2">
                      <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="text-slate-500">Dinas:</span>
                      <span className="text-slate-700">{report.targetAgency}</span>
                    </div>
                  )}
                </div>

                {/* Support Button */}
                <div className="mt-4">
                  <Button
                    variant={supported ? 'default' : 'outline'}
                    size="sm"
                    onClick={handleSupport}
                    disabled={!user}
                    className={
                      supported
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                    }
                  >
                    <ThumbsUp className={`mr-1.5 h-4 w-4 ${supported ? 'fill-current' : ''}`} />
                    Dukung
                    <span className="ml-1.5 rounded-full bg-black/10 px-2 py-0.5 text-xs font-semibold">
                      {supportCount}
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI Analysis Section */}
            {(report.aiSummary || report.aiPrediction) && (
              <Card className="shadow-lg border-teal-200 bg-gradient-to-br from-teal-50 to-white">
                <CardHeader className="pb-3 pt-4 px-4 md:px-6">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="h-5 w-5 text-teal-600" />
                    Analisis AI
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 md:px-6 md:pb-6 space-y-3">
                  {report.impactLevel && (
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-500">Tingkat Dampak:</span>
                      <Badge variant="outline" className={priorityStyles[report.impactLevel] || ''}>
                        {report.impactLevel}
                      </Badge>
                    </div>
                  )}
                  {report.aiSummary && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                        Ringkasan
                      </p>
                      <p className="text-sm text-slate-700 leading-relaxed">{report.aiSummary}</p>
                    </div>
                  )}
                  {report.aiPrediction && (
                    <div className="flex items-start gap-2 rounded-lg bg-orange-50 border border-orange-200 p-3">
                      <TrendingUp className="h-4 w-4 mt-0.5 text-orange-600 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-orange-800 uppercase tracking-wider">Prediksi</p>
                        <p className="mt-0.5 text-sm text-orange-700">{report.aiPrediction}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            {report.history && report.history.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader className="pb-3 pt-4 px-4 md:px-6">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="h-5 w-5 text-slate-500" />
                    Riwayat Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
                  <div className="relative space-y-0">
                    {report.history.map((h, index) => (
                      <div key={h.id} className="relative flex gap-3 pb-4 last:pb-0">
                        {/* Line */}
                        {index < report.history.length - 1 && (
                          <div className="absolute left-[11px] top-6 h-[calc(100%-8px)] w-0.5 bg-slate-200" />
                        )}
                        {/* Dot */}
                        <div
                          className={`relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                            index === report.history.length - 1
                              ? 'border-emerald-500 bg-emerald-500 text-white'
                              : 'border-slate-300 bg-white text-slate-400'
                          }`}
                        >
                          {index === report.history.length - 1 ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <div className="h-2 w-2 rounded-full bg-slate-300" />
                          )}
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {STATUS_LABELS[h.status] || h.status}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {formatDate(h.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-500">
                            <User className="h-3 w-3" />
                            {h.user.name}
                            {h.user.role === 'ADMIN' && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 ml-1">
                                Admin
                              </Badge>
                            )}
                          </div>
                          {h.comment && (
                            <p className="mt-1 text-xs text-slate-600 bg-slate-50 rounded px-2 py-1">
                              {h.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Comments & Status Change */}
          <div className="space-y-4">
            {/* Admin Status Change */}
            {isAdmin && allowedTransitions.length > 0 && (
              <Card className="shadow-lg border-amber-200">
                <CardHeader className="pb-3 pt-4 px-4">
                  <CardTitle className="flex items-center gap-2 text-base text-amber-800">
                    <ShieldAlert className="h-5 w-5 text-amber-600" />
                    Ubah Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  <Select onValueChange={handleStatusChange} disabled={changingStatus}>
                    <SelectTrigger className="w-full">
                      {changingStatus ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Mengubah...
                        </span>
                      ) : (
                        <SelectValue placeholder="Pilih status baru" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {allowedTransitions.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABELS[s] || s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500">Komentar (opsional)</Label>
                    <Input
                      placeholder="Catatan perubahan status..."
                      value={statusComment}
                      onChange={(e) => setStatusComment(e.target.value)}
                      disabled={changingStatus}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments Section */}
            <Card className="shadow-lg">
              <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="h-5 w-5 text-slate-500" />
                  Komentar
                  <span className="ml-auto text-xs font-normal text-slate-400">
                    {report._count?.comments || 0}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {/* Comments list */}
                <div className="max-h-96 overflow-y-auto space-y-3 mb-3 pr-1">
                  {report.comments && report.comments.length > 0 ? (
                    report.comments.map((c) => (
                      <div
                        key={c.id}
                        className="rounded-lg border border-slate-100 bg-slate-50 p-3"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-slate-800">{c.user.name}</span>
                          {c.user.role === 'ADMIN' && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                              Admin
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">{c.content}</p>
                        <p className="mt-1.5 text-[10px] text-slate-400">{formatDate(c.createdAt)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-xs text-slate-400 py-6">
                      Belum ada komentar
                    </p>
                  )}
                  <div ref={commentsEndRef} />
                </div>

                {/* Add Comment Form */}
                {user && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <Textarea
                      placeholder="Tulis komentar..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="min-h-[60px] resize-none text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          handleComment();
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={handleComment}
                      disabled={!commentText.trim() || submittingComment}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      {submittingComment ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      Kirim Komentar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}