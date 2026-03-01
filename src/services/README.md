# Services Structure

## Overview
Services handle API communication and business logic. All services are thin wrappers around API calls with proper error handling.

## Available Services

### authService.ts
Authentication-related API calls:
- `login(credentials)` - User login
- `register(data)` - User registration
- `logout()` - User logout
- `getCurrentUser()` - Fetch current authenticated user
- `updateProfile(data)` - Update user profile
- `resetPassword(email)` - Request password reset

### productService.ts
Product management:
- `getProducts(filters)` - Fetch products with filters
- `getProductById(id)` - Get single product details
- `searchProducts(query)` - Search products
- `getProductsByCategory(categoryId)` - Get products by category

### categoryService.ts
Category management:
- `getCategories()` - Fetch all categories
- `getCategoryById(id)` - Get category details
- `createCategory(data)` - Create new category (admin)
- `updateCategory(id, data)` - Update category (admin)

### cartService.ts
Shopping cart operations:
- `getCart()` - Get user's cart
- `addToCart(productId, quantity)` - Add item to cart
- `updateCartItem(itemId, quantity)` - Update cart item quantity
- `removeFromCart(itemId)` - Remove item from cart
- `clearCart()` - Clear entire cart

### orderService.ts
Order management:
- `getOrders()` - Get user's orders
- `getOrderById(id)` - Get order details
- `createOrder(data)` - Create new order
- `updateOrderStatus(id, status)` - Update order status (admin)

### wishlistService.ts
Wishlist management:
- `getWishlist()` - Get user's wishlist
- `addToWishlist(productId)` - Add product to wishlist
- `removeFromWishlist(productId)` - Remove from wishlist
- `isInWishlist(productId)` - Check if product is in wishlist

### reviewService.ts
Product reviews:
- `getProductReviews(productId)` - Get reviews for a product
- `createReview(productId, data)` - Submit new review
- `updateReview(reviewId, data)` - Update review
- `deleteReview(reviewId)` - Delete review

### couponService.ts
Coupon/discount management:
- `validateCoupon(code)` - Validate coupon code
- `getCouponDetails(code)` - Get coupon details
- `applyCoupon(code)` - Apply coupon to cart

### customizeService.ts
Product customization:
- `getCustomizations()` - Get available customizations
- `customizeProduct(productId, options)` - Create custom product

## Usage with Hooks

Services are typically used through custom hooks in `src/hooks/`:

```tsx
// useProducts.ts uses productService
const { products, isLoading } = useProducts();

// useCart.ts uses cartService
const { cart, addToCart } = useCart();

// useAuth.ts uses authService
const { user, login, logout } = useAuth();
```

## Error Handling

All services include:
- Try-catch error handling
- Proper error messages
- Toast notifications on failure
- Axios interceptor for token refresh

## API Configuration

Base URL and interceptors configured in axios instance (see individual service files).
