'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Building2, ArrowLeft, Mail, Lock, User, Phone, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const { navigateTo, setUser } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Nama, email, dan password wajib diisi');
      return;
    }
    if (password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Konfirmasi password tidak cocok');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone: phone || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Akun berhasil dibuat! Mengalihkan...');
        // Auto-login after register
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const loginData = await loginRes.json();
        if (loginRes.ok) {
          setUser(loginData);
          navigateTo('dashboard-warga');
        } else {
          navigateTo('login');
        }
      } else {
        toast.error(data.error || 'Registrasi gagal');
      }
    } catch {
      toast.error('Terjadi kesalahan koneksi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => navigateTo('landing')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Kembali ke Beranda
        </button>

        <Card className="shadow-lg border-emerald-100">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-3">
              <div className="flex items-center gap-2">
                <Building2 className="size-8 text-emerald-600" />
                <span className="text-2xl font-bold text-emerald-600">SmartCityzen</span>
              </div>
            </div>
            <CardTitle className="text-xl">Buat Akun Baru</CardTitle>
            <CardDescription>Daftar untuk mulai melaporkan aspirasi Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="reg-name" className="flex items-center gap-1.5">
                  <User className="size-3.5" />
                  Nama Lengkap
                </Label>
                <Input
                  id="reg-name"
                  placeholder="Masukkan nama lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reg-email" className="flex items-center gap-1.5">
                  <Mail className="size-3.5" />
                  Email
                </Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reg-phone" className="flex items-center gap-1.5">
                  <Phone className="size-3.5" />
                  Nomor Telepon
                </Label>
                <Input
                  id="reg-phone"
                  type="tel"
                  placeholder="08xxxxxxxxxx (opsional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reg-password" className="flex items-center gap-1.5">
                  <Lock className="size-3.5" />
                  Password
                </Label>
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reg-confirm" className="flex items-center gap-1.5">
                  <Lock className="size-3.5" />
                  Konfirmasi Password
                </Label>
                <Input
                  id="reg-confirm"
                  type="password"
                  placeholder="Ulangi password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Mendaftar...
                  </>
                ) : (
                  'Daftar Sekarang'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Sudah punya akun? </span>
              <button
                onClick={() => navigateTo('login')}
                className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
              >
                Masuk
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}