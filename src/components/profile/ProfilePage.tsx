'use client';

import { useState, useEffect, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  Mail,
  Phone,
  Shield,
  Award,
  LogOut,
  Edit,
  Save,
  Loader2,
  MessageSquare,
  FileText,
  Star,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';

interface ProfileStats {
  points: number;
  totalLaporan: number;
  totalKomentar: number;
}

function getBadgeInfo(points: number) {
  if (points >= 100) {
    return {
      label: 'Pahlawan Kota',
      color: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: <Award className="size-5 text-amber-600" />,
      description: 'Kontribusi luar biasa untuk kota Wonosobo!',
    };
  }
  if (points >= 51) {
    return {
      label: 'Peduli Kota',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: <Award className="size-5 text-emerald-600" />,
      description: 'Anda peduli terhadap pembangunan kota.',
    };
  }
  if (points >= 11) {
    return {
      label: 'Aktif',
      color: 'bg-green-100 text-green-800 border-green-300',
      icon: <Star className="size-5 text-green-600" />,
      description: 'Terus aktif berpartisipasi!',
    };
  }
  return {
    label: 'Pemula',
    color: 'bg-gray-100 text-gray-600 border-gray-300',
    icon: <User className="size-5 text-gray-500" />,
    description: 'Mulai berpartisipasi untuk naik level.',
  };
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfilePage() {
  const { user, logout, navigateTo, setUser } = useStore();
  const [stats, setStats] = useState<ProfileStats>({
    points: 0,
    totalLaporan: 0,
    totalKomentar: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/profile?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setStats({
          points: data.points ?? 0,
          totalLaporan: data.totalLaporan ?? 0,
          totalKomentar: data.totalKomentar ?? 0,
        });
      }
    } catch {
      toast.error('Gagal memuat data profil');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditPhone(user.phone ?? '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: editName,
          phone: editPhone,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser({ ...user, name: data.name, phone: data.phone });
        setIsEditing(false);
        toast.success('Profil berhasil diperbarui');
        fetchProfile();
      } else {
        toast.error('Gagal memperbarui profil');
      }
    } catch {
      toast.error('Terjadi kesalahan saat menyimpan');
    } finally {
      setIsSaving(false);
    }
  };

  const badgeInfo = getBadgeInfo(stats.points);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Silakan masuk terlebih dahulu.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 px-4 pb-8">
      {/* Profile Header Card */}
      <Card className="w-full max-w-2xl">
        <CardContent className="flex flex-col items-center gap-4 pt-2">
          <Avatar className="size-24 border-4 border-emerald-200">
            {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-2xl font-bold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5 mt-1">
              <Mail className="size-3.5" />
              {user.email}
            </p>
            <Badge
              className={`mt-2 ${user.role === 'ADMIN' ? 'bg-red-100 text-red-700 border-red-300' : 'bg-emerald-100 text-emerald-700 border-emerald-300'}`}
              variant="outline"
            >
              <Shield className="size-3" />
              {user.role}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
        <Card className="text-center">
          <CardContent className="pt-2 pb-4 px-2">
            <div className="flex items-center justify-center text-amber-500 mb-1">
              <Star className="size-6" />
            </div>
            {isLoading ? (
              <Loader2 className="size-5 animate-spin mx-auto text-muted-foreground" />
            ) : (
              <p className="text-2xl font-bold">{stats.points}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">Poin</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-2 pb-4 px-2">
            <div className="flex items-center justify-center text-emerald-500 mb-1">
              <FileText className="size-6" />
            </div>
            {isLoading ? (
              <Loader2 className="size-5 animate-spin mx-auto text-muted-foreground" />
            ) : (
              <p className="text-2xl font-bold">{stats.totalLaporan}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">Total Laporan</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-2 pb-4 px-2">
            <div className="flex items-center justify-center text-blue-500 mb-1">
              <MessageSquare className="size-6" />
            </div>
            {isLoading ? (
              <Loader2 className="size-5 animate-spin mx-auto text-muted-foreground" />
            ) : (
              <p className="text-2xl font-bold">{stats.totalKomentar}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">Total Komentar</p>
          </CardContent>
        </Card>
      </div>

      {/* Participation Badge */}
      <Card className="w-full max-w-2xl">
        <CardContent className="pt-2">
          <div className="flex items-center gap-3 p-4 rounded-lg border border-dashed border-muted-foreground/30">
            <div className="flex-shrink-0">{badgeInfo.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold">Lencana Partisipasi:</span>
                <Badge className={badgeInfo.color} variant="outline">
                  {badgeInfo.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{badgeInfo.description}</p>
              {/* Progress bar toward next badge */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Poin saat ini</span>
                  <span>{stats.points} poin</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      stats.points >= 100
                        ? 'bg-amber-500'
                        : stats.points >= 51
                          ? 'bg-emerald-500'
                          : stats.points >= 11
                            ? 'bg-green-500'
                            : 'bg-gray-400'
                    }`}
                    style={{ width: `${Math.min((stats.points / 100) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Form */}
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Edit className="size-5" />
              Informasi Profil
            </CardTitle>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="size-3.5" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          {/* Name */}
          <div className="grid gap-2">
            <Label htmlFor="profile-name" className="flex items-center gap-1.5">
              <User className="size-3.5" />
              Nama Lengkap
            </Label>
            <Input
              id="profile-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              disabled={!isEditing}
              placeholder="Masukkan nama lengkap"
            />
          </div>

          {/* Phone */}
          <div className="grid gap-2">
            <Label htmlFor="profile-phone" className="flex items-center gap-1.5">
              <Phone className="size-3.5" />
              Nomor Telepon
            </Label>
            <Input
              id="profile-phone"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              disabled={!isEditing}
              placeholder="Masukkan nomor telepon"
            />
          </div>

          {/* Email (read-only) */}
          <div className="grid gap-2">
            <Label htmlFor="profile-email" className="flex items-center gap-1.5">
              <Mail className="size-3.5" />
              Email
            </Label>
            <Input
              id="profile-email"
              value={user.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">Email tidak dapat diubah.</p>
          </div>

          {/* Role (read-only) */}
          <div className="grid gap-2">
            <Label htmlFor="profile-role" className="flex items-center gap-1.5">
              <Shield className="size-3.5" />
              Peran
            </Label>
            <Input
              id="profile-role"
              value={user.role}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">Peran ditentukan oleh sistem.</p>
          </div>

          {/* Save / Cancel buttons when editing */}
          {isEditing && (
            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleSave} disabled={isSaving || !editName.trim()}>
                {isSaving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Simpan
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditName(user.name);
                  setEditPhone(user.phone ?? '');
                }}
                disabled={isSaving}
              >
                Batal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() =>
            navigateTo(user.role === 'ADMIN' ? 'dashboard-pemerintah' : 'dashboard-warga')
          }
        >
          <ArrowLeft className="size-4" />
          Kembali ke Dashboard
        </Button>
        <Button
          variant="destructive"
          className="flex-1"
          onClick={() => {
            logout();
            toast.info('Anda telah keluar');
          }}
        >
          <LogOut className="size-4" />
          Keluar
        </Button>
      </div>
    </div>
  );
}