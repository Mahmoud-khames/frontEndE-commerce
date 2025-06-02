"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
  createReview,
  getProductReviews,
  deleteReview,
  uploadReviewImage,
  getProduct,
} from "@/server";
import { useAppSelector } from "@/redux/hooks";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Star, Upload, Trash2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import { IProduct } from "@/types/type";
import Link from "@/components/link";
import { Routes } from "@/constants/enums";

export default function ProductReviewItem({ slug }: { slug: string }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { locale } = useParams();
  const isRTL = locale === "ar";
  const apiURL = process.env.NEXT_PUBLIC_API_URL;
  const user = useAppSelector((state) => state.user.user);
  const isAdmin = user?.role === "admin";
  const [product, setProduct] = useState<IProduct | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fetchProduct = React.useCallback(() => {
    return getProduct(slug);
  }, [slug]);

  useEffect(() => {
    setIsLoading(true);
    fetchProduct().then((data) => {
      setProduct(data.data.data);
    });
    setIsLoading(false);
  }, [fetchProduct]);
  useEffect(() => {
    if (product?._id) {
      fetchReviews();
    }
  }, [product]);

  const fetchReviews = async () => {
    if (!product?._id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getProductReviews(product._id);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      // Set empty reviews array on error instead of showing error toast
      setReviews([]);
      // Only show toast for network errors, not for empty reviews
      if (error.message !== "Network Error" && error.response?.status !== 404) {
        toast.error("Failed to load reviews");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to submit a review");
      return;
    }

    try {
      setSubmitting(true);
      const response = await createReview({
        productId:product._id,
        rating,
        comment,
      });

      if (response.data.success) {
        const newReview = response.data.review;

        // If an image was selected, upload it
        if (selectedImage) {
          await handleUploadImage(newReview._id);
        }

        toast.success("Review submitted successfully");
        // Refresh reviews to include the new one with image
        fetchReviews();

        // Reset form
        setRating(5);
        setComment("");
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadImage = async (reviewId: string) => {
    if (!selectedImage) return;

    const formData = new FormData();
    formData.append("reviewId", reviewId);
    formData.append("image", selectedImage);

    try {
      const response = await uploadReviewImage(formData);
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to upload image");
      }
      return response.data;
    } catch (error) {
      console.error("Error uploading image:", error);
      // More detailed error logging
      if (error.response) {
        console.error("Server response:", error.response.data);
        console.error("Status code:", error.response.status);
      }
      toast.error("Failed to upload image. Please try again later.");
      // Continue with the review submission even if image upload fails
      return null;
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const response = await deleteReview(reviewId);
      if (response.data.success) {
        toast.success("Review deleted successfully");
        // Remove the deleted review from the list
        setReviews(reviews.filter((review) => review._id !== reviewId));
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    }
  };

  const canDeleteReview = (review) => {
    return isAdmin || (user && review.user._id === user._id);
  };
if(isLoading){
  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  );
}
  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <h2 className="text-2xl font-bold mb-6">Product Reviews</h2>

      {/* Review Form - Only show for logged in users */}
      {user ? (
        <div className="bg-gray-50 p-4 sm:p-6 rounded-lg mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Write a Review</h3>
          <form onSubmit={handleSubmitReview} className="space-y-3 sm:space-y-4">
            {/* Rating Stars */}
            <div>
              <label className="block text-sm font-medium mb-1 sm:mb-2">Rating</label>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="text-xl sm:text-2xl focus:outline-none"
                  >
                    <Star
                      className={`h-5 w-5 sm:h-6 sm:w-6 ${
                        (hoveredRating || rating) >= star
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment Textarea */}
            <div>
              <label className="block text-sm font-medium mb-1 sm:mb-2">Your Review</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your review here..."
                className="min-h-[100px] text-sm sm:text-base"
                required
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-1 sm:mb-2">
                Add Image (Optional)
              </label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload</span>
                </Button>
                <Input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />

                {imagePreview && (
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded overflow-hidden">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="bg-secondary hover:bg-secondary/90 text-white"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        </div>
      ) : (
        <div className="bg-gray-50 p-6 rounded-lg mb-8 text-center">
          <h3 className="text-xl font-semibold mb-4">Want to share your thoughts?</h3>
          <p className="mb-4">Please login to write a review for this product.</p>
          <Link href={`/${locale}/${Routes.LOGIN}`} className="bg-secondary text-white px-6 py-2 rounded hover:bg-secondary/90">
            Login to Review
          </Link>
        </div>
      )}

      {/* Reviews List */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className="border-b pb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="font-medium">
                      {review.user?.firstName}{" "}
                      {review.user?.lastName || "Anonymous"}
                    </div>
                    <div className="text-gray-500 text-sm ml-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex mr-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>

                    {canDeleteReview(review) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteReview(review._id)}
                        className="text-red-500 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-gray-700">{review.comment}</p>

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {review.images.map((image, imgIndex) => (
                      <div
                        key={imgIndex}
                        className="relative w-20 h-20 rounded overflow-hidden"
                      >
                        <Image
                          src={`${image}`}
                          alt={`Review image ${imgIndex + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 py-4">
            No reviews yet. Be the first to review this product!
          </p>
        )}
      </div>
    </div>
  );
}
