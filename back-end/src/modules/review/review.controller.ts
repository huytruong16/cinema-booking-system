import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../../libs/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/libs/common/guards/role.guard';
import { RoleEnum } from 'src/libs/common/enums';
import { Roles } from 'src/libs/common/decorators/role.decorator';

@ApiTags('Đánh giá')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.KHACHHANG)
  @ApiOperation({ summary: 'Tạo đánh giá mới' })
  async create(@Req() req, @Body() dto: CreateReviewDto) {
    return this.reviewService.createReview(req.user.id, dto);
  }
}
