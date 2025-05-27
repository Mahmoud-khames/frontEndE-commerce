"use client";
import { Directions, Languages } from "@/constants/enums";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useParams } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SliderProps {
  children: React.ReactNode;
}

export default function Slider({ children }: SliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const { locale } = useParams();
  const isRTL = locale === Languages.ARABIC;
  const isMobile = useIsMobile();

  const checkScrollPosition = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;

      // For RTL, the scrollLeft is negative and starts from the right
      if (isRTL) {
        const maxScroll = Math.abs(scrollWidth - clientWidth);
        setIsAtStart(Math.abs(scrollLeft) < 10);
        setIsAtEnd(Math.abs(scrollLeft) >= maxScroll - 10);
      } else {
        setIsAtStart(scrollLeft <= 0);
        setIsAtEnd(scrollLeft + clientWidth >= scrollWidth - 10);
      }
    }
  };

  useEffect(() => {
    checkScrollPosition();
    // Reset scroll position when language changes
    if (sliderRef.current) {
      sliderRef.current.scrollLeft = 0;
    }

    // Add resize listener to check scroll position on window resize
    window.addEventListener("resize", checkScrollPosition);
    return () => window.removeEventListener("resize", checkScrollPosition);
  }, [locale]);

  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      // Adjust scroll value based on screen size
      const scrollAmount = isMobile ? 140 : 270;
      // Adjust scroll direction based on language
      const scrollValue =
        scrollAmount * (direction === "right" ? 1 : -1) * (isRTL ? -1 : 1);
      sliderRef.current.scrollBy({ left: scrollValue, behavior: "smooth" });
      setTimeout(checkScrollPosition, 300);
    }
  };

  return (
    <div
      className="relative w-full"
      dir={isRTL ? Directions.RTL : Directions.LTR}
    >
      <div
        ref={sliderRef}
        className="flex w-full gap-4 md:gap-[30px] overflow-hidden scroll-smooth snap-x snap-mandatory scrollbar-hide py-2"
        onScroll={checkScrollPosition}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {children}
      </div>

      {/* Navigation buttons */}
      <button
        onClick={() => scroll("left")}
        disabled={isAtStart}
        className={`absolute z-10 cursor-pointer top-1/2 transform -translate-y-1/2 
          bg-gray-300 text-white w-8 h-8 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-opacity
          ${isRTL ? "right-0" : "left-0"}
          ${
            isAtStart
              ? "opacity-0 pointer-events-none"
              : "opacity-80 hover:opacity-100 hover:bg-gray-400"
          }`}
        aria-label="Previous"
      >
        {isRTL ? (
          <ArrowRight className="w-4 h-4 md:w-6 md:h-6 text-black" />
        ) : (
          <ArrowLeft className="w-4 h-4 md:w-6 md:h-6 text-black" />
        )}
      </button>

      <button
        onClick={() => scroll("right")}
        disabled={isAtEnd}
        className={`absolute z-10 cursor-pointer top-1/2 transform -translate-y-1/2 
          bg-gray-300 text-white w-8 h-8 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-opacity
          ${isRTL ? "left-0" : "right-0"}
          ${
            isAtEnd
              ? "opacity-0 pointer-events-none"
              : "opacity-80 hover:opacity-100 hover:bg-gray-400"
          }`}
        aria-label="Next"
      >
        {isRTL ? (
          <ArrowLeft className="w-4 h-4 md:w-6 md:h-6 text-black" />
        ) : (
          <ArrowRight className="w-4 h-4 md:w-6 md:h-6 text-black" />
        )}
      </button>
    </div>
  );
}
