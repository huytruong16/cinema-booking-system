export interface Movie {
  id: string | number;
  title: string;
  subTitle?: string;
  posterUrl: string;
  backdropUrl?: string;
  description?: string;
  trailerUrl?: string;
  year?: number;
  status?: "now_showing" | "coming_soon" | "ended";
  ageRating?: string;
  type?: string;           
  tags?: string[];
  rating?: number;         
  duration?: string;
  actorList?: string;       
  country?: string;        
  price?: number;         
  cinema?: string;         
  views?: number;          
}
