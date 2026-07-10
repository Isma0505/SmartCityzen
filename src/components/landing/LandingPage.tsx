'use client';

import { motion } from 'framer-motion';
import {
  Brain,
  MapPin,
  Activity,
  Shield,
  Building2,
  Scale,
  Lightbulb,
  ArrowRight,
  FileText,
  Cpu,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/store/useStore';

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */
const sdgGoals = [
  {
    number: 11,
    title: 'Sustainable Cities',
    description: 'Membangun kota yang inklusif, aman, berkelanjutan',
    icon: Building2,
    color: 'bg-orange-500',
    ringColor: 'ring-orange-500/20',
  },
  {
    number: 16,
    title: 'Peace & Justice',
    description: 'Mewujudkan masyarakat yang damai dan keadilan',
    icon: Scale,
    color: 'bg-blue-700',
    ringColor: 'ring-blue-700/20',
  },
  {
    number: 9,
    title: 'Innovation',
    description: 'Mendorong inovasi dan infrastruktur berkelanjutan',
    icon: Lightbulb,
    color: 'bg-amber-600',
    ringColor: 'ring-amber-600/20',
  },
];

const features = [
  {
    icon: Brain,
    title: 'Laporan Cerdas',
    description:
      'Analisis laporan berbasis AI yang otomatis mengkategorikan dan memprioritaskan permasalahan kota.',
  },
  {
    icon: MapPin,
    title: 'Peta Interaktif',
    description:
      'Visualisasi laporan pada peta digital untuk pemetaan masalah dan monitoring wilayah secara real-time.',
  },
  {
    icon: Activity,
    title: 'Tracking Real-time',
    description:
      'Pantau status dan progres penanganan laporan dari awal hingga tuntas secara transparan.',
  },
  {
    icon: Shield,
    title: 'Transparansi',
    description:
      'Tata kelola pemerintahan yang terbuka dan akuntabel untuk kepercayaan masyarakat.',
  },
];

const stats = [
  { value: '500+', label: 'Laporan' },
  { value: '150+', label: 'Warga Aktif' },
  { value: '85%', label: 'Terselesaikan' },
  { value: '24 Jam', label: 'Rata-rata' },
];

const steps = [
  {
    number: 1,
    title: 'Buat Laporan',
    description: 'Sampaikan aspirasi atau lapor masalah kota dengan mudah melalui platform.',
    icon: FileText,
  },
  {
    number: 2,
    title: 'AI Analisis',
    description: 'Sistem AI secara otomatis menganalisis, mengkategorikan, dan memprioritaskan laporan Anda.',
    icon: Cpu,
  },
  {
    number: 3,
    title: 'Pantau Progress',
    description: 'Lacak perkembangan penanganan laporan secara real-time hingga tuntas.',
    icon: BarChart3,
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  const navigateTo = useStore((s) => s.navigateTo);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ============================================================ */}
      {/*  HERO SECTION                                                */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <img
            src="/hero-Banjarnegara.png"
            alt="Kota Banjarnegara"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 via-emerald-800/80 to-teal-900/70" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-2xl"
          >
            <motion.div variants={fadeUp} custom={0}>
              <Badge className="mb-4 bg-emerald-500/20 text-emerald-100 border-emerald-500/30 text-sm px-3 py-1">
                Platform Aspirasi Kota Cerdas
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white"
            >
              SmartCityzen{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">
                Banjarnegara
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-6 text-lg sm:text-xl text-emerald-100/90 max-w-xl leading-relaxed"
            >
              Platform digital untuk mewujudkan kota Banjarnegara yang cerdas,
              partisipatif, dan berkelanjutan. Sampaikan aspirasi Anda dan
              pantau perkembangan kota secara transparan.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="mt-10 flex flex-col sm:flex-row gap-4"
            >
              <Button
                onClick={() => navigateTo('login')}
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-base px-8 py-6 rounded-xl shadow-lg shadow-emerald-900/30 transition-all hover:shadow-xl hover:shadow-emerald-900/40"
              >
                Masuk
                <ArrowRight className="ml-2 size-5" />
              </Button>
              <Button
                onClick={() => navigateTo('register')}
                variant="outline"
                size="lg"
                className="border-emerald-400/40 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm font-semibold text-base px-8 py-6 rounded-xl transition-all"
              >
                Daftar Akun
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SDGs SECTION                                                */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-20 bg-white" aria-labelledby="sdg-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              id="sdg-heading"
              className="text-3xl sm:text-4xl font-bold text-gray-900"
            >
              Mendukung Tujuan Pembangunan Berkelanjutan
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="mt-4 text-gray-600 max-w-2xl mx-auto"
            >
              SmartCityzen Banjarnegara berkontribusi langsung pada pencapaian
              Sustainable Development Goals (SDGs) PBB.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {sdgGoals.map((sdg) => (
              <motion.div key={sdg.number} variants={fadeUp} custom={sdg.number - 11}>
                <Card className="group h-full border-0 shadow-md hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div
                      className={`shrink-0 w-14 h-14 ${sdg.color} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md`}
                    >
                      {sdg.number}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {sdg.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                        {sdg.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FEATURES SECTION                                            */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-20 bg-gray-50" aria-labelledby="features-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              id="features-heading"
              className="text-3xl sm:text-4xl font-bold text-gray-900"
            >
              Fitur Unggulan
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="mt-4 text-gray-600 max-w-2xl mx-auto"
            >
              Dilengkapi teknologi canggih untuk pengalaman pelaporan kota yang
              lebih efektif dan transparan.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, idx) => (
              <motion.div key={feature.title} variants={fadeUp} custom={idx}>
                <Card className="group h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl overflow-hidden">
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-600 transition-colors duration-300">
                      <feature.icon className="size-7 text-emerald-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  STATS SECTION                                               */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600" aria-labelledby="stats-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              id="stats-heading"
              className="text-3xl sm:text-4xl font-bold text-white text-center mb-12"
            >
              Dampak Nyata untuk Banjarnegara
            </motion.h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {stats.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  variants={fadeUp}
                  custom={idx + 1}
                  className="text-center"
                >
                  <div className="text-4xl sm:text-5xl font-extrabold text-white">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-emerald-100 font-medium text-sm sm:text-base">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  HOW IT WORKS SECTION                                        */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-20 bg-white" aria-labelledby="how-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              id="how-heading"
              className="text-3xl sm:text-4xl font-bold text-gray-900"
            >
              Cara Kerja
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="mt-4 text-gray-600 max-w-2xl mx-auto"
            >
              Tiga langkah sederhana untuk menyampaikan aspirasi dan memantau
              perkembangan kota Anda.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
          >
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-emerald-200" aria-hidden="true" />

            {steps.map((step, idx) => (
              <motion.div
                key={step.number}
                variants={fadeUp}
                custom={idx + 1}
                className="relative text-center"
              >
                {/* Step number circle */}
                <div className="relative mx-auto mb-6 w-16 h-16">
                  <div className="absolute inset-0 rounded-full bg-emerald-100" />
                  <div className="relative w-full h-full rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                    <span className="text-2xl font-bold text-white">
                      {step.number}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-gray-600 max-w-xs mx-auto leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA after how-it-works */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="mt-16 text-center"
          >
            <Button
              onClick={() => navigateTo('register')}
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base px-8 py-6 rounded-xl shadow-lg shadow-emerald-600/20 transition-all hover:shadow-xl hover:shadow-emerald-600/30"
            >
              Mulai Sekarang
              <ArrowRight className="ml-2 size-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FOOTER                                                      */}
      {/* ============================================================ */}
      <footer className="mt-auto bg-gray-900 text-gray-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Building2 className="size-4 text-white" />
              </div>
              <span className="font-semibold text-white">
                SmartCityzen Banjarnegara
              </span>
            </div>
            <p className="text-sm text-center sm:text-right">
              &copy; {new Date().getFullYear()} SmartCityzen Banjarnegara. Hak cipta
              dilindungi undang-undang.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}