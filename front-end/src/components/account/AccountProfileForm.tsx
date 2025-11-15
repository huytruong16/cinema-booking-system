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
          <Label htmlFor="displayName">Tên hiển thị</Label>
          <Input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)} // 3. Dùng prop
            className="bg-zinc-800 border-zinc-700 focus-visible:ring-yellow-500"
          />
        </div>

        {/* Giới tính */}
        <div className="space-y-3">
          <Label>Giới tính</Label>
          <RadioGroup
            value={gender}
            onValueChange={(val) => setGender(val as 'male' | 'female' | 'other')} // 4. Dùng prop
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male" className="font-normal">
                Nam
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female" className="font-normal">
                Nữ
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other" className="font-normal">
                Không xác định
              </Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}