export interface CartItem {
  id: string;
  productId: string;
  variantId: string | null;
  name: string;
  variantName: string | null;
  imageUrl: string | null;
  price: number;
  compareAtPrice: number | null;
  quantity: number;
  stock: number;
  slug: string;
}
