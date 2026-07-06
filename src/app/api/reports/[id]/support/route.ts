import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID wajib' }, { status: 400 });
    }

    const existing = await db.reportSupport.findUnique({
      where: { userId_reportId: { userId, reportId: id } },
    });

    if (existing) {
      await db.reportSupport.delete({ where: { id: existing.id } });
      await db.report.update({
        where: { id },
        data: { /* support count handled by _count */ },
      });
      return NextResponse.json({ supported: false });
    }

    await db.reportSupport.create({
      data: { userId, reportId: id },
    });

    return NextResponse.json({ supported: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal mendukung laporan' }, { status: 500 });
  }
}