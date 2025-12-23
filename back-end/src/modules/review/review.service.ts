import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(userId: string, dto: CreateReviewDto) {
    const { MaPhim, NoiDung, Diem } = dto;

    const movie = await this.prisma.pHIM.findUnique({
      where: { MaPhim },
    });

    if (!movie) {
      throw new NotFoundException('Phim không tồn tại');
    }

    const review = await this.prisma.dANHGIA.create({
      data: {
        MaPhim,
        MaNguoiDung: userId,
        NoiDung,
        Diem,
      },
    });

    await this.updateMovieRating(MaPhim);

    return review;
  }

  async updateMovieRating(MaPhim: string) {
    const reviews = await this.prisma.dANHGIA.findMany({
      where: { MaPhim },
      select: { Diem: true },
    });

    if (reviews.length > 0) {
      const totalScore = reviews.reduce((sum, review) => sum + review.Diem, 0);
      const averageScore = totalScore / reviews.length;
      const roundedScore = Math.round(averageScore * 10) / 10;

      await this.prisma.pHIM.update({
        where: { MaPhim },
        data: { DiemDanhGia: roundedScore },
      });
    }
  }
}
