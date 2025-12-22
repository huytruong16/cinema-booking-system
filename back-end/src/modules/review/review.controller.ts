import { Controller, Post, Body, UseGuards, Req } from "@nestjs/common";
import { ReviewService } from "./review.service";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiCreatedResponse } from "@nestjs/swagger";
import { CreateReviewDto } from "./dto/create-review.dto";
import { JwtAuthGuard } from "../../libs/common/guards/jwt-auth.guard";

@ApiTags('Đánh giá')
@Controller('reviews')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Tạo đánh giá mới' })
    async create(@Req() req, @Body() dto: CreateReviewDto) {
        return this.reviewService.createReview(req.user.id, dto);
    }
}