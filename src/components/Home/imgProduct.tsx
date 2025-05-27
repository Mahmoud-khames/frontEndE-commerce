"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ImgProduct() {
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  const targetDate = new Date();
  targetDate.setHours(targetDate.getHours() + 23);
  targetDate.setDate(targetDate.getDate() + 5);
  targetDate.setMinutes(targetDate.getMinutes() + 59);
  targetDate.setSeconds(targetDate.getSeconds() + 35);

  // حالة التايمر
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // دالة لحساب الوقت المتبقي
  const calculateTimeLeft = () => {
    const now = new Date();
    const difference = targetDate - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  // تحديث التايمر كل ثانية
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // تنظيف الـ Interval عند إلغاء المكون
    return () => clearInterval(timer);
  }, []);

  // محاكاة تحميل الصورة
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-center my-10 md:my-20 bg-black h-auto md:h-[500px] gap-5 md:gap-10 p-4 md:p-8">
      {/* content */}
      <div className="w-full md:w-[400px] h-full flex items-start flex-col gap-2 justify-center py-6 md:py-0">
        <h4 className="text-popover text-[14px] md:text-[16px] font-medium">Categories</h4>
        <p className="text-[24px] md:text-[28px] lg:text-[48px] font-semibold leading-tight md:leading-[60px] text-white">
          Enhance Your Music Experience
        </p>

        {/* Timer */}
        <div className="flex gap-6 mt-4">
          <div className="flex flex-col items-center">
            <div className="bg-white text-black rounded-full md:w-16 md:h-16 w-14 h-14 flex flex-col items-center justify-center text-[12px] md:text-[18px] ">
              <span className="text-black font-bold">
                {timeLeft.hours.toString().padStart(2, "0")}
              </span>
              <span className="text-black text-[12px] ">Hours</span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-white text-black rounded-full md:w-16 md:h-16 w-14 h-14 flex flex-col items-center justify-center text-[12px] md:text-[18px] ">
              <span className="text-black font-bold">
                {timeLeft.days.toString().padStart(2, "0")}
              </span>
              <span className="text-black text-[12px] ">Days</span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-white text-black rounded-full md:w-16 md:h-16 w-14 h-14 flex flex-col items-center justify-center text-[12px] md:text-[18px] ">
              <span className="text-black font-bold">
                {timeLeft.minutes.toString().padStart(2, "0")}
              </span>
              <span className="text-black text-[12px] ">Minutes</span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-white text-black rounded-full md:w-16 md:h-16 w-14 h-14 flex flex-col items-center justify-center text-[12px] md:text-[18px] ">
              <span className="text-black font-bold">
                    {timeLeft.seconds.toString().padStart(2, "0")}
              </span>
              <span className="text-black text-[12px] ">Seconds</span>
            </div>
          </div>
        </div>

        {/* Buy Now Button */}
        <button className="mt-4 md:mt-6 bg-popover text-black font-semibold py-3 md:py-4 px-8 md:px-12 rounded cursor-pointer text-sm md:text-base">
          Buy Now!
        </button>
      </div>

      {/* img */}
      <div className="h-full flex items-center justify-center w-full md:w-auto">
        {isLoading && !imageLoaded ? (
          <Skeleton className="w-full md:w-[600px] h-[300px] md:h-[420px] rounded-md" />
        ) : (
          <Image
            src={"/image.png"}
            alt="imgProduct"
            width={600}
            height={420}
            className="drop-shadow-[0px_0px_100px_#FFFF] w-full md:w-auto h-auto max-h-[300px] md:max-h-[420px] object-contain"
            onLoad={() => setImageLoaded(true)}
          />
        )}
      </div>
    </div>
  );
}
