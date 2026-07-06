import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { reportId } = await request.json();

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID wajib' }, { status: 400 });
    }

    const report = await db.report.findUnique({
      where: { id: reportId },
      include: { user: { select: { name: true } } },
    });

    if (!report) {
      return NextResponse.json({ error: 'Laporan tidak ditemukan' }, { status: 404 });
    }

    // Check for duplicates
    const allReports = await db.report.findMany({
      where: {
        id: { not: reportId },
        OR: [
          { title: { contains: report.title.split(' ').slice(0, 3).join(' ') } },
        ],
      },
    });

    const isDuplicate = allReports.some(r => {
      const similarity = calculateSimilarity(
        report.title.toLowerCase() + ' ' + report.description.toLowerCase(),
        r.title.toLowerCase() + ' ' + r.description.toLowerCase()
      );
      return similarity > 0.6;
    });

    const duplicateInfo = isDuplicate 
      ? 'PERINGATAN: Laporan ini kemungkinan duplikat dari laporan sebelumnya.' 
      : null;

    // AI Analysis using z-ai-web-dev-sdk
    const zai = await ZAI.create();

    const systemPrompt = `Kamu adalah AI analis laporan kota untuk SmartCityzen Wonosobo. 
Analisis laporan warga dan berikan output dalam format JSON yang valid dengan struktur berikut:
{
  "category": "salah satu dari: Jalan Rusak, Penerangan Jalan, Sampah & Kebersihan, Drainase, Fasilitas Umum, Lalu Lintas, Lingkungan, Parkir, Lainnya",
  "priority": "salah satu dari: RENDAH, SEDANG, TINGGI",
  "impactLevel": "salah satu dari: RENDAH, SEDANG, TINGGI",
  "targetAgency": "nama dinas/instansi pemerintah yang bertanggung jawab",
  "aiSummary": "ringkasan singkat analisis dalam 2-3 kalimat",
  "aiPrediction": "prediksi dampak jika tidak segera ditangani, dalam 1-2 kalimat",
  "score": "skor prioritas 1-100 berdasarkan tingkat bahaya dan dampak"
}

Pertimbangkan: tingkat bahaya, jumlah warga yang mungkin terdampak, lokasi strategis atau tidak, dan urgensi penanganan.
Jawab HANYA dengan JSON yang valid, tanpa teks tambahan.`;

    const userMessage = `Judul Laporan: ${report.title}
Deskripsi: ${report.description}
Kategori Awal: ${report.category}
Lokasi: ${report.address || 'Tidak disebutkan'}
Koordinat: ${report.latitude}, ${report.longitude}
Pelapor: ${report.user.name}
${duplicateInfo ? 'Catatan: ' + duplicateInfo : ''}

Analisis laporan ini.`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      thinking: { type: 'disabled' },
    });

    let aiResult;
    const responseText = completion.choices[0]?.message?.content || '';
    
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      aiResult = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch {
      aiResult = {
        category: report.category,
        priority: 'SEDANG',
        impactLevel: 'SEDANG',
        targetAgency: 'Dinas terkait',
        aiSummary: 'Laporan sedang dalam proses analisis.',
        aiPrediction: 'Dampak sedang ditinjau.',
        score: 50,
      };
    }

    // Update report with AI analysis
    const updatedReport = await db.report.update({
      where: { id: reportId },
      data: {
        category: aiResult.category || report.category,
        priority: aiResult.priority || 'SEDANG',
        impactLevel: aiResult.impactLevel || 'SEDANG',
        targetAgency: aiResult.targetAgency || null,
        aiSummary: aiResult.aiSummary || null,
        aiPrediction: aiResult.aiPrediction || null,
        duplicateOf: isDuplicate ? allReports[0]?.id : null,
      },
    });

    // Give points to user
    await db.user.update({
      where: { id: report.userId },
      data: { points: { increment: 10 } },
    });

    // Notify user
    await db.notification.create({
      data: {
        message: `Laporan "${report.title}" telah dianalisis AI. Kategori: ${aiResult.category}, Prioritas: ${aiResult.priority}`,
        type: 'INFO',
        userId: report.userId,
        reportId: reportId,
      },
    });

    return NextResponse.json({
      report: updatedReport,
      analysis: aiResult,
      isDuplicate,
    });
  } catch (error: any) {
    console.error('AI Analysis error:', error);
    return NextResponse.json({ error: error.message || 'Gagal menganalisis laporan' }, { status: 500 });
  }
}

function calculateSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.split(/\s+/));
  const words2 = new Set(str2.split(/\s+/));
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}