import { Controller } from "@nestjs/common";
import { ReviewService } from "./review.service";
import { ApiTags } from "@nestjs/swagger";

@ApiTags('Đánh giá')
@Controller('reviews')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) { }
}