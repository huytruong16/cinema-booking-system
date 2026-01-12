import { Movie } from './movie';

export interface TopMovieBanner {
    rank: number;
    movie: Movie;
    ticketsSold: number;
    revenue: number;
}
