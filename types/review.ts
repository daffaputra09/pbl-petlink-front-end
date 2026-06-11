export type ReviewRatingFilter = "Semua" | 1 | 2 | 3 | 4 | 5;

export interface ClinicReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  bookingId: string;
  reviewerName: string;
  petName: string | null;
  bookingDate: string | null;
}

export interface AdminReviewItem extends ClinicReviewItem {
  clinicId: string;
  clinicName: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  breakdown: Record<"1" | "2" | "3" | "4" | "5", number>;
}
