'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Upload } from 'lucide-react';
import { useRef, ChangeEvent } from 'react';

interface AvatarUploadProps {
  currentAvatarUrl: string;
  onAvatarChange: (file: File, previewUrl: string) => void; // Callback mới nhận File
}

export function AvatarUpload({
  currentAvatarUrl,
  onAvatarChange,
}: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fallbackText = 'HL'; 

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onAvatarChange(file, previewUrl);
    }
  };

  return (
    <div className="flex flex-col items-center pt-8 space-y-4">
      <Avatar className="h-40 w-40 border-4 border-zinc-700">
        <AvatarImage src={currentAvatarUrl} alt="User Avatar" className="object-cover" />
        <AvatarFallback className="text-6xl">{fallbackText}</AvatarFallback>
      </Avatar>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={handleFileSelect}
      />

      <Button
        variant="outline"
        className="bg-transparent border-zinc-700 hover:bg-zinc-800 hover:text-white"
        onClick={() => fileInputRef.current?.click()} 
        type="button"
      >
        <Upload className="w-4 h-4 mr-2" />
        Tải ảnh lên
      </Button>
    </div>
  );
}