'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  Search,
  LayoutDashboard,
  User,
  Eye,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';

const CATEGORIES = [
  'Semua',
  'Jalan Rusak',
  'Penerangan Jalan',
  'Sampah & Kebersihan',
  'Drainase',
  'Fasilitas Umum',
  'Lalu Lintas',
  'Lingkungan',
  'Parkir',
  'Lainnya',
];

const STATUSES = [
  'Semua',
  'DITERIMA',
  'DIPROSES',
  'DALAM_PERBAIKAN',
  'SELESAI',
];

const STATUS_COLORS: Record<string, string> = {
  DITERIMA: 'bg-red-100 text-red-800 border-red-200',
  DIPROSES: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  DALAM_PERBAIKAN: 'bg-orange-100 text-orange-800 border-orange-200',
  SELESAI: 'bg-green-100 text-green-800 border-green-200',
};

const PRIORITY_COLORS: Record<string, string> = {
  TINGGI: 'bg-red-100 text-red-800 border-red-200',
  SEDANG: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  RENDAH: 'bg-green-100 text-green-800 border-green-200',
};

const PIE_COLORS = ['#10b981', '#f59e0b', '#f97316', '#ef4444'];
const BAR_COLORS = ['#10b981', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'];

interface Report {
  id: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  reporterName: string;
  createdAt: string;
}

interface ReportStats {
  total: number;
  belumDitangani: number;
  sedangDiproses: number;
  selesai: number;
}

export default function GovernmentDashboard() {
  const { user, setSelectedReportId, navigateTo } = useStore();
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<ReportStats>({
    total: 0,
    belumDitangani: 0,
    sedangDiproses: 0,
    selesai: 0,
  });
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ role: 'ADMIN' });
      if (categoryFilter !== 'Semua') params.set('category', categoryFilter);
      if (statusFilter !== 'Semua') params.set('status', statusFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/reports?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || data || []);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, statusFilter, searchQuery]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch('/api/reports?role=ADMIN');
      if (res.ok) {
        const data = await res.json();
        const allReports: Report[] = data.reports || data || [];
        setStats({
          total: allReports.length,
          belumDitangani: allReports.filter((r: Report) => r.status === 'DITERIMA').length,
          sedangDiproses: allReports.filter(
            (r: Report) => r.status === 'DIPROSES' || r.status === 'DALAM_PERBAIKAN'
          ).length,
          selesai: allReports.filter((r: Report) => r.status === 'SELESAI').length,
        });
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Category chart data from all fetched reports (unfiltered)
  const categoryChartData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach((r) => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [reports]);

  // Status chart data
  const statusChartData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach((r) => {
      counts[r.status] = (counts[r.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [reports]);

  const handleDetail = (reportId: string) => {
    setSelectedReportId(reportId);
    navigateTo('report-detail');
  };

  const summaryCards = [
    {
      title: 'Total Laporan',
      value: stats.total,
      icon: FileText,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Belum Ditangani',
      value: stats.belumDitangani,
      icon: AlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      title: 'Sedang Diproses',
      value: stats.sedangDiproses,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'Selesai',
      value: stats.selesai,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="size-6 text-primary" />
            <div>
              <h1 className="text-lg font-semibold leading-tight">
                Dashboard Pemerintah - Kota Wonosobo
              </h1>
              <p className="text-xs text-muted-foreground">
                Kelola dan pantau laporan warga
              </p>
            </div>
          </div>
          {user && (
            <div className="flex items-center gap-2 text-sm">
              <div className="hidden sm:flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1">
                <User className="size-4 text-primary" />
                <span className="font-medium">{user.name}</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        {/* Summary Stats Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {summaryCards.map((card) => (
            <Card key={card.title} className="gap-4 py-4">
              <CardContent className="flex items-center gap-4 px-4">
                <div className={`rounded-lg p-2.5 ${card.bg}`}>
                  <card.icon className={`size-5 ${card.color}`} />
                </div>
                <div>
                  {statsLoading ? (
                    <Skeleton className="h-7 w-12" />
                  ) : (
                    <p className="text-2xl font-bold">{card.value}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{card.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter Bar */}
        <Card className="py-4">
          <CardContent className="px-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Cari laporan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === 'Semua' ? status : status.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <Card className="py-0 overflow-hidden">
          <CardHeader className="px-6 pb-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="size-4" />
              Daftar Laporan Warga
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">No</TableHead>
                    <TableHead className="min-w-[180px]">Judul</TableHead>
                    <TableHead className="min-w-[120px]">Kategori</TableHead>
                    <TableHead className="min-w-[130px]">Status</TableHead>
                    <TableHead className="min-w-[90px]">Prioritas</TableHead>
                    <TableHead className="min-w-[100px]">Pelapor</TableHead>
                    <TableHead className="min-w-[100px]">Tanggal</TableHead>
                    <TableHead className="w-20">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-full max-w-[200px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-16 rounded-md" /></TableCell>
                      </TableRow>
                    ))
                  ) : reports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="size-8 opacity-40" />
                          <p>Belum ada laporan</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    reports.map((report, index) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="max-w-[250px] truncate font-medium">
                          {report.title}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">
                            {report.category}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={STATUS_COLORS[report.status] || ''}
                          >
                            {report.status.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={PRIORITY_COLORS[report.priority] || ''}
                          >
                            {report.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {report.reporterName || '-'}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {report.createdAt
                            ? format(new Date(report.createdAt), 'dd MMM yyyy')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDetail(report.id)}
                            className="gap-1"
                          >
                            <Eye className="size-3.5" />
                            <span className="hidden sm:inline">Detail</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Charts Section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Reports by Category - Bar Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="size-4 text-primary" />
                Laporan per Kategori
              </CardTitle>
            </CardHeader>
            <CardContent>
              {categoryChartData.length === 0 ? (
                <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                  <p className="text-sm">Belum ada data</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={categoryChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      angle={-30}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                        backgroundColor: 'hsl(var(--popover))',
                        color: 'hsl(var(--popover-foreground))',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {categoryChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Status Distribution - Pie Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <PieChartIcon className="size-4 text-primary" />
                Distribusi Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statusChartData.length === 0 ? (
                <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                  <p className="text-sm">Belum ada data</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, value }) => `${name.replace(/_/g, ' ')} (${value})`}
                      labelLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                    >
                      {statusChartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                        backgroundColor: 'hsl(var(--popover))',
                        color: 'hsl(var(--popover-foreground))',
                        fontSize: '12px',
                      }}
                    />
                    <Legend
                      formatter={(value: string) => value.replace(/_/g, ' ')}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}