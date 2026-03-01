// src/types/index.ts

// ==================== API Types ====================
export interface ApiError {
  message: string;
  status?: number;
  data?: unknown;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  perPage?: number;
  sort?: string;
}

export interface PaginationResponse {
  total: number;
  page: number;
  limit: number;
  perPage?: number;
  totalPages: number;
}

// ==================== User & Auth Types ====================
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: "user" | "admin";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  refreshToken?: string;
  user: User;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// ==================== Category Types ====================
export interface Category {
  _id: string;
  nameEn: string;
  nameAr: string;
  name?: string; // Localized
  descriptionEn?: string;
  descriptionAr?: string;
  description?: string; // Localized
  slug: string;
  image?: string;
  status: boolean;
  order: number;
  parentCategory?: Category | string | null;
  subcategories?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  category?: Category;
  data?: Category;
}

export interface CategoriesResponse {
  success: boolean;
  message: string;
  data: Category[];
  count?: number;
  pagination?: PaginationResponse;
}

// ==================== Product Types ====================
export interface Product {
  _id: string;
  productNameEn: string;
  productNameAr: string;
  productName?: string; // Localized
  productDescriptionEn: string;
  productDescriptionAr: string;
  productDescription?: string; // Localized
  productPrice: number;
  oldProductPrice: number;
  productImage: string;
  productImages: string[];
  productSlug: string;
  productCategory: Category | string;
  productQuantity: number;
  productStatus: boolean;
  productRating: number;
  productColorsEn?: string[];
  productColorsAr?: string[];
  productColors?: string[]; // Localized
  productSizesEn?: string[];
  productSizesAr?: string[];
  productSizes?: string[]; // Localized
  hasActiveDiscount: boolean;
  productDiscountPrice: number;
  productDiscountPercentage: number;
  productDiscount?: number;
  productDiscountStartDate?: string;
  productDiscountEndDate?: string;
  NEW: boolean;
  newUntil?: string;
  productCode?: string;
  productReviews?: Review[] | string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductResponse {
  success: boolean;
  message: string;
  data: Product;
}

export interface ProductsResponse {
  success: boolean;
  message: string;
  data: Product[];
  noProduct?: boolean;
  pagination?: PaginationResponse;
  longestExpiryDate?: string;
  discountProgress?: {
    totalDuration: number;
    elapsedDuration: number;
    percentComplete: number;
  };
}

export interface ProductFilters {
  category?: string;
  categories?: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string;
  sizes?: string;
  search?: string;
  sort?:
    | "newest"
    | "price-asc"
    | "price-desc"
    | "name-asc"
    | "name-desc"
    | "discount"
    | "rating";
  discount?: boolean | string;
  new?: boolean | string;
  inStock?: boolean | string;
  rating?: number;
  page?: number;
  limit?: number;
}

export interface AvailableFilters {
  colors: { en: string[]; ar: string[] };
  sizes: { en: string[]; ar: string[] };
  priceRange: { min: number; max: number };
  categories: Array<{
    _id: string;
    count: number;
    nameEn?: string;
    nameAr?: string;
  }>;
  counts: {
    total: number;
    newProducts: number;
    discountedProducts: number;
    inStock: number;
  };
}

export interface CreateProductData {
  productNameEn: string;
  productNameAr: string;
  productDescriptionEn: string;
  productDescriptionAr: string;
  productPrice: number;
  oldProductPrice?: number;
  productCategory: string;
  productQuantity: number;
  productStatus?: boolean;
  productColorsEn?: string[];
  productColorsAr?: string[];
  productSizesEn?: string[];
  productSizesAr?: string[];
  productDiscount?: number;
  productDiscountPercentage?: number;
  productDiscountStartDate?: string;
  productDiscountEndDate?: string;
  NEW?: boolean;
}

// ==================== Cart Types ====================
// src/types/cart.ts
export interface CartItem {
  product: Product;
  quantity: number;
  size?: string | null;
  color?: string | null;
  price: number;
  discountedPrice: number;
  productNameEn?: string;
  productNameAr?: string;
  productImage?: string;
  isAvailable: boolean;
  stockQuantity?: number;
}

export interface AppliedCoupon {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  discountAmount: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  subtotal: number;
  totalDiscount: number;
  totalPrice: number;
  appliedCoupon?: AppliedCoupon | null;
  status: "active" | "abandoned" | "converted" | "expired";
  itemsCount: number;
  uniqueItemsCount: number;
  finalTotal: number;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartSummary {
  itemsCount: number;
  uniqueItemsCount: number;
  subtotal: number;
  totalDiscount: number;
  couponDiscount: number;
  total: number;
  appliedCoupon: string | null;
}

export interface CartResponse {
  status: string;
  success?: boolean;
  message: string;
  data: Cart;
  summary: CartSummary;
  discount?: number;
}

export interface CartValidation {
  valid: boolean;
  message: string;
  unavailable?: Array<{
    productId: string;
    productName?: string;
    requested: number;
    available: number;
    reason: string;
  }>;
  cart?: Cart;
}
export interface AddToCartPayload {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface UpdateCartItemPayload {
  quantity?: number;
  size?: string;
  color?: string;
}

export interface GuestCartItem {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

// ==================== Order Types ====================
export interface OrderItem {
  product: Product | string;
  quantity: number;
  price: number;
  discountedPrice: number;
  size?: string | null;
  color?: string | null;
  productNameEn?: string;
  productNameAr?: string;
  productImage?: string;
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  phoneNumber: string;
  alternatePhone?: string;
  isDefault?: boolean;
}

export interface StatusHistory {
  status: string;
  note?: string;
  changedBy?: string | User;
  changedAt: string;
}

export interface PaymentDetails {
  transactionId?: string;
  paymentIntentId?: string;
  paidAt?: string;
  paymentGateway?: string;
}

export type PaymentMethod = "cod" | "paypal" | "stripe" | "bank_transfer";
export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned"
  | "refunded";
export type ShippingMethod = "standard" | "express" | "same_day";

export interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  user: User | string;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  coupon?: {
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
  };
  paymentMethod: PaymentMethod;
  paymentDetails?: PaymentDetails;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  statusText?: string;
  paymentStatusText?: string;
  paymentMethodText?: string;
  statusHistory: StatusHistory[];
  shippingMethod: ShippingMethod;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  customerNote?: string;
  adminNote?: string;
  cancellationReason?: string;
  returnReason?: string;
  invoiceNumber?: string;
  invoiceUrl?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data: Order;
}

export interface OrdersResponse {
  success: boolean;
  message: string;
  data: Order[];
  pagination?: PaginationResponse;
}

export interface CreateOrderPayload {
  shippingAddress: ShippingAddress;
  paymentMethod?: PaymentMethod;
  shippingMethod?: ShippingMethod;
  customerNote?: string;
  coupon?: string;
  useCart?: boolean;
  items?: Array<{
    productId: string;
    quantity: number;
    size?: string;
    color?: string;
  }>;
}

export interface OrderTrackingInfo {
  orderNumber: string;
  status: OrderStatus;
  statusText: string;
  statusHistory: StatusHistory[];
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  shippingMethod: ShippingMethod;
}

export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

// ==================== Wishlist Types ====================
export interface Wishlist {
  _id: string;
  user: string;
  products: Product[];
  productsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistResponse {
  success: boolean;
  message: string;
  data: {
    wishlist: Product[];
    count?: number;
    added?: boolean;
    action?: "added" | "removed";
    isInWishlist?: boolean;
  };
}

// ==================== Review Types ====================
export interface ReviewUser {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface Review {
  _id: string;
  user: ReviewUser;
  product: Product | string;
  rating: number;
  comment: string;
  images?: string[];
  status: boolean;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  reportCount: number;
  formattedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  total: number;
  distribution: {
    [key: number]: {
      count: number;
      percentage: number;
    };
  };
}

export interface ReviewsResponse {
  success: boolean;
  message: string;
  reviews: Review[];
  pagination?: PaginationResponse;
  stats?: ReviewStats;
}

export interface ReviewResponse {
  success: boolean;
  message: string;
  review: Review;
}

export interface CreateReviewPayload {
  productId: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewPayload {
  rating?: number;
  comment?: string;
  deleteImages?: string[];
}

// ==================== Coupon Types ====================
export type CouponType = "public" | "private" | "first_order" | "birthday";
export type DiscountType = "percentage" | "fixed";

export interface Coupon {
  _id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  name?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minPurchaseAmount: number;
  maxDiscountAmount?: number | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isValid: boolean;
  usageLimit?: number | null;
  usageCount: number;
  usageLimitPerUser: number;
  remainingUses?: number | null;
  type: CouponType;
  applyToShipping: boolean;
  stackable: boolean;
  allowedUsers?: string[];
  allowedCategories?: string[];
  allowedProducts?: string[];
  excludedProducts?: string[];
  allowedPaymentMethods?: PaymentMethod[];
  createdAt: string;
  updatedAt: string;
}

export interface CouponResponse {
  success: boolean;
  message: string;
  coupon: Coupon;
}

export interface CouponsResponse {
  success: boolean;
  message: string;
  coupons: Coupon[];
  pagination?: PaginationResponse;
}

export interface CouponValidation {
  valid: boolean;
  message: string;
  coupon?: Coupon;
  discount?: number;
}

export interface ApplyCouponResponse {
  success: boolean;
  message: string;
  coupon: Coupon;
  discount: number;
  discountedTotal: number;
}

export interface CreateCouponPayload {
  code: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  discountType: DiscountType;
  discountValue: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  usageLimit?: number;
  usageLimitPerUser?: number;
  type?: CouponType;
  applyToShipping?: boolean;
  stackable?: boolean;
  allowedCategories?: string[];
  allowedProducts?: string[];
  excludedProducts?: string[];
  allowedPaymentMethods?: PaymentMethod[];
}

// ==================== Customize (Slider) Types ====================
export interface SlideImage {
  url: string;
  altEn?: string;
  altAr?: string;
  alt?: string;
  order: number;
}

export interface SliderSettings {
  autoPlay: boolean;
  autoPlaySpeed: number;
  showArrows: boolean;
  showDots: boolean;
  loop: boolean;
}

export type SliderType = "hero" | "banner" | "promotional" | "category";

export interface Customize {
  _id: string;
  titleEn: string;
  titleAr: string;
  title?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  description?: string;
  buttonTextEn?: string;
  buttonTextAr?: string;
  buttonText?: string;
  buttonLink?: string;
  slideImages: SlideImage[];
  displayOrder: number;
  isActive: boolean;
  type: SliderType;
  startDate?: string;
  endDate?: string;
  settings: SliderSettings;
  isCurrentlyActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomizeResponse {
  success: boolean;
  message: string;
  data: Customize;
}

export interface CustomizesResponse {
  success: boolean;
  message: string;
  data: Customize[];
  count?: number;
  pagination?: PaginationResponse;
}

export interface CreateCustomizePayload {
  titleEn: string;
  titleAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  buttonTextEn?: string;
  buttonTextAr?: string;
  buttonLink?: string;
  displayOrder?: number;
  isActive?: boolean;
  type?: SliderType;
  startDate?: string;
  endDate?: string;
  settings?: Partial<SliderSettings>;
  imageAlts?: Array<{ altEn?: string; altAr?: string; order?: number }>;
}

// ==================== Dashboard Stats Types ====================
export interface DashboardStats {
  products: {
    total: number;
    active: number;
    outOfStock: number;
  };
  orders: {
    total: number;
    pending: number;
    processing: number;
    delivered: number;
    cancelled: number;
    revenue: number;
  };
  users: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  categories: {
    total: number;
    active: number;
  };
}

export interface RevenueData {
  revenue: Array<{
    _id: string;
    revenue: number;
    orders: number;
  }>;
  total: number;
}

export interface TopProduct {
  _id: string;
  totalQuantity: number;
  totalRevenue: number;
  productNameEn: string;
  productNameAr: string;
  productImage: string;
  productSlug: string;
}

// ==================== Common Utility Types ====================
export type Locale = "en" | "ar";

export interface LocalizedString {
  en: string;
  ar: string;
}

export interface SelectOption {
  value: string;
  label: string;
  labelAr?: string;
}

export interface TableColumn<T = unknown> {
  key: keyof T | string;
  label: string;
  labelAr?: string;
  sortable?: boolean;
  render?: (value: unknown, item: T) => React.ReactNode;
}

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// ==================== Form Types ====================
export interface FormErrors {
  [key: string]: string | undefined;
}

export interface FormTouched {
  [key: string]: boolean;
}

// ==================== Export All ====================
export type {
  // Re-export for convenience
  AxiosError,
  AxiosResponse,
} from "axios";
