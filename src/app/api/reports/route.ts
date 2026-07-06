import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// GET /api/reports - Fetch reports with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};

    // WARGA only sees their own reports
    if (userId && role === 'WARGA') {
      where.userId = userId;
    }
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
        _count: {
          select: { comments: true, supports: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reports);
  } catch (error: any) {
    console.error('GET /api/reports error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data laporan' },
      { status: 500 }
    );
  }
}

// POST /api/reports - Create a new report
export async function POST(request: NextRequest) {
  try {
    const { title, description, imageUrl, latitude, longitude, address, category, userId } = await request.json();

    if (!title || !description || !latitude || !longitude || !userId) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const report = await db.report.create({
      data: {
        title,
        description,
        imageUrl: imageUrl || null,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address: address || null,
        category: category || 'Lainnya',
        userId,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    await db.notification.create({
      data: {
        message: `Laporan Anda "${title}" berhasil dikirim dan sedang dianalisis oleh AI.`,
        type: 'INFO',
        userId,
        reportId: report.id,
      },
    });

    await db.reportHistory.create({
      data: {
        status: 'DITERIMA',
        comment: 'Laporan diterima sistem',
        userId,
        reportId: report.id,
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal membuat laporan' }, { status: 500 });
  }
}