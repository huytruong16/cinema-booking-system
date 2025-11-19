import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ArrowNavigationProps {
  onPrev?: () => void
  onNext?: () => void
}

export function ArrowNavigation({ onPrev, onNext }: ArrowNavigationProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <Button
        onClick={onPrev}
        className="bg-red-600 hover:bg-red-700 w-10 h-10 rounded-lg flex items-center justify-center"
      >
        <ChevronLeft className="w-6 h-6 text-black size-2" />
      </Button>

      <div className="w-3 h-3 bg-white rounded-xs" />

      <Button
        onClick={onNext}
        className="bg-red-600 hover:bg-red-700 w-10 h-10 rounded-lg flex items-center justify-center"
      >
        <ChevronRight className="w-6 h-6 text-black size-2"/>
      </Button>
    </div>
  )
}
