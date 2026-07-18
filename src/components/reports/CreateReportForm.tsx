'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  ImagePlus,
  MapPin,
  Tag,
  Loader2,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';

const CATEGORIES = [
  'Jalan Rusak',
  'Penerangan Jalan',
  'Sampah & Kebersihan',
  'Drainase',
  'Fasilitas Umum',
  'Lalu Lintas',
  'Lingkungan',
  'Parkir',
  'Lainnya',
];

const DEFAULT_LAT = -7.3625;
const DEFAULT_LNG = 109.7083;

type Step = 1 | 2 | 3;

export default function CreateReportForm() {
  const { user, navigateTo, setAnalysisResult, triggerRefreshReports } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(DEFAULT_LAT);
  const [longitude, setLongitude] = useState(DEFAULT_LNG);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Hanya file gambar yang diperbolehkan');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB');
      return;
    }

    setError('');
    // Show preview immediately from local file
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setImageUrl(null); // will be set after upload

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/reports/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        setImageUrl(data.url);
      } else {
        setError(data.error || 'Gagal mengunggah gambar');
        setImagePreview(null);
      }
    } catch {
      setError('Gagal mengunggah gambar');
      setImagePreview(null);
    }
  };

  const removeImage = () => {
    setImageUrl(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const reverseGeocode = async (lat: number, lon: number) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    );

    const data = await res.json();

    if (data.display_name) {
      setAddress(data.display_name);
    }
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  if (latitude && longitude) {
    reverseGeocode(latitude, longitude);
  }
}, [latitude, longitude]);

const searchAddress = async () => {
  if (!address.trim()) return;

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
    );

    const data = await res.json();

    if (data.length > 0) {
      setLatitude(Number(data[0].lat));
      setLongitude(Number(data[0].lon));
    }
  } catch (err) {
    console.error(err);
  }
};

const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    alert("Browser tidak mendukung lokasi.");
    return;
  }

  setLoadingLocation(true);

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      setLatitude(lat);
      setLongitude(lon);

      await reverseGeocode(lat, lon);

      setLoadingLocation(false);
    },
    () => {
      alert("Gagal mendapatkan lokasi.");
      setLoadingLocation(false);
    }
  );
};

  const canProceedStep1 = title.trim().length > 0 && description.trim().length > 0;
  const canProceedStep2 = category.length > 0;

  const handleSubmit = async () => {
    if (!user || !canProceedStep1 || !canProceedStep2) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          imageUrl,
          latitude: DEFAULT_LAT,
          longitude: DEFAULT_LNG,
          address: address.trim() || null,
          category,
          userId: user.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Gagal membuat laporan');
        setSubmitting(false);
        return;
      }
      
      triggerRefreshReports();

      // Start AI analysis
      setAnalyzing(true);
      try {
        const analyzeRes = await fetch('/api/reports/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reportId: data.id }),
        });
        const analyzeData = await analyzeRes.json();

        if (analyzeRes.ok) {
          setAnalysisResult({
            reportId: data.id,
            ...analyzeData.analysis,
            isDuplicate: analyzeData.isDuplicate,
          });
        } else {
          setAnalysisResult({
            reportId: data.id,
            category,
            priority: 'SEDANG',
            impactLevel: 'SEDANG',
            targetAgency: 'Dinas terkait',
            aiSummary: 'Laporan berhasil dikirim.',
            aiPrediction: 'Sedang menunggu analisis lanjutan.',
            score: 50,
            isDuplicate: false,
          });
        }
      } catch {
        setAnalysisResult({
          reportId: data.id,
          category,
          priority: 'SEDANG',
          impactLevel: 'SEDANG',
          targetAgency: 'Dinas terkait',
          aiSummary: 'Laporan berhasil dikirim.',
          aiPrediction: 'Sedang menunggu analisis lanjutan.',
          score: 50,
          isDuplicate: false,
        });
      }

      navigateTo('analisis');
    } catch {
      setError('Terjadi kesalahan saat mengirim laporan');
      setSubmitting(false);
    }
  };

  const stepLabels = [
    { num: 1, label: 'Detail Laporan' },
    { num: 2, label: 'Kategori & Lokasi' },
    { num: 3, label: 'Kirim' },
  ];

  const [uploading, setUploading] = useState(false);

  const handleImageUploadWithState = async (file: File) => {
    setUploading(true);
    await handleImageUpload(file);
    setUploading(false);
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            Buat Laporan Baru
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Laporkan permasalahan kota Banjarnegara untuk ditangani pemerintah
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {stepLabels.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  step >= s.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {step > s.num ? <CheckCircle2 className="h-4 w-4" /> : s.num}
              </div>
              <span
                className={`hidden text-xs font-medium sm:inline ${
                  step >= s.num ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                {s.label}
              </span>
              {i < stepLabels.length - 1 && (
                <div
                  className={`mx-1 h-0.5 w-6 sm:w-10 transition-colors ${
                    step > s.num ? 'bg-emerald-600' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-4 md:p-6">
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Step 1: Detail Laporan */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-lg font-semibold text-slate-900">Detail Laporan</h2>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">
                    Judul Laporan <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Contoh: Jalan berlubang di depan pasar"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={150}
                  />
                  <p className="text-xs text-slate-400">{title.length}/150 karakter</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Deskripsi <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Jelaskan permasalahan secara detail, termasuk lokasi spesifik, waktu kejadian, dan dampak yang dirasakan..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[120px] resize-none"
                    maxLength={2000}
                  />
                  <p className="text-xs text-slate-400">{description.length}/2000 karakter</p>
                </div>

                <div className="space-y-2">
                  <Label>Foto Pendukung <span className="text-slate-400 font-normal text-xs">(opsional)</span></Label>
                  {imagePreview ? (
                    <div className="relative w-full rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3">
                      <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-24 w-24 rounded-lg border border-slate-200 object-cover"
                          />
                          {uploading && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40">
                              <Loader2 className="h-6 w-6 animate-spin text-white" />
                            </div>
                          )}
                          {imageUrl && !uploading && (
                            <div className="absolute bottom-1 left-1 flex items-center gap-1 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
                              <CheckCircle2 className="h-2.5 w-2.5" />
                              Terunggah
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{fileInputRef.current?.files?.[0]?.name || 'Foto dipilih'}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {uploading ? 'Sedang mengunggah...' : imageUrl ? 'Foto berhasil diunggah' : 'Memproses...'}
                          </p>
                          <button
                            onClick={removeImage}
                            disabled={uploading}
                            className="mt-2 flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors disabled:opacity-40"
                          >
                            <X className="h-3 w-3" /> Hapus foto
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-8 text-slate-400 transition-all hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-600 active:scale-[0.99]"
                    >
                      <ImagePlus className="h-10 w-10" />
                      <div className="text-center">
                        <p className="text-sm font-medium">Klik untuk pilih foto</p>
                        <p className="text-xs mt-0.5">JPG, PNG, WEBP — maks. 5MB</p>
                      </div>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUploadWithState(file);
                    }}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={() => canProceedStep1 && setStep(2)}
                    disabled={!canProceedStep1}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Kategori & Lokasi */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-lg font-semibold text-slate-900">Kategori & Lokasi</h2>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">
                    Kategori <span className="text-red-500">*</span>
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full" id="category">
                      <SelectValue placeholder="Pilih kategori laporan" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="my-4" />

                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-medium text-slate-900">Lokasi</h3>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500">Latitude</Label>
                      <Input
                        type="number"
                        value={latitude}
                        onChange={(e) => setLatitude(Number(e.target.value))}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500">Longitude</Label>
                      <Input
                        type="number"
                        value={longitude}
                        onChange={(e) => setLongitude(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 p-2.5">
                    <MapPin className="h-4 w-4 mt-0.5 text-amber-600 shrink-0" />
                    <p className="text-xs text-amber-700">
                      Lokasi akan otomatis diisi berdasarkan kota Banjarnegara
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Alamat Lengkap (opsional)</Label>
                  <Input
                    id="address"
                    placeholder="Contoh: Jl. Diponegoro No. 15, Banjarnegara"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onBlur={searchAddress}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    disabled={loadingLocation}
                    className="w-full"
                  >
                    {loadingLocation ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                            Mengambil lokasi...
                        </>
                    ) : (
                        <>
                            <MapPin className="mr-2 h-4 w-4"/>
                            Gunakan Lokasi Saya
                        </>
                    )}
                </Button>
                </div>

                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Kembali
                  </Button>
                  <Button
                    onClick={() => canProceedStep2 && setStep(3)}
                    disabled={!canProceedStep2}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Review & Submit */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-lg font-semibold text-slate-900">Konfirmasi Laporan</h2>
                </div>

                <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Judul</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900">{title}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Deskripsi</p>
                    <p className="mt-0.5 text-sm text-slate-700 line-clamp-3">{description}</p>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Kategori</p>
                      <p className="mt-0.5 text-sm font-medium text-slate-900">{category}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Lokasi</p>
                      <p className="mt-0.5 text-sm text-slate-700">
                        {address || 'Banjarnegara, Jawa Tengah'}
                      </p>
                    </div>
                  </div>
                  {imagePreview && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Foto</p>
                        <img
                          src={imagePreview}
                          alt="Report"
                          className="h-24 w-24 rounded-lg border border-slate-200 object-cover"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-start gap-2 rounded-md bg-emerald-50 border border-emerald-200 p-3">
                  <Sparkles className="h-4 w-4 mt-0.5 text-emerald-600 shrink-0" />
                  <p className="text-xs text-emerald-700">
                    Setelah dikirim, laporan akan dianalisis oleh AI untuk menentukan prioritas, dampak, dan dinas yang bertanggung jawab.
                  </p>
                </div>

                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={() => setStep(2)} disabled={submitting}>
                    Kembali
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-emerald-600 hover:bg-emerald-700 min-w-[140px]"
                  >
                    {submitting && !analyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mengirim...
                      </>
                    ) : analyzing ? (
                      <>
                        <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                        Menganalisis AI...
                      </>
                    ) : (
                      'Kirim Laporan'
                    )}
                  </Button>
                </div>

                {analyzing && (
                  <div className="space-y-2 pt-2">
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-2 w-3/4" />
                    <Skeleton className="h-2 w-1/2" />
                    <p className="text-xs text-center text-slate-400 pt-1">
                      AI sedang menganalisis laporan Anda...
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}