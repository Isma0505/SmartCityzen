import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const STATUS_FLOW: Record<string, string[]> = {
  DITERIMA: ['DIPROSES'],
  DIPROSES: ['DALAM_PERBAIKAN', 'DITERIMA'],
  DALAM_PERBAIKAN: ['SELESAI', 'DIPROSES'],
  SELESAI: [],
};

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status, comment, userId } = await request.json();

    if (!status || !userId) {
      return NextResponse.json({ error: 'Status dan user ID wajib' }, { status: 400 });
    }

    const report = await db.report.findUnique({ where: { id } });
    if (!report) {
      return NextResponse.json({ error: 'Laporan tidak ditemukan' }, { status: 404 });
    }

    const allowedTransitions = STATUS_FLOW[report.status] || [];
    if (!allowedTransitions.includes(status) && report.status !== status) {
      return NextResponse.json({ 
        error: `Transisi status dari ${report.status} ke ${status} tidak diizinkan` 
      }, { status: 400 });
    }

    const updatedReport = await db.report.update({
      where: { id },
      data: { status },
    });

    await db.reportHistory.create({
      data: {
        status,
        comment: comment || null,
        userId,
        reportId: id,
      },
    });

    // Notify report owner
    await db.notification.create({
      data: {
        message: `Status laporan "${report.title}" diubah menjadi ${status}.${comment ? ' Komentar: ' + comment : ''}`,
        type: 'STATUS_CHANGE',
        userId: report.userId,
        reportId: id,
      },
    });

    // Award points if completed
    if (status === 'SELESAI') {
      await db.user.update({
        where: { id: report.userId },
        data: { points: { increment: 25 } },
      });
    }

    return NextResponse.json(updatedReport);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal mengubah status' }, { status: 500 });
  }
}