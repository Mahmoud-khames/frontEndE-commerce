export interface IProduct {
  _id: string;
  productName: string;
  productSizes: string[];
  productPrice: number;
  productDescription: string;
  productImage: string;
  productCategory: {
    _id: string;
    name: string;
  } | string;
  productRating: number;
  productReviews: any[]; 
  productQuantity: number;
  productStatus: boolean;
  productImages: string[];
  oldProductPrice: number;
  productDiscount: number;
  productDiscountPrice: number;
  productDiscountPercentage: number;
  productDiscountStartDate: string | null;
  productDiscountEndDate: string | null;
  productColors: string[];
  productSlug: string;
  hasActiveDiscount: boolean;
  NEW: boolean;
  newUntil: string | null;
}
