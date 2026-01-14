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

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [memberPoints, setMemberPoints] = useState<number>(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const profile = await getMyProfile();

        setFullName(profile.HoTen || '');
        setPhoneNumber(profile.SoDienThoai || '');
        setAvatarUrl(profile.AvatarUrl);
        setEmail(profile.Email);
        
        // Lấy điểm thành viên từ KhachHangs
        if (profile.KhachHangs && profile.KhachHangs.length > 0) {
          setMemberPoints(profile.KhachHangs[0].Diem || 0);
        }

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

    try {
      const formData = new FormData();
      formData.append('HoTen', fullName.trim());
      
      if (phoneNumber && phoneNumber.trim() !== '') {
        formData.append('SoDienThoai', phoneNumber.trim());
      }
      
      if (avatarFile) {
        formData.append('avatarFile', avatarFile);
      }

      const { message } = await updateMyProfile(formData);
      toast.success(message || "Cập nhật thành công", { id: toastId });

      const updatedProfile = await getMyProfile();
      setFullName(updatedProfile.HoTen || '');
      setPhoneNumber(updatedProfile.SoDienThoai || '');
      setAvatarUrl(updatedProfile.AvatarUrl);
      setAvatarFile(null); // Reset file after successful upload

      if (user) {
        setUser({
          ...user,
          username: updatedProfile.HoTen,
          soDienThoai: updatedProfile.SoDienThoai,
          avatarUrl: updatedProfile.AvatarUrl
        });
      }

    } catch (error: any) {
      console.error('Lỗi khi cập nhật:', error);
      const errMsg = error.response?.data?.message || 'Cập nhật thất bại.';
      toast.error(errMsg, { id: toastId });
    }
  };

  const handleAvatarChange = (file: File, previewUrl: string) => {
    setAvatarFile(file);
    setAvatarUrl(previewUrl);
  }

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
            fullName={fullName}
            setFullName={setFullName}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
          />
        </div>

        {/* Cột phải: Avatar */}
        <div className="md:col-span-1 dark">
          <AvatarUpload
            currentAvatarUrl={avatarUrl || ''}
            onAvatarChange={handleAvatarChange}
          />
          
          {/* Điểm thành viên */}
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/10 mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-yellow-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-400">Điểm thành viên</h3>
                <p className="text-3xl font-bold text-yellow-500 mt-1">{memberPoints.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
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
      {/*       <p className="mt-4 text-sm text-gray-400">
          Đặt mật khẩu, nhấn vào{' '}
          <Link 
            href="/account/change-password" 
            className="font-medium text-yellow-500 hover:text-yellow-400"
          >
            đây
          </Link>
        </p> */}
    </div>
  );
}