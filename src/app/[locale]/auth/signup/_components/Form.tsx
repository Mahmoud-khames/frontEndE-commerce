"use client";

import FormFields from "@/components/form-fields/form-fields";
import { Button } from "@/components/ui/button";
import { Pages } from "@/constants/enums";
import useFormFields from '../../../../../hooks/useFormFields';
import { register } from "@/server";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import React, { useState } from "react";

// Define types for translations
interface Translation {
  auth: {
    createAccount: string;
  };
  [key: string]: string | { createAccount: string };
}

interface FormProps {
  locale: string;
  t: Translation;
}

export default function Form({ locale, t }: FormProps) {  

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const { getFormFields } = useFormFields({
    slug: Pages.REGISTER,
    t,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const cPassword = formData.get("cPassword") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    
    try {
      const response = await register({
        firstName,
        lastName,
        email,
        password,
        cPassword,
        locale
      });
      
      if (response.data.success) {
        setSuccess("Account created successfully! Please verify your email.");
        // Redirect to verification page
        router.push(`/${locale}/auth/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        setError(response.data.message || "Failed to create account");
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to create account");
      console.error("Register error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full">
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-500">{success}</div>}
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
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.auth.createAccount}
        </Button>
      </form>
    </div>
  );
}
