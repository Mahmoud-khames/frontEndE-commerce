// components/Home/DiscountTimer.tsx
"use client";

import { useEffect, useState } from "react";
import Timer from "@/components/timer";
import { useDiscountedProducts } from "@/hooks/useProducts";

export default function DiscountTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [progress, setProgress] = useState({
    totalDuration: 0,
    elapsedDuration: 0,
    percentComplete: 0,
  });
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  const { data: response } = useDiscountedProducts();

  useEffect(() => {
    if (response?.longestExpiryDate) {
      const apiEndDate = new Date(response.longestExpiryDate);

      if (!endDate || apiEndDate.getTime() !== endDate.getTime()) {
        setEndDate(apiEndDate);
        localStorage.setItem("discountEndDate", apiEndDate.toString());
        calculateTimeLeft(apiEndDate);

        if (response.discountProgress) {
          setProgress(response.discountProgress);

          if (response.discountProgress.totalDuration > 0) {
            const calculatedStartDate = new Date(
              apiEndDate.getTime() - response.discountProgress.totalDuration
            );
            setStartDate(calculatedStartDate);
            localStorage.setItem(
              "discountStartDate",
              calculatedStartDate.toString()
            );
          }
        }
      }
    }
  }, [response, endDate]);

  useEffect(() => {
    const savedEndDate = localStorage.getItem("discountEndDate");
    const savedStartDate = localStorage.getItem("discountStartDate");

    if (savedEndDate && !endDate) {
      const parsedEndDate = new Date(savedEndDate);
      setEndDate(parsedEndDate);
      calculateTimeLeft(parsedEndDate);
    }

    if (savedStartDate && savedEndDate && !startDate) {
      const parsedStartDate = new Date(savedStartDate);
      setStartDate(parsedStartDate);

      const now = new Date();
      const parsedEndDate = new Date(savedEndDate);
      const totalDuration = parsedEndDate.getTime() - parsedStartDate.getTime();
      const elapsedDuration = Math.min(
        now.getTime() - parsedStartDate.getTime(),
        totalDuration
      );
      const percentComplete =
        totalDuration > 0
          ? Math.round((elapsedDuration / totalDuration) * 100)
          : 0;

      setProgress({
        totalDuration,
        elapsedDuration: Math.max(0, elapsedDuration),
        percentComplete,
      });
    }
  }, [endDate, startDate]);

  useEffect(() => {
    if (!endDate) return;

    const timerInterval = setInterval(() => {
      const remaining = calculateTimeLeft(endDate);

      // Check if timer has expired
      const hasExpired =
        remaining.days === 0 &&
        remaining.hours === 0 &&
        remaining.minutes === 0 &&
        remaining.seconds === 0;

      if (hasExpired) {
        setIsExpired(true);
        clearInterval(timerInterval);
        // Clear localStorage
        localStorage.removeItem("discountEndDate");
        localStorage.removeItem("discountStartDate");
      }

      if (startDate && endDate) {
        const now = new Date();
        const totalDuration = endDate.getTime() - startDate.getTime();
        const elapsedDuration = Math.min(
          now.getTime() - startDate.getTime(),
          totalDuration
        );

        setProgress({
          totalDuration,
          elapsedDuration: Math.max(0, elapsedDuration),
          percentComplete:
            totalDuration > 0
              ? Math.round((elapsedDuration / totalDuration) * 100)
              : 0,
        });
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [endDate, startDate]);

  const calculateTimeLeft = (endDate: Date) => {
    const now = new Date();
    const difference = endDate.getTime() - now.getTime();

    if (difference <= 0) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    const result = { days, hours, minutes, seconds };
    setTimeLeft(result);
    return result;
  };

  // Hide timer if expired
  if (isExpired) {
    return null;
  }

  return <Timer initialTime={timeLeft} progress={progress} />;
}