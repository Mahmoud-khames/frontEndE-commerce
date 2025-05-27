"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Timer from "@/components/timer";
import { useParams } from "next/navigation";

export default function DiscountTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [progress, setProgress] = useState({
    totalDuration: 0,
    elapsedDuration: 0,
    percentComplete: 0
  });
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const { locale } = useParams();
  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  // Load saved end date from localStorage on initial render
  useEffect(() => {
    const savedEndDate = localStorage.getItem('discountEndDate');
    const savedStartDate = localStorage.getItem('discountStartDate');
    
    if (savedEndDate) {
      const parsedEndDate = new Date(savedEndDate);
      setEndDate(parsedEndDate);
      calculateTimeLeft(parsedEndDate);
    }
    
    if (savedStartDate && savedEndDate) {
      const parsedStartDate = new Date(savedStartDate);
      setStartDate(parsedStartDate);
      
      // Calculate progress
      const now = new Date();
      const parsedEndDate = new Date(savedEndDate);
      const totalDuration = parsedEndDate.getTime() - parsedStartDate.getTime();
      const elapsedDuration = Math.min(now.getTime() - parsedStartDate.getTime(), totalDuration);
      const percentComplete = totalDuration > 0 ? Math.round((elapsedDuration / totalDuration) * 100) : 0;
      
      setProgress({
        totalDuration,
        elapsedDuration: Math.max(0, elapsedDuration),
        percentComplete
      });
    }
  }, []);

  // Fetch discount data from API
  useEffect(() => {
    const fetchDiscountedProducts = async () => {
      try {
        const response = await axios.get(`${apiURL}/api/product/discounted`);
        
        if (response.data.success && response.data.longestExpiryDate) {
          const apiEndDate = new Date(response.data.longestExpiryDate);
          console.log("apiEndDate" , apiEndDate)
          // Only update if we don't have an end date or if the API end date is different
          if (!endDate || apiEndDate.getTime() !== endDate.getTime()) {
            setEndDate(apiEndDate);
            localStorage.setItem('discountEndDate', apiEndDate.toString());
            calculateTimeLeft(apiEndDate);
            
            // Set progress information if available
            if (response.data.discountProgress) {
              setProgress(response.data.discountProgress);
              
              // Calculate and save start date based on end date and total duration
              if (response.data.discountProgress.totalDuration > 0) {
                const calculatedStartDate = new Date(
                  apiEndDate.getTime() - response.data.discountProgress.totalDuration
                );
                setStartDate(calculatedStartDate);
                localStorage.setItem('discountStartDate', calculatedStartDate.toString());
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching discounted products:", error);
      }
    };

    fetchDiscountedProducts();
  }, [apiURL, endDate]);

  // Update timer and progress at regular intervals
  useEffect(() => {
    if (!endDate) return;
    
    const timerInterval = setInterval(() => {
      calculateTimeLeft(endDate);
      
      // Update progress if we have start and end dates
      if (startDate && endDate) {
        const now = new Date();
        const totalDuration = endDate.getTime() - startDate.getTime();
        const elapsedDuration = Math.min(now.getTime() - startDate.getTime(), totalDuration);
        
        setProgress({
          totalDuration,
          elapsedDuration: Math.max(0, elapsedDuration),
          percentComplete: totalDuration > 0 ? Math.round((elapsedDuration / totalDuration) * 100) : 0
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
      return;
    }
    
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    
    setTimeLeft({ days, hours, minutes, seconds });
  };

  // Pass both the time left and progress information to the Timer component
  return <Timer initialTime={timeLeft} progress={progress} />;
}





