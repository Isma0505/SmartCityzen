import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    // Seed admin user
    const adminEmail = 'admin@Banjarnegara.go.id';
    const existingAdmin = await db.user.findUnique({ where: { email: adminEmail } });
    
    if (existingAdmin) {
      return NextResponse.json({ message: 'Data seed sudah ada' });
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    await db.user.create({
      data: {
        name: 'Admin Banjarnegara',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        phone: '0286-123456',
      },
    });

    // Seed sample warga users
    const wargaUsers = [
      { name: 'Budi Santoso', email: 'budi@email.com', phone: '081234567890' },
      { name: 'Siti Aminah', email: 'siti@email.com', phone: '081234567891' },
      { name: 'Ahmad Fauzi', email: 'ahmad@email.com', phone: '081234567892' },
    ];

    for (const w of wargaUsers) {
      const existing = await db.user.findUnique({ where: { email: w.email } });
      if (!existing) {
        await db.user.create({
          data: {
            name: w.name,
            email: w.email,
            password: await bcrypt.hash('warga123', 10),
            role: 'WARGA',
            phone: w.phone,
          },
        });
      }
    }

    // Seed sample reports
    const budi = await db.user.findUnique({ where: { email: 'budi@email.com' } });
    const siti = await db.user.findUnique({ where: { email: 'siti@email.com' } });
    const ahmad = await db.user.findUnique({ where: { email: 'ahmad@email.com' } });

    const sampleReports = [
      {
        title: 'Jalan Berlubang di Jl. Diponegoro',
        description: 'Jalan di depan Pasar Banjarnegara bagian selatan terdapat lubang besar yang berbahaya bagi pengendara motor. Sudah ada beberapa kecelakaan kecil.',
        latitude: -7.3625,
        longitude: 109.7083,
        address: 'Jl. Diponegoro, Banjarnegara Kota',
        category: 'Jalan Rusak',
        status: 'DIPROSES',
        priority: 'TINGGI',
        impactLevel: 'TINGGI',
        targetAgency: 'Dinas Pekerjaan Umum',
        aiSummary: 'Jalan berlubang di area pasar yang ramai. Berisiko tinggi untuk kecelakaan pengendara motor.',
        aiPrediction: 'Jika tidak segera diperbaiki, berpotensi menyebabkan kecelakaan serius terutama saat hujan.',
        userId: budi?.id || '',
      },
      {
        title: 'Lampu Jalan Mati di Jl. Veteran',
        description: 'Lampu penerangan jalan di sepanjang Jl. Veteran sudah mati lebih dari 2 minggu. Area menjadi gelap di malam hari dan rawan kejahatan.',
        latitude: -7.3600,
        longitude: 109.7050,
        address: 'Jl. Veteran, Banjarnegara Kota',
        category: 'Penerangan Jalan',
        status: 'DITERIMA',
        priority: 'SEDANG',
        impactLevel: 'SEDANG',
        targetAgency: 'Dinas Perhubungan',
        aiSummary: 'Lampu jalan mati di jalan utama. Mengurangi keamanan area di malam hari.',
        aiPrediction: 'Area gelap berpotensi meningkatkan tindak kriminal dan kecelakaan lalu lintas.',
        userId: siti?.id || '',
      },
      {
        title: 'Tumpukan Sampah di Sungai Serayu',
        description: 'Sampah plastik dan rumah tangga menumpuk di bantaran Sungai Serayu dekat Jembatan Kalianget. Bau tidak sedap dan mengancam ekosistem sungai.',
        latitude: -7.3650,
        longitude: 109.7100,
        address: 'Sungai Serayu, Kalianget, Banjarnegara',
        category: 'Sampah & Kebersihan',
        status: 'DALAM_PERBAIKAN',
        priority: 'TINGGI',
        impactLevel: 'TINGGI',
        targetAgency: 'Dinas Lingkungan Hidup',
        aiSummary: 'Tumpukan sampah di bantaran sungai. Berdampak pada kebersihan dan ekosistem.',
        aiPrediction: 'Dapat menyebabkan banjir dan pencemaran air jika tidak ditangani segera.',
        userId: ahmad?.id || '',
      },
      {
        title: 'Drainase Tersumbat di Kelurahan Kejawan',
        description: 'Saluran drainase di Jl. Kartini tersumbat oleh sampah dan sedimentasi. Saat hujan, air menggenang setinggi 30cm dan mengganggu aktivitas warga.',
        latitude: -7.3580,
        longitude: 109.7120,
        address: 'Jl. Kartini, Kejawan, Banjarnegara',
        category: 'Drainase',
        status: 'SELESAI',
        priority: 'SEDANG',
        impactLevel: 'SEDANG',
        targetAgency: 'Dinas Pekerjaan Umum',
        aiSummary: 'Drainase tersumbat menyebabkan genangan. Perlu pembersihan rutin.',
        aiPrediction: 'Genangan berkepanjangan dapat menjadi sarang nyamuk dan menimbulkan penyakit.',
        userId: budi?.id || '',
      },
      {
        title: 'Fasilitas Taman Kota Perlu Renovasi',
        description: 'Bangku taman dan ayunan di Taman Kota Banjarnegara sudah rusak. Anak-anak tidak bisa bermain dengan aman.',
        latitude: -7.3610,
        longitude: 109.7060,
        address: 'Taman Kota, Banjarnegara',
        category: 'Fasilitas Umum',
        status: 'DITERIMA',
        priority: 'RENDAH',
        impactLevel: 'RENDAH',
        targetAgency: 'Dinas Pariwisata dan Kebudayaan',
        aiSummary: 'Fasilitas taman kota yang rusak. Mengurangi kenyamanan ruang publik.',
        aiPrediction: 'Dampak rendah namun mengurangi kualitas hidup warga di area sekitar taman.',
        userId: siti?.id || '',
      },
    ];

    for (const r of sampleReports) {
      if (!r.userId) continue;
      const report = await db.report.create({ data: r });
      await db.reportHistory.create({
        data: { status: r.status, comment: 'Laporan dicatat dalam sistem', userId: r.userId, reportId: report.id },
      });
      if (r.status !== 'DITERIMA') {
        await db.reportHistory.create({
          data: { status: 'DIPROSES', comment: 'Sedang ditinjau petugas', userId: r.userId, reportId: report.id },
        });
      }
      if (r.status === 'DALAM_PERBAIKAN' || r.status === 'SELESAI') {
        await db.reportHistory.create({
          data: { status: 'DALAM_PERBAIKAN', comment: 'Perbaikan sedang dilakukan', userId: r.userId, reportId: report.id },
        });
      }
      if (r.status === 'SELESAI') {
        await db.reportHistory.create({
          data: { status: 'SELESAI', comment: 'Perbaikan telah selesai', userId: r.userId, reportId: report.id },
        });
        await db.user.update({ where: { id: r.userId }, data: { points: { increment: 25 } } });
      }
      await db.user.update({ where: { id: r.userId }, data: { points: { increment: 10 } } });
    }

    return NextResponse.json({ message: 'Data seed berhasil dibuat' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}