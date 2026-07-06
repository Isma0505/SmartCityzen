import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'User ID wajib' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, role: true, avatar: true, points: true, createdAt: true, _count: { select: { reports: true, comments: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal mengambil profil' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, name, phone } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID wajib' }, { status: 400 });
    }

    const user = await db.user.update({
      where: { id: userId },
      data: { name, phone },
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      points: user.points,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal mengupdate profil' }, { status: 500 });
  }
}