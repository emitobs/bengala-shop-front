export interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  type: 'SIZE' | 'COLOR' | 'MATERIAL' | 'STYLE' | 'OTHER';
  price: number;
  compareAtPrice: number | null;
  stock: number;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  children?: Category[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription: string | null;
  basePrice: number;
  compareAtPrice: number | null;
  categoryId?: string;
  category?: Category;
  categories?: Category[];
  images: ProductImage[];
  variants: ProductVariant[];
  isActive: boolean;
  isFeatured: boolean;
  averageRating: number | null;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}
