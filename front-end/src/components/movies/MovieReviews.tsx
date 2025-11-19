'use client';

import React, { useState } from 'react';
import { Star, MessageSquare, ThumbsUp, PenLine } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { mockReviews } from '@/lib/mockData';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface MovieReviewsProps {
  movieId: string | number;
  movieRating?: number; 
}

export function MovieReviews({ movieId, movieRating }: MovieReviewsProps) {
  const [reviews, setReviews] = useState(
    mockReviews.filter(r => r.movieId.toString() === movieId.toString())
  );
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0); 
  const [reviewContent, setReviewContent] = useState("");

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) 
    : (movieRating || 0);

  const handleSubmitReview = () => {
    if (userRating === 0) {
      toast.error("Vui lòng chọn số sao đánh giá!");
      return;
    }
    if (reviewContent.trim().length < 10) {
      toast.error("Nội dung đánh giá quá ngắn (tối thiểu 10 ký tự).");
      return;
    }

    const newReview = {
      id: Date.now(), 
      movieId: Number(movieId),
      user: "Bạn (Mới)", 
      avatar: "", 
      rating: userRating * 2, 
      date: "Vừa xong",
      content: reviewContent,
    };

    setReviews([newReview, ...reviews]);
    
    setUserRating(0);
    setReviewContent("");
    setIsDialogOpen(false);
    toast.success("Đánh giá của bạn đã được đăng thành công!");
  };

  return (
    <div className="w-full text-white">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-7 h-7 text-primary" />
        <h2 className="text-3xl font-bold">Đánh giá & Bình luận</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-[#1C1C1C] border border-zinc-800 rounded-xl p-6 sticky top-24">
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-white mb-2">{averageRating.toFixed(1)}/10</div>
              <div className="flex justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${i < Math.round(averageRating / 2) ? 'text-yellow-500 fill-yellow-500' : 'text-zinc-600'}`} 
                  />
                ))}
              </div>
              <p className="text-zinc-400 text-sm">Dựa trên {reviews.length} bài đánh giá</p>
            </div>

            <Separator className="bg-zinc-800 my-4" />
            <div className="space-y-2 mb-6">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-3 font-bold text-white">{star}</span>
                  <Star className="w-3 h-3 text-zinc-500" />
                  <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 rounded-full" 
                      style={{ width: star >= 4 ? '40%' : '10%' }} 
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700">
                  <PenLine className="w-4 h-4 mr-2" />
                  Viết đánh giá
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1C1C1C] border-zinc-800 text-white sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Đánh giá phim</DialogTitle>
                  <DialogDescription className="text-zinc-400">
                    Chia sẻ suy nghĩ của bạn về bộ phim này. Đánh giá của bạn sẽ giúp ích cho người khác.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  <div className="flex flex-col items-center gap-2">
                    <Label className="text-zinc-300">Bạn chấm phim này mấy điểm?</Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="focus:outline-none transition-transform hover:scale-110"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setUserRating(star)}
                        >
                          <Star 
                            className={`w-8 h-8 ${
                              star <= (hoverRating || userRating) 
                                ? 'text-yellow-400 fill-yellow-400' 
                                : 'text-zinc-600'
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-sm font-medium text-yellow-400 h-5">
                      {userRating > 0 ? (userRating === 5 ? "Tuyệt vời!" : userRating === 4 ? "Rất hay" : userRating === 3 ? "Bình thường" : "Tệ") : ""}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="review">Nội dung đánh giá</Label>
                    <Textarea 
                      id="review" 
                      placeholder="Hãy chia sẻ cảm nhận của bạn về nội dung, diễn viên, kỹ xảo..." 
                      className="bg-zinc-900 border-zinc-700 min-h-[120px] text-white placeholder:text-zinc-500"
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button onClick={() => setIsDialogOpen(false)} className="bg-amber-800 hover:bg-amber-600 text-white">Hủy</Button>
                  <Button onClick={handleSubmitReview} className="bg-primary hover:bg-primary/90">Gửi đánh giá</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="bg-[#1C1C1C] border border-zinc-800 p-5 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={review.avatar} />
                      <AvatarFallback>{review.user[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-white text-sm">{review.user}</h4>
                      <p className="text-xs text-zinc-500">{review.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-md border border-yellow-500/20">
                    <span className="text-yellow-500 font-bold text-sm">{review.rating > 5 ? review.rating/2 : review.rating}</span> {/* Giả lập hiển thị 5 sao */}
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  </div>
                </div>

                <p className="mt-4 text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                  {review.content}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
              Chưa có đánh giá nào. Hãy là người đầu tiên!
            </div>
          )}
        </div>

      </div>
    </div>
  );
}