import Image from 'next/image';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative">
        {/* Spinning ring */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-24 w-24 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
        </div>
        
        {/* Logo in center */}
        <div className="flex h-24 w-24 items-center justify-center">
          <Image
            src="/images/logo_mini.png"
            alt="Loading..."
            width={48}
            height={48}
            className="animate-pulse"
            priority
          />
        </div>
      </div>
    </div>
  );
}
