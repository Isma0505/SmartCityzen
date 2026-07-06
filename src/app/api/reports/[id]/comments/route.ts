import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const comments = await db.comment.findMany({
      where: { reportId: id },
      include: { user: { select: { id: true, name: true, avatar: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(comments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal mengambil komentar' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { content, userId } = await request.json();

    if (!content || !userId) {
      return NextResponse.json({ error: 'Konten dan user ID wajib' }, { status: 400 });
    }

    const comment = await db.comment.create({
      data: { content, userId, reportId: id },
      include: { user: { select: { id: true, name: true, avatar: true, role: true } } },
    });

    // Notify report owner
    const report = await db.report.findUnique({ where: { id } });
    if (report && report.userId !== userId) {
      await db.notification.create({
        data: {
          message: `Komentar baru pada laporan "${report.title}"`,
          type: 'COMMENT',
          userId: report.userId,
          reportId: id,
        },
      });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal menambah komentar' }, { status: 500 });
  }
}