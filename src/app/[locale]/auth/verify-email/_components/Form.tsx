'use client';

import { Button } from '@/components/ui/button';
import { Routes } from '@/constants/enums';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from '@/components/link';

interface FormProps {
  locale: string;
  t: any;
}

export default function Form({ locale, t }: FormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Get email from URL if available
    const emailFromUrl = searchParams.get('email');
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!email || !verificationCode) {
      setError(t.auth.fillAllFields || 'Please fill all fields');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-email`, { 
        email,
        code: verificationCode
      });
      
      if (response.data.success) {
        setSuccess(response.data.message);
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          router.push(`/${locale}/${Routes.LOGIN}`);
        }, 2000);
      } else {
        setError(response.data.error || 'Failed to verify email');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full">
      {error && <div className="text-red-500 w-full">{error}</div>}
      {success && <div className="text-green-500 w-full">{success}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-6 w-full">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            {t.auth.email || 'Email'}
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            placeholder={t.auth.enterEmail || 'Enter your email'}
            required
          />
        </div>
        
        <div>
          <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
            {t.auth.verificationCode || 'Verification Code'}
          </label>
          <input
            type="text"
            id="verificationCode"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            placeholder={t.auth.enterVerificationCode || 'Enter verification code'}
            required
          />
        </div>
        
        <Button 
          type="submit"
          disabled={isLoading}
          className="w-full bg-secondary cursor-pointer text-white py-3 px-10 rounded-md shadow-md hover:bg-red-700 transition-all duration-300"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.auth.verifyEmail || 'Verify Email'}
        </Button>
      </form>
      
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          {t.auth.didntReceiveCode || "Didn't receive the code?"}{' '}
          <Link href={`/${locale}/${Routes.RESEND_VERIFICATION}`} className="text-secondary hover:underline">
            {t.auth.resendCode || 'Resend Code'}
          </Link>
        </p>
      </div>
    </div>
  );
}