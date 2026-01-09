'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { changePassword } from '@/services/user.service';

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const passwordError =
  'Mật khẩu phải có ít nhất 8 ký tự, bao gồm 1 chữ hoa, 1 chữ thường, 1 số, và 1 ký tự đặc biệt (@$!%*?&).';

export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (!passwordRegex.test(newPassword)) {
      toast.error(passwordError, {
        duration: 8000, 
      });
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading('Đang thay đổi mật khẩu...');

    try {
      const response = await changePassword({
        MatKhauCu: oldPassword,
        MatKhauMoi: newPassword,
      });
      const message = (response as { message: string }).message;

      toast.success(message, { id: toastId });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || 'Đổi mật khẩu thất bại.';
      toast.error(errMsg, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl dark">
      <h1 className="text-3xl font-bold text-white">Đổi mật khẩu</h1>
      <p className="mt-1 text-gray-400">
        Cập nhật mật khẩu mới cho tài khoản của bạn.
      </p>

      <Card className="mt-8">
        <CardContent className="pt-6 space-y-4">
          {/* Mật khẩu cũ */}
          <div className="space-y-2">
            <Label htmlFor="oldPass">Mật khẩu cũ</Label>
            <Input
              id="oldPass"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-zinc-800 border-zinc-700 focus-visible:ring-yellow-500"
            />
          </div>

          {/* Mật khẩu mới */}
          <div className="space-y-2">
            <Label htmlFor="newPass">Mật khẩu mới</Label>
            <Input
              id="newPass"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-zinc-800 border-zinc-700 focus-visible:ring-yellow-500"
            />
            <p className="text-xs text-gray-400">
              Ít nhất 8 ký tự, gồm 1 chữ hoa, 1 thường, 1 số, 1 ký tự đặc biệt.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPass">Xác nhận mật khẩu mới</Label>
            <Input
              id="confirmPass"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-zinc-800 border-zinc-700 focus-visible:ring-yellow-500"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-yellow-500 text-black hover:bg-yellow-600 focus-visible:ring-yellow-500"
          >
            {isLoading ? 'Đang lưu...' : 'Lưu mật khẩu'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}