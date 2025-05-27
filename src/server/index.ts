import axios from "axios";

// إعداد الـ API مع معالجة أفضل للأخطاء
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  timeout: 15000, // زيادة مهلة الانتظار لتجنب الأخطاء المؤقتة
});

// Auth endpoints
export const login = (data: { email: string; password: string }) =>
  api.post("/api/auth/signin", data);
export const register = (data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  cPassword: string;
}) => api.post("/api/auth/signup", data);

// Product endpoints
export const getProducts = () => api.get("/api/product");
export const createProduct = (data: FormData) =>
  api.post("/api/product", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const updateProduct = (data: FormData, productSlug: string) =>
  api.put(`/api/product/${productSlug}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const getProduct = (slug: string) => api.get(`/api/product/${slug}`);
export const deleteProduct = (slug: string) =>
  api.delete(`/api/product/${slug}`);
export const searchProducts = (query: string) =>
  api.get(`/api/product/search/${query}`);

// Category endpoints
export const getCategories = () => api.get("/api/category");
export const getCategoryById = (id: string) => api.get(`/api/category/${id}`);
export const createCategory = (data: FormData) =>
  api.post("/api/category", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const updateCategory = (data: FormData, categoryId: string) =>
  api.put(`/api/category/${categoryId}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const deleteCategory = (categoryId: string) =>
  api.delete(`/api/category/${categoryId}`);

// Cart endpoints
export const getCart = () => api.get("/api/cart");
export const addToCart = (data: {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
  price?: number;
  discount?: number;
}) => api.post("/api/cart", data);
export const updateCart = (id: string, data: { quantity: number }) =>
  api.put(`/api/cart/${id}`, data);
export const removeFromCart = (id: string) => api.delete(`/api/cart/${id}`);
export const clearCart = () => api.delete("/api/cart/clear");

// Order endpoints
export const createOrder = (data: {
  shippingAddress: string;
  phoneNumber: string;
  paymentMethod?: string;
  couponApplied?: string;
  discountAmount?: number;
  totalAmount?: number;
}) => api.post("/api/order", data);

export const getOrders = () => api.get("/api/order");
export const getUserOrders = () => api.get("/api/order/user");
export const getOrderById = (id: string) => api.get(`/api/order/${id}`);
export const updateOrderStatus = (id: string, status: string) => 
  api.put(`/api/order/${id}`, { status });
export const deleteOrder = (id: string) => api.delete(`/api/order/${id}`);


// Review endpoints
export const createReview = (data: {
  productId: string;
  rating: number;
  comment: string;
}) => api.post("/api/review", data);
export const getProductReviews = (productId: string) =>
  api.get(`/api/review/${productId}`);

export const uploadReviewImage = (data: FormData) =>
  api.post("/api/review/uploadReviewImage", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const deleteReview = (reviewId: string) =>
  api.delete(`/api/review/${reviewId}`);

// Wishlist endpoints
export const getWishlistProducts = () => api.get("/api/wishlist");
export const addToWishlist = (productId: string) =>
  api.post("/api/wishlist", { productId });
export const removeFromWishlist = (productId: string) =>
  api.delete(`/api/wishlist/${productId}`);
export const clearWishlist = () => api.delete("/api/wishlist/clear");

// User endpoints
export const getUsers = () => api.get("/api/user");
export const updateUser = (data: FormData) =>
  api.put(`/api/user/${data.get("uId")}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const registerUser = (data: FormData) =>
  api.post("/api/user", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const deleteUser = (uId: string) => api.delete(`/api/user/${uId}`);

// Customize endpoints
export const getCustomizeImages = () => api.get("/api/customize");
export const uploadSlideImage = (data: FormData) =>
  api.post("/api/customize/uploadSlideImage", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const deleteSlideImage = (data: { id: string; imageIndex: number }) =>
  api.delete("/api/customize/deleteSlideImage", { data });
export const updateCustomize = (data: FormData, id: string) =>
  api.put(`/api/customize/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// Dashboard stats endpoints
export const getProductsCount = () => api.get("/api/product/dashboard/count");
export const getOrdersCount = () => api.get("/api/order/dashboard/count");
export const getUsersCount = () => api.get("/api/user/dashboard/count");

// Coupon endpoints
export const getAllCoupons = () => api.get("/api/coupon");
export const getCouponById = (id: string) => api.get(`/api/coupon/${id}`);
export const createCoupon = (data: {
  code: string;
  discount: number;
  expiry: Date;
  status: boolean;
  maxUses: number;
}) => api.post("/api/coupon", data);
export const updateCoupon = (id: string, data: {
  code?: string;
  discount?: number;
  expiry?: Date;
  status?: boolean;
  maxUses?: number;
}) => api.put(`/api/coupon/${id}`, data);
export const deleteCoupon = (id: string) => api.delete(`/api/coupon/${id}`);

// إضافة معترض للتعامل مع أخطاء الشبكة بشكل أفضل
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(
      "Request sent to:",
      config.url,
      "with baseURL:",
      api.defaults.baseURL
    ); // Enhanced debug log
    return config;
  },
  (error) => {
    console.error("Request error:", error.message, error);
    return Promise.reject(error);
  }
);

// api.interceptors.response.use(
//   (response) => {
//     console.log("Response received from:", response.config.url, "Data:", response.data);
//     return response;
//   },
//   (error) => {
//     if (error.code === "ERR_NETWORK") {
//       console.error(
//         "Network error - server might be down or unreachable",
//         "URL:", error.config.url,
//         "Base URL:", api.defaults.baseURL,
//         "Error Details:", error
//       );
//       // Provide mock data based on the request URL
//       if (error.config.url.includes("/customize")) {
//         return Promise.resolve({
//           data: {
//             success: true,
//             message: "Mock data (server unreachable)",
//             images: [
//               {
//                 _id: "mock-id",
//                 slideImage: ["/placeholder-image.jpg", "/placeholder-image.jpg"],
//                 title: "عنوان تجريبي",
//                 description: "وصف تجريبي للتخصيص",
//                 isActive: true,
//                 firstShow: 0,
//               },
//             ],
//           },
//         });
//       } else if (error.config.url.includes("/wishlist")) {
//         return Promise.resolve({
//           data: {
//             success: true,
//             message: "Mock wishlist data (server unreachable)",
//             data: { wishlist: [] },
//           },
//         });
//       } else if (error.config.url.includes("/cart")) {
//         return Promise.resolve({
//           data: {
//             success: true,
//             message: "Mock cart data (server unreachable)",
//             data: { cart: [] },
//           },
//         });
//       } else if (error.config.url.includes("/product")) {
//         return Promise.resolve({
//           data: {
//             success: true,
//             message: "Mock products data (server unreachable)",
//             products: [],
//           },
//         });
//       } else if (error.config.url.includes("/auth")) {
//         return Promise.resolve({
//           data: {
//             success: true,
//             message: "Mock auth data (server unreachable)",
//             data: {},
//           },
//         });
//       } else if (error.config.url.includes("/user")) {
//         return Promise.resolve({
//           data: {
//             success: true,
//             message: "Mock user data (server unreachable)",
//             data: [],
//           },
//         });
//       } else if (error.config.url.includes("/category")) {
//         return Promise.resolve({
//           data: {
//             success: true,
//             message: "Mock category data (server unreachable)",
//             data: [],
//           },
//         });
//       } else if (error.config.url.includes("/order")) {
//         return Promise.resolve({
//           data: {
//             success: true,
//             message: "Mock order data (server unreachable)",
//             data: [],
//           },
//         });
//       } else if (error.config.url.includes("/review")) {
//         return Promise.resolve({
//           data: {
//             success: true,
//             message: "Mock review data (server unreachable)",
//             data: [],
//           },
//         });
//       }
//       return Promise.resolve({
//         data: {
//           success: true,
//           message: "Mock data (server unreachable)",
//           data: {},
//         },
//       });
//     }
//     if (error.response && error.response.data && error.response.data.message) {
//       console.error("Server response error:", error.response.data.message);
//       return Promise.reject(new Error(error.response.data.message));
//     }
//     console.error("Unknown error:", error.message, error);
//     return Promise.reject(error);
//   }
// );

// إضافة وظائف Stripe
export const createStripeCheckoutSession = async (data) => {
  return await api.post("/api/stripe/create-checkout-session", data);
};

export const verifyStripePayment = async (sessionId) => {
  return await api.get(`/api/stripe/verify-payment?session_id=${sessionId}`);
};