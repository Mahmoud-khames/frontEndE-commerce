'use client';

import FormFields from '@/components/form-fields/form-fields';
import { Button } from '@/components/ui/button';
import { Pages } from '@/constants/enums';
import useFormFields from '../../../../../hooks/useFormFields';

import React, { useState } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Translation {
  auth: {
    forgotPassword: string;
  };
  [key: string]: string | { forgotPassword: string };
}

interface FormProps {
  locale: string;
  t: Translation;
}

export default function Form({ locale, t }: FormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  
  const { getFormFields } = useFormFields({
    slug: Pages.FORGOT_PASSWORD,
    t,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, { email });
      
      if (response.data.success) {
        setSuccess(response.data.message);
        // In a real app, you might want to redirect to a confirmation page
        // For now, we'll just show a success message
      } else {
        setError(response.data.error || 'Failed to send reset link');
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
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Link'}
        </Button>
      </form>
    </div>
  );
}
