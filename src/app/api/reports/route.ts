import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const role = searchParams.get('role');

    const where: Record<string, unknown> = {};

    if (category && category !== 'Semua') {
      where.category = category;
    }
    if (status && status !== 'Semua') {
      where.status = status;
    }
    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { address: { contains: search } },
      ];
    }

    const reports = await db.report.findMany({
      where,
      include: {
        user: {
          select: { name: true, id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedReports = reports.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      status: r.status,
      priority: r.priority,
      impactLevel: r.impactLevel,
      targetAgency: r.targetAgency,
      imageUrl: r.imageUrl,
      latitude: r.latitude,
      longitude: r.longitude,
      address: r.address,
      aiSummary: r.aiSummary,
      aiPrediction: r.aiPrediction,
      reporterName: r.user.name,
      userId: r.userId,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    return NextResponse.json({ reports: formattedReports });
  } catch (error) {
    console.error('GET /api/reports error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data laporan' },
      { status: 500 }
    );
  }
}