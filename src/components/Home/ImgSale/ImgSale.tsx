// components/Home/ImgSale/ImgSale.tsx
"use client";

import Image from "next/image";
import Link from "@/components/link";
import React from "react";
import { useActiveSlides } from "@/hooks/useCustomize";
import { useLocale } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation, EffectFade } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

export default function ImgSale({
  t,
  locale: propLocale,
}: {
  t?: any;
  locale?: string;
}) {
  const contextLocale = useLocale();
  const locale = propLocale || contextLocale;
  const isArabic = locale === "ar";
  const { data: slides, isLoading, error } = useActiveSlides("hero");
  console.log(slides);
  // Loading State with Skeleton
  if (isLoading) {
    return (
      <div className="w-full h-full relative overflow-hidden rounded-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer" />
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center rounded-lg">
        <div className="text-center text-gray-400 p-6">
          <svg
            className="w-16 h-16 mx-auto mb-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p>
            {t?.home?.loadSlidesError ||
              (isArabic ? "حدث خطأ في تحميل الصور" : "Error loading slides")}
          </p>
        </div>
      </div>
    );
  }

  // Empty State
  if (!slides || slides.length === 0) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 flex items-center justify-center rounded-lg">
        <div className="text-center text-gray-400 p-6">
          <svg
            className="w-20 h-20 mx-auto mb-4 opacity-40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-lg font-medium">
            {t?.home?.noSlides ||
              (isArabic ? "لا توجد سلايدات متاحة" : "No slides available")}
          </p>
        </div>
      </div>
    );
  }

  const customizeData = slides[0];

  if (!customizeData.slideImages || customizeData.slideImages.length === 0) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg">
        <p className="text-gray-400">
          {t?.home?.noImages ||
            (isArabic ? "لا توجد صور متاحة" : "No images available")}
        </p>
      </div>
    );
  }

  const {
    titleEn,
    titleAr,
    title: localizedTitle,
    descriptionEn,
    descriptionAr,
    description: localizedDescription,
    buttonTextEn,
    buttonTextAr,
    buttonText: localizedButtonText,
    buttonLink,
    slideImages,
    settings,
  } = customizeData;

  const title = localizedTitle || (isArabic ? titleAr : titleEn);
  const description =
    localizedDescription || (isArabic ? descriptionAr : descriptionEn);
  const buttonText =
    localizedButtonText || (isArabic ? buttonTextAr : buttonTextEn);

  const sliderSettings = {
    autoPlay: settings?.autoPlay ?? true,
    autoPlaySpeed: settings?.autoPlaySpeed ?? 3000,
    showArrows: settings?.showArrows ?? true,
    showDots: settings?.showDots ?? true,
    loop: settings?.loop ?? true,
  };

  return (
    <>
      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-fade-in-left {
          animation: fadeInLeft 0.8s ease-out forwards;
        }

        .animate-fade-in-right {
          animation: fadeInRight 0.8s ease-out forwards;
        }

        .animate-scale-in {
          animation: scaleIn 0.6s ease-out forwards;
        }

        .hero-swiper .swiper-button-next,
        .hero-swiper .swiper-button-prev {
          color: white !important;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          padding: 28px;
          border-radius: 50%;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .hero-swiper .swiper-button-next:hover,
        .hero-swiper .swiper-button-prev:hover {
          background: rgba(0, 0, 0, 0.6);
          transform: scale(1.1);
          border-color: rgba(255, 255, 255, 0.4);
        }

        .hero-swiper .swiper-button-next::after,
        .hero-swiper .swiper-button-prev::after {
          font-size: 20px !important;
          font-weight: bold;
        }

        .hero-swiper .swiper-pagination-bullet {
          background: white !important;
          opacity: 0.6;
          width: 12px;
          height: 12px;
          transition: all 0.3s ease;
        }

        .hero-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          width: 32px;
          border-radius: 6px;
          background: linear-gradient(90deg, #ff6b6b, #ee5a6f) !important;
        }

        @media (max-width: 768px) {
          .hero-swiper .swiper-button-next,
          .hero-swiper .swiper-button-prev {
            display: none !important;
          }
        }
      `}</style>

      <div className="w-full h-full relative overflow-hidden rounded-lg shadow-2xl">
        <Swiper
          modules={[Pagination, Autoplay, Navigation, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          pagination={
            sliderSettings.showDots
              ? {
                  clickable: true,
                  dynamicBullets: true,
                }
              : false
          }
          navigation={sliderSettings.showArrows}
          autoplay={
            sliderSettings.autoPlay
              ? {
                  delay: sliderSettings.autoPlaySpeed,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
              : false
          }
          loop={
            sliderSettings.loop &&
            slides.reduce((acc, s) => acc + (s.slideImages?.length || 0), 0) > 1
          }
          speed={1000}
          className="hero-swiper w-full h-[280px] sm:h-[350px] md:h-[400px] lg:h-[450px]"
        >
          {slides.map((slide) =>
            slide.slideImages.map((image, index) => {
              const title =
                slide.title || (isArabic ? slide.titleAr : slide.titleEn);
              const description =
                slide.description ||
                (isArabic ? slide.descriptionAr : slide.descriptionEn);
              const buttonText =
                slide.buttonText ||
                (isArabic ? slide.buttonTextAr : slide.buttonTextEn);
              const rawButtonLink = slide.buttonLink;

              // Ensure link includes locale prefix if it doesn't already
              const buttonLink = rawButtonLink
                ? rawButtonLink.startsWith(`/${locale}`)
                  ? rawButtonLink
                  : `/${locale}${
                      rawButtonLink.startsWith("/") ? "" : "/"
                    }${rawButtonLink}`
                : "";

              return (
                <SwiperSlide key={`${slide._id}-${index}`}>
                  <div className="relative w-full h-full group">
                    {/* Image with Ken Burns Effect */}
                    <div className="absolute inset-0 overflow-hidden">
                      <Image
                        src={image.url}
                        alt={
                          image.alt ||
                          (isArabic ? "صورة العرض" : "Banner Image")
                        }
                        fill
                        className="object-cover transition-transform duration-[8000ms] ease-out group-hover:scale-110"
                        priority={index === 0}
                        sizes="100vw"
                        quality={95}
                      />
                    </div>

                    {/* Gradient Overlays */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${
                        isArabic
                          ? "from-transparent via-transparent to-black/60"
                          : "from-black/60 via-transparent to-transparent"
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    {/* Content */}
                    {(title || description || buttonText) && (
                      <div
                        className={`absolute inset-0 flex flex-col justify-center px-6 sm:px-10 md:px-16 lg:px-24 ${
                          isArabic
                            ? "items-end text-right"
                            : "items-start text-left"
                        }`}
                      >
                        <div className="max-w-2xl space-y-4 sm:space-y-6">
                          {/* Title */}
                          {title && (
                            <h1
                              className={`text-white font-extrabold drop-shadow-2xl leading-tight
                          text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl
                          ${
                            isArabic
                              ? "animate-fade-in-right"
                              : "animate-fade-in-left"
                          }
                        `}
                              style={{ animationDelay: "0.2s", opacity: 0 }}
                            >
                              {title}
                            </h1>
                          )}

                          {/* Description */}
                          {description && (
                            <p
                              className={`text-white/95 drop-shadow-lg font-medium line-clamp-3
                          text-sm sm:text-base md:text-lg lg:text-xl
                          ${
                            isArabic
                              ? "animate-fade-in-right"
                              : "animate-fade-in-left"
                          }
                        `}
                              style={{ animationDelay: "0.4s", opacity: 0 }}
                            >
                              {description}
                            </p>
                          )}

                          {/* Button */}
                          {buttonText && buttonLink && (
                            <div
                              className="animate-scale-in"
                              style={{ animationDelay: "0.6s", opacity: 0 }}
                            >
                              <Link
                                href={buttonLink}
                                className="inline-flex items-center gap-3 bg-gradient-to-r from-secondary to-red-600 hover:from-red-600 hover:to-secondary text-white font-semibold rounded-lg shadow-2xl hover:shadow-red-500/50 transition-all duration-300 hover:scale-105 active:scale-95 group/btn
                            px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4
                            text-sm sm:text-base md:text-lg
                          "
                              >
                                {buttonText}
                                <svg
                                  className={`w-5 h-5 transition-transform group-hover/btn:translate-x-1 ${
                                    isArabic ? "rotate-180" : ""
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                                  />
                                </svg>
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </SwiperSlide>
              );
            })
          )}
        </Swiper>
      </div>
    </>
  );
}
