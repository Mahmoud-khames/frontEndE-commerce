"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { getCustomizeImages } from "@/server"; // Import the API function to fetch images

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

// Styles
import "swiper/css";
import "swiper/css/pagination";

export default function ImgSale() {
  const [images, setImages] = useState<string[]>([]); // State to store fetched images
  const [isLoading, setIsLoading] = useState(true); // State for loading status
  const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"; // Base URL for image paths

  // Fetch images on component mount
  useEffect(() => {
    const fetchImages = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching images for ImgSale from:", `${apiURL}/api/customize`);
        const response = await getCustomizeImages();
        console.log("ImgSale API Response:", response.data);
        if (response.data.success && response.data.images && response.data.images.length > 0) {
          const firstCustomize = response.data.images[0];
          const slideImages = firstCustomize.slideImage || [];
          setImages(slideImages);
        } else {
          console.warn("No images found in response, using fallback images.");
          setImages([]); // Fallback to static images if none are fetched
        }
      } catch (error: any) {
        console.error("Error fetching images for ImgSale:", error);
        setImages([]); // Fallback on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, [apiURL]);

  // Render a loading state while fetching images
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Render Swiper with fetched images
  return (
    <div className="w-full h-full">
      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        spaceBetween={0}
        slidesPerView={1}
        className="w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[344px]"
      >
        {isLoading ? (
          <SwiperSlide>
            <div className="w-full h-full flex items-center justify-center">
              <Skeleton className="w-full h-full rounded-md" />
            </div>
          </SwiperSlide>
        ) : images.length > 0 ? (
          images.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="relative w-full h-full">
                <Image
                  src={`${apiURL}${image}`}
                  alt={`Slide ${index + 1}`}
                  fill
                  className="object-cover object-center"
                  priority={index === 0}
                />
              </div>
            </SwiperSlide>
          ))
        ) : (
          // Fallback static image
          <SwiperSlide>
            <div className="relative w-full h-full">
              <Image
                src="/placeholder-banner.jpg"
                alt="Default banner"
                fill
                className="object-cover object-center"
                priority
              />
            </div>
          </SwiperSlide>
        )}
      </Swiper>
    </div>
  );
}
