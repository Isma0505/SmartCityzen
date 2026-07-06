import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Total reports and users
    const [totalReports, totalUsers] = await Promise.all([
      db.report.count(),
      db.user.count({ where: { role: 'WARGA' } }),
    ]);

    // Reports by status
    const reportsByStatus = await db.report.groupBy({
      by: ['status'],
      _count: { status: true },
    });
    const formattedStatus = reportsByStatus.map((r) => ({
      status: r.status,
      count: r._count.status,
    }));

    // Reports by category
    const reportsByCategory = await db.report.groupBy({
      by: ['category'],
      _count: { category: true },
    });
    const formattedCategory = reportsByCategory
      .map((r) => ({
        category: r.category,
        count: r._count.category,
      }))
      .sort((a, b) => b.count - a.count);

    // Reports by priority
    const reportsByPriority = await db.report.groupBy({
      by: ['priority'],
      _count: { priority: true },
    });
    const formattedPriority = reportsByPriority.map((r) => ({
      priority: r.priority,
      count: r._count.priority,
    }));

    // Monthly data
    const allReports = await db.report.findMany({
      select: { status: true, createdAt: true },
    });

    const monthlyData: Record<string, { total: number; selesai: number; DITERIMA: number; DIPROSES: number; DALAM_PERBAIKAN: number; SELESAI: number }> = {};

    allReports.forEach((r) => {
      const key = `${r.createdAt.getFullYear()}-${String(r.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[key]) {
        monthlyData[key] = { total: 0, selesai: 0, DITERIMA: 0, DIPROSES: 0, DALAM_PERBAIKAN: 0, SELESAI: 0 };
      }
      monthlyData[key].total += 1;
      if (r.status === 'SELESAI') {
        monthlyData[key].selesai += 1;
      }
      if (monthlyData[key][r.status as keyof typeof monthlyData[key]] !== undefined) {
        (monthlyData[key] as Record<string, number>)[r.status] += 1;
      }
    });

    // Average resolution time (days from creation to last SELESAI history)
    const finishedReports = await db.report.findMany({
      where: { status: 'SELESAI' },
      include: { history: { where: { status: 'SELESAI' }, orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    let totalDays = 0;
    let resolvedCount = 0;
    finishedReports.forEach((r) => {
      if (r.history.length > 0) {
        const diffMs = r.history[0].createdAt.getTime() - r.createdAt.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        totalDays += diffDays;
        resolvedCount += 1;
      }
    });
    const avgResolutionTime = resolvedCount > 0 ? (totalDays / resolvedCount).toFixed(1) : '0';

    // Top reporters
    const topReporters = await db.user.findMany({
      where: { role: 'WARGA' },
      orderBy: [{ points: 'desc' }, { reports: { _count: 'desc' } }],
      take: 5,
      select: {
        name: true,
        points: true,
        _count: { select: { reports: true } },
      },
    });

    // Top areas (by address)
    const reportsWithAddress = await db.report.findMany({
      where: { address: { not: null, not: '' } },
      select: { address: true },
    });

    const areaCounts: Record<string, number> = {};
    reportsWithAddress.forEach((r) => {
      if (r.address) {
        // Use first part of address for area grouping
        const area = r.address.split(',')[0].trim();
        areaCounts[area] = (areaCounts[area] || 0) + 1;
      }
    });

    const topAreas = Object.entries(areaCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return NextResponse.json({
      totalReports,
      totalUsers,
      reportsByStatus: formattedStatus,
      reportsByCategory: formattedCategory,
      reportsByPriority: formattedPriority,
      monthlyData,
      avgResolutionTime,
      topReporters,
      topAreas,
    });
  } catch (error) {
    console.error('GET /api/reports/stats error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data statistik' },
      { status: 500 }
    );
  }
}