'use client';

import FormFields from '@/components/form-fields/form-fields';
import { Button } from '@/components/ui/button';
import { Pages, Routes } from '@/constants/enums';
import useFormFields from '../../../../../hooks/useFormFields';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface FormProps {
  locale: string;
  t: any;
}

export default function Form({ locale, t }: FormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [token, setToken] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();

    
    // Get token from URL
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const { getFormFields } = useFormFields({
    slug: Pages.RESET_PASSWORD,
    t,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;

    if (!token) {
      setError('Reset token is missing');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, { 
        token, 
        password 
      });
      
      if (response.data.success) {
        setSuccess(response.data.message);
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          router.push(`/${locale}/${Routes.LOGIN}`);
        }, 2000);
      } else {
        setError(response.data.error || 'Failed to reset password');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (!t.auth) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full">
      {error && <div className="text-red-500 w-full">{error}</div>}
      {success && <div className="text-green-500 w-full">{success}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-6 w-full">
        {getFormFields().map((field) => (
          <div key={field.name}>
            <FormFields {...field} />
          </div>
        ))}
        
        <Button 
          type="submit"
          disabled={isLoading}
          className="w-full bg-secondary cursor-pointer text-white py-3 px-10 rounded-md shadow-md hover:bg-red-700 transition-all duration-300"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.auth.resetPassword || 'Reset Password'}
        </Button>
      </form>
    </div>
  );
}
