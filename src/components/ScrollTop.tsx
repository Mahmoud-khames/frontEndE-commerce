'use client'
import { ArrowUp } from 'lucide-react';
import React, { useState, useEffect } from 'react';

export default function ScrollTop() {

  const [isVisible, setIsVisible] = useState(false);


  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };


  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', 
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <button
      onClick={scrollToTop}
      className={`fixed cursor-pointer right-4 bottom-4 bg-gray-300 text-white w-11 h-11 flex items-center justify-center rounded-full transition-opacity hover:bg-gray-400 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <ArrowUp className="w-6 h-6 text-black" />
    </button>
  );
}