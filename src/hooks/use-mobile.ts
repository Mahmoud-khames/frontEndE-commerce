// إنشاء ملف جديد للهوك المفقود
'use client';

import { useState, useEffect } from 'react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // التحقق عند التحميل
    checkIfMobile();
    
    // التحقق عند تغيير حجم النافذة
    window.addEventListener('resize', checkIfMobile);
    
    // تنظيف المستمع عند إلغاء تحميل المكون
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return isMobile;
}

export default useIsMobile;

