import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';

interface ProfileFormProps {
  email: string;
  displayName: string;
  setDisplayName: (value: string) => void;
  gender: 'male' | 'female' | 'other' | undefined;
  setGender: (value: 'male' | 'female' | 'other') => void;
}

export function AccountProfileForm({
  email,
  displayName,
  setDisplayName,
  gender,
  setGender,
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
          <Label htmlFor="displayName">Họ và tên</Label>
          <Input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)} // 3. Dùng prop
            className="bg-zinc-800 border-zinc-700 focus-visible:ring-yellow-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="displayName">Số điện thoại</Label>
          <Input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)} // 3. Dùng prop
            className="bg-zinc-800 border-zinc-700 focus-visible:ring-yellow-500"
          />
        </div>
      </CardContent>
    </Card>
  );
}