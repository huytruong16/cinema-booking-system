'use client';

import { AccountProfileForm } from '@/components/account/AccountProfileForm';
import { AvatarUpload } from '@/components/account/AvatarUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { getMyProfile, updateMyProfile } from '@/services/user.service';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | undefined>(undefined);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const profile = await getMyProfile();
        
        setDisplayName(profile.display_name || profile.username);
        setGender(profile.gender || undefined);
        setAvatarUrl(profile.avatar_url);
        setEmail(profile.email);

      } catch (error) {
        console.error('Lỗi khi tải profile:', error);
        toast.error('Không thể tải thông tin tài khoản.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async () => {
    const toastId = toast.loading('Đang cập nhật thông tin...');
    
    const updateData = {
      display_name: displayName,
      gender: gender,
      avatar_url: avatarUrl,
    };

    try {
      const { message, data: updatedProfile } = await updateMyProfile(updateData);
      toast.success(message, { id: toastId });

      if (setUser && user) {
        setUser({
          ...user,
          display_name: updatedProfile.display_name ?? undefined,
          avatarUrl: updatedProfile.avatar_url,
        });
      }
    } catch (error: any) {
      console.error('Lỗi khi cập nhật:', error);
      const errMsg = error.response?.data?.message || 'Cập nhật thất bại.';
      toast.error(errMsg, { id: toastId });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-white">Tài khoản</h1>
        <p className="mt-1 text-gray-400">Cập nhật thông tin tài khoản</p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Cột trái: Form Skeleton */}
          <div className="md:col-span-2">
            <Card>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-1">
            <div className="flex flex-col items-center pt-8 space-y-4">
              <Skeleton className="h-40 w-40 rounded-full" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-white">Tài khoản</h1>
      <p className="mt-1 text-gray-400">Cập nhật thông tin tài khoản</p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Cột trái: Form */}
        <div className="md:col-span-2 dark">
          <AccountProfileForm
            email={email}
            displayName={displayName}
            setDisplayName={setDisplayName}
            gender={gender}
            setGender={setGender}
          />
        </div>

        {/* Cột phải: Avatar */}
        <div className="md:col-span-1 dark">
          <AvatarUpload
            currentAvatarUrl={avatarUrl || ''}
            onAvatarUrlChange={setAvatarUrl}
          />
        </div>
      </div>
      
      <div className="mt-8">
        <Button
          onClick={handleSubmit}
          className="bg-yellow-500 text-black hover:bg-yellow-600 focus-visible:ring-yellow-500"
        >
          Lưu thay đổi
        </Button>
      </div>
      <p className="mt-4 text-sm text-gray-400">
          Đặt mật khẩu, nhấn vào{' '}
          <Link 
            href="/account/change-password" 
            className="font-medium text-yellow-500 hover:text-yellow-400"
          >
            đây
          </Link>
        </p>
    </div>
  );
}