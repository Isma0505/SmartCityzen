'use client';

import { useStore } from '@/store/useStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Tag,
  AlertTriangle,
  Target,
  Building2,
  MessageSquare,
  TrendingUp,
  MapPin,
  ShieldAlert,
  CheckCircle2,
  BarChart3,
} from 'lucide-react';

const priorityConfig: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  TINGGI: {
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
  },
  SEDANG: {
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: <ShieldAlert className="h-5 w-5 text-amber-500" />,
  },
  RENDAH: {
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  },
};

const impactConfig: Record<string, { color: string; bg: string }> = {
  TINGGI: { color: 'text-red-600', bg: 'bg-red-100' },
  SEDANG: { color: 'text-amber-600', bg: 'bg-amber-100' },
  RENDAH: { color: 'text-emerald-600', bg: 'bg-emerald-100' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function AIAnalysisResult() {
  const { analysisResult, navigateTo } = useStore();

  if (!analysisResult) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="flex flex-col items-center gap-3 p-8">
            <Sparkles className="h-12 w-12 text-slate-300" />
            <p className="text-sm text-slate-500 text-center">Tidak ada hasil analisis</p>
            <Button
              variant="outline"
              onClick={() => navigateTo('buat-laporan')}
              className="mt-2"
            >
              Buat Laporan Baru
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { category, priority, impactLevel, targetAgency, aiSummary, aiPrediction, score, isDuplicate } = analysisResult;
  const scoreValue = typeof score === 'number' ? score : parseInt(String(score), 10) || 50;
  const pConfig = priorityConfig[priority] || priorityConfig.SEDANG;
  const iConfig = impactConfig[impactLevel] || impactConfig.SEDANG;

  const scoreColor = scoreValue >= 70 ? 'text-red-600' : scoreValue >= 40 ? 'text-amber-600' : 'text-emerald-600';
  const scoreTrackColor = scoreValue >= 70 ? 'bg-red-200' : scoreValue >= 40 ? 'bg-amber-200' : 'bg-emerald-200';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <motion.div
        className="mx-auto max-w-lg"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg"
          >
            <Sparkles className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            Analisis AI Selesai
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Laporan Anda telah dianalisis secara otomatis
          </p>
        </motion.div>

        {/* Duplicate Warning */}
        {isDuplicate && (
          <motion.div
            variants={itemVariants}
            className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">Peringatan Duplikat</p>
                <p className="text-xs text-amber-700">
                  Laporan ini kemungkinan duplikat dari laporan sebelumnya. Tim kami akan memverifikasi lebih lanjut.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Score Card */}
        <motion.div variants={itemVariants}>
          <Card className="mb-4 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-slate-300" />
                  <span className="text-sm font-medium text-slate-200">Skor Prioritas</span>
                </div>
                <span className={`text-2xl font-bold ${scoreColor}`}>
                  {scoreValue}
                  <span className="text-sm font-normal text-slate-400">/100</span>
                </span>
              </div>
              <div className="mt-2">
                <div className={`h-2.5 w-full rounded-full ${scoreTrackColor}`}>
                  <motion.div
                    className="h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${scoreValue}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                  />
                </div>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Priority */}
                <div className={`rounded-lg border ${pConfig.border} ${pConfig.bg} p-3`}>
                  <div className="flex items-center gap-2 mb-1">
                    {pConfig.icon}
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Prioritas</span>
                  </div>
                  <span className={`text-lg font-bold ${pConfig.color}`}>{priority}</span>
                </div>

                {/* Impact */}
                <div className={`rounded-lg border ${iConfig.bg} p-3`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-5 w-5 text-slate-400" />
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Dampak</span>
                  </div>
                  <span className={`text-lg font-bold ${iConfig.color}`}>{impactLevel}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Details Card */}
        <motion.div variants={itemVariants}>
          <Card className="mb-4 shadow-lg">
            <CardContent className="p-4 space-y-4">
              {/* Category */}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50">
                  <Tag className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Kategori</p>
                  <p className="text-sm font-semibold text-slate-900">{category}</p>
                </div>
              </div>

              <Separator />

              {/* Target Agency */}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <Building2 className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Dinas Tujuan</p>
                  <p className="text-sm font-semibold text-slate-900">{targetAgency || 'Dinas terkait'}</p>
                </div>
              </div>

              <Separator />

              {/* AI Summary */}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50">
                  <MessageSquare className="h-4 w-4 text-teal-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Ringkasan AI</p>
                  <p className="mt-1 text-sm text-slate-700 leading-relaxed">{aiSummary}</p>
                </div>
              </div>

              <Separator />

              {/* AI Prediction */}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Prediksi AI</p>
                  <p className="mt-1 text-sm text-slate-700 leading-relaxed">{aiPrediction}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 bg-white hover:bg-slate-50"
            onClick={() => navigateTo('peta')}
          >
            <MapPin className="mr-2 h-4 w-4" />
            Lihat Peta
          </Button>
          <Button
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            onClick={() => navigateTo('dashboard-warga')}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Ke Dashboard
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}