'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Building2, ArrowLeft, Mail, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const { navigateTo, setUser, user } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Email dan password wajib diisi');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        toast.success(`Selamat datang, ${data.name}!`);
        navigateTo(data.role === 'ADMIN' ? 'dashboard-pemerintah' : 'dashboard-warga');
      } else {
        toast.error(data.error || 'Login gagal');
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
            <CardTitle className="text-xl">Masuk ke Akun Anda</CardTitle>
            <CardDescription>Masukkan email dan password untuk melanjutkan</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="login-email" className="flex items-center gap-1.5">
                  <Mail className="size-3.5" />
                  Email
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="login-password" className="flex items-center gap-1.5">
                  <Lock className="size-3.5" />
                  Password
                </Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
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
                    Memproses...
                  </>
                ) : (
                  'Masuk'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Belum punya akun? </span>
              <button
                onClick={() => navigateTo('register')}
                className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
              >
                Daftar Sekarang
              </button>
            </div>

            {/* Demo credentials hint */}
            <div className="mt-4 p-3 rounded-lg bg-muted/50 border">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Akun Demo:</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p><span className="font-medium">Admin:</span> admin@wonosobo.go.id / admin123</p>
                <p><span className="font-medium">Warga:</span> budi@email.com / warga123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}