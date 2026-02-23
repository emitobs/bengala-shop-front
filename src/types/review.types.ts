export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isApproved: boolean;
  isVerified: boolean;
  user: { firstName: string; lastName: string };
  createdAt: string;
}
