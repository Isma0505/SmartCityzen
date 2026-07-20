'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Users,
  Clock,
  TrendingUp,
  Trophy,
  MapPin,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
} from 'lucide-react';

// Chart color palette
const COLORS = {
  emerald: '#10b981',
  teal: '#14b8a6',
  amber: '#f59e0b',
  rose: '#f43f5e',
  violet: '#8b5cf6',
  cyan: '#06b6d4',
  pink: '#ec4899',
  lime: '#84cc16',
  orange: '#f97316',
  indigo: '#6366f1',
};

const STATUS_COLORS: Record<string, string> = {
  DITERIMA: COLORS.rose,
  DIPROSES: COLORS.amber,
  DALAM_PERBAIKAN: COLORS.orange,
  SELESAI: COLORS.emerald,
};

const PRIORITY_COLORS: Record<string, string> = {
  TINGGI: COLORS.rose,
  SEDANG: COLORS.amber,
  RENDAH: COLORS.emerald,
};

const MONTH_LABELS: Record<string, string> = {
  '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
  '05': 'Mei', '06': 'Jun', '07': 'Jul', '08': 'Agu',
  '09': 'Sep', '10': 'Okt', '11': 'Nov', '12': 'Des',
};

interface StatsData {
  totalReports: number;
  totalUsers: number;
  reportsByStatus: { status: string; count: number }[];
  reportsByCategory: { category: string; count: number }[];
  reportsByPriority: { priority: string; count: number }[];
  monthlyData: Record<string, { total: number; selesai: number; [key: string]: number }>;
  avgResolutionTime: string;
  topReporters: { name: string; points: number; _count: { reports: number } }[];
  topAreas: { name: string; count: number }[];
}

const defaultStats: StatsData = {
  totalReports: 0,
  totalUsers: 0,
  reportsByStatus: [],
  reportsByCategory: [],
  reportsByPriority: [],
  monthlyData: {},
  avgResolutionTime: '0',
  topReporters: [],
  topAreas: [],
};

export default function StatisticsPage() {
  const [stats, setStats] = useState<StatsData>(defaultStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/reports/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Compute completion rate
  const completionRate = React.useMemo(() => {
    if (stats.totalReports === 0) return 0;
    const selesai = stats.reportsByStatus.find((s) => s.status === 'SELESAI');
    return Math.round(((selesai?.count || 0) / stats.totalReports) * 100);
  }, [stats]);

  // Monthly data for stacked bar chart
  const monthlyChartData = React.useMemo(() => {
    if (!stats.monthlyData || typeof stats.monthlyData !== 'object') return [];
    return Object.entries(stats.monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthKey, data]) => {
        const year = monthKey.substring(0, 4);
        const month = monthKey.substring(5, 7);
        return {
          name: `${MONTH_LABELS[month] || month} ${year}`,
          ...data,
        };
      });
  }, [stats.monthlyData]);

  // Category pie data
  const categoryPieData = React.useMemo(() => {
    return stats.reportsByCategory.map((item) => ({
      name: item.category,
      value: item.count,
    }));
  }, [stats.reportsByCategory]);

  // Priority pie data
  const priorityPieData = React.useMemo(() => {
    return stats.reportsByPriority.map((item) => ({
      name: item.priority,
      value: item.count,
    }));
  }, [stats.reportsByPriority]);

  // Status summary for horizontal bars
  const statusSummaryData = React.useMemo(() => {
    return stats.reportsByStatus.map((item) => ({
      name: item.status.replace(/_/g, ' '),
      count: item.count,
      fill: STATUS_COLORS[item.status] || COLORS.violet,
    }));
  }, [stats.reportsByStatus]);

  const tooltipStyle = {
    borderRadius: '8px',
    border: '1px solid hsl(var(--border))',
    backgroundColor: 'hsl(var(--popover))',
    color: 'hsl(var(--popover-foreground))',
    fontSize: '12px',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
            <BarChart3 className="size-6 text-primary" />
            <Skeleton className="h-6 w-48" />
          </div>
        </header>
        <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="py-4">
                <CardContent className="flex items-center gap-4 px-4">
                  <Skeleton className="size-10 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-7 w-12" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card><CardContent className="p-6"><Skeleton className="h-[300px] w-full" /></CardContent></Card>
            <Card><CardContent className="p-6"><Skeleton className="h-[300px] w-full" /></CardContent></Card>
            <Card><CardContent className="p-6"><Skeleton className="h-[300px] w-full" /></CardContent></Card>
            <Card><CardContent className="p-6"><Skeleton className="h-[300px] w-full" /></CardContent></Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <BarChart3 className="size-6 text-primary" />
          <div>
            <h1 className="text-lg font-semibold">Statistik & Analitik</h1>
            <p className="text-xs text-muted-foreground">
              Data komprehensif laporan warga Kota Banjarnegara
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="gap-4 py-4">
            <CardContent className="flex items-center gap-4 px-4">
              <div className="rounded-lg bg-emerald-50 p-2.5">
                <FileText className="size-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalReports}</p>
                <p className="text-xs text-muted-foreground">Total Laporan</p>
              </div>
            </CardContent>
          </Card>
          <Card className="gap-4 py-4">
            <CardContent className="flex items-center gap-4 px-4">
              <div className="rounded-lg bg-teal-50 p-2.5">
                <Users className="size-5 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs text-muted-foreground">Total Warga</p>
              </div>
            </CardContent>
          </Card>
          <Card className="gap-4 py-4">
            <CardContent className="flex items-center gap-4 px-4">
              <div className="rounded-lg bg-amber-50 p-2.5">
                <Clock className="size-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgResolutionTime}</p>
                <p className="text-xs text-muted-foreground">Rata-rata Penyelesaian (hari)</p>
              </div>
            </CardContent>
          </Card>
          <Card className="gap-4 py-4">
            <CardContent className="flex items-center gap-4 px-4">
              <div className="rounded-lg bg-violet-50 p-2.5">
                <TrendingUp className="size-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completionRate}%</p>
                <p className="text-xs text-muted-foreground">Tingkat Penyelesaian</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Reports Chart - Stacked Bar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="size-4 text-primary" />
              Laporan Bulanan (Berdasarkan Status)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 lg:p-6">
            {monthlyChartData.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                <p className="text-sm">Belum ada data bulanan</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={420}>
                <BarChart
                  data={monthlyChartData}
                  margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />

                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                  />

                  <YAxis
                    tick={{ fontSize: 10 }}
                    allowDecimals={false}
                  />

                  <Tooltip
                    contentStyle={tooltipStyle}
                    wrapperStyle={{ fontSize: 12 }}
                  />

                  <Legend wrapperStyle={{ fontSize:12 }}/>

                  <Bar
                    dataKey="DITERIMA"
                    stackId="a"
                    fill={STATUS_COLORS.DITERIMA}
                    name="Diterima"
                    radius={[0, 0, 0, 0]}
                  />

                  <Bar
                    dataKey="DIPROSES"
                    stackId="a"
                    fill={STATUS_COLORS.DIPROSES}
                    name="Diproses"
                  />

                  <Bar
                    dataKey="DALAM_PERBAIKAN"
                    stackId="a"
                    fill={STATUS_COLORS.DALAM_PERBAIKAN}
                    name="Dalam Perbaikan"
                  />

                  <Bar
                    dataKey="SELESAI"
                    stackId="a"
                    fill={STATUS_COLORS.SELESAI}
                    name="Selesai"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Category & Priority Distribution */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Category Pie Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <PieChartIcon className="size-4 text-primary" />
                Distribusi Kategori
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 lg:p-6">
              {categoryPieData.length === 0 ? (
                <div className="flex h-[280px] items-center justify-center text-muted-foreground">
                  <p className="text-sm">Belum ada data kategori</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={420}>
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      cx="50%"
                      cy="42%"
                      innerRadius={35}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                    >
                      {categoryPieData.map((_, index) => (
                        <Cell
                          key={`cat-${index}`}
                          fill={Object.values(COLORS)[index % Object.values(COLORS).length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{
                      fontSize:12,
                      paddingTop:20
                      }}
                      formatter={(value)=>(
                      <span className="text-xs">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Priority Pie Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <PieChartIcon className="size-4 text-primary" />
                Distribusi Prioritas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 lg:p-6">
              {priorityPieData.length === 0 ? (
                <div className="flex h-[280px] items-center justify-center text-muted-foreground">
                  <p className="text-sm">Belum ada data prioritas</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={420}>
                  <PieChart>
                    <Pie
                      data={priorityPieData}
                      cx="50%"
                      cy="42%"
                      innerRadius={35}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                      nameKey="name"
                      label={false}
                      labelLine={false}
                    >
                      {priorityPieData.map((entry) => (
                        <Cell
                          key={`pri-${entry.name}`}
                          fill={PRIORITY_COLORS[entry.name] || COLORS.violet}
                        />
                      ))}
                    </Pie>
                    
                    <Tooltip contentStyle={tooltipStyle} />

                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{
                      fontSize:12,
                      paddingTop:20
                      }}
                      formatter={(value)=>(
                      <span className="text-xs">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Reporters & Top Areas */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Top Reporters */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="size-4 text-amber-500" />
                Pelapor Teraktif
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 lg:p-6">
              {stats.topReporters.length === 0 ? (
                <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                  <p className="text-sm">Belum ada data</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.topReporters.map((reporter, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div
                        className={`flex size-8 items-center justify-center rounded-full text-sm font-bold ${
                          index === 0
                            ? 'bg-amber-100 text-amber-700'
                            : index === 1
                              ? 'bg-gray-100 text-gray-600'
                              : index === 2
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">{reporter.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {reporter._count?.reports || 0} laporan
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-emerald-50 text-emerald-700 border-emerald-200"
                      >
                        <Trophy className="mr-1 size-3" />
                        {reporter.points} poin
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Areas */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="size-4 text-rose-500" />
                Area Terbanyak Laporan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 lg:p-6">
              {stats.topAreas.length === 0 ? (
                <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                  <p className="text-sm">Belum ada data area</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={stats.topAreas}
                    layout="vertical"
                    margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      width={90}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {stats.topAreas.map((_, index) => (
                        <Cell
                          key={`area-${index}`}
                          fill={Object.values(COLORS)[index % Object.values(COLORS).length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="size-4 text-primary" />
              Ringkasan Status Laporan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 lg:p-6">
            {statusSummaryData.length === 0 ? (
              <div className="flex h-[120px] items-center justify-center text-muted-foreground">
                <p className="text-sm">Belum ada data status</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {statusSummaryData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-3 rounded-lg border p-4"
                  >
                    <div
                      className="size-3 shrink-0 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-2xl font-bold">{item.count}</p>
                    </div>
                    {stats.totalReports > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {Math.round((item.count / stats.totalReports) * 100)}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}