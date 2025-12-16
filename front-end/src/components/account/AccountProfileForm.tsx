import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface ProfileFormProps {
  email: string;
  fullName: string;
  setFullName: (value: string) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
}

export function AccountProfileForm({
  email,
  fullName,
  setFullName,
  phoneNumber,
  setPhoneNumber,
}: ProfileFormProps) {

  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            disabled
            className="bg-zinc-800 border-zinc-700"
          />
        </div>

        {/* Tên */}
        <div className="space-y-2">
          <Label htmlFor="fullName">Họ và tên</Label>
          <Input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="bg-zinc-800 border-zinc-700 focus-visible:ring-yellow-500"
          />
        </div>

        {/* Số điện thoại */}
        <div className="space-y-2">
          <Label htmlFor="phone">Số điện thoại</Label>
          <Input
            id="phone"
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="bg-zinc-800 border-zinc-700 focus-visible:ring-yellow-500"
          />
        </div>
      </CardContent>
    </Card>
  );
}