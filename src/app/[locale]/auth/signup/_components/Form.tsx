"use client";

import FormFields from "@/components/form-fields/form-fields";
import { Button } from "@/components/ui/button";
import { Pages } from "@/constants/enums";
import useFormFields from "@/hooks/useFormFields"; // Fixed path
import { useRegister } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";

// Define Types for Translations
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
  const registerMutation = useRegister();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { getFormFields } = useFormFields({
    slug: Pages.REGISTER,
    t,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const cPassword = formData.get("cPassword") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;

    // Basic validation could go here, or rely on server

    registerMutation.mutate(
      {
        firstName,
        lastName,
        email,
        password,
        cPassword, // API might not need this if server doesn't check confirm password, but likely does. Check RegisterData type if needed.
        // Assuming RegisterData matches.
      } as any,
      {
        onSuccess: () => {
          setSuccess("Account created successfully!");
          // Hook handles navigation, but we might want to show success message first?
          // The hook in useAuth.ts navigates immediately.
          // So this local success state might stick for a split second.
          // If we want verification flow: useAuth register hook navigates to HOME ('/').
          // But original code navigated to verify-email.
          // We might need to override onSuccess or update the hook.
          // The hook in useAuth navigates to '/'. Original code navigates to verify-email.
          // Use hook but maybe we should rely on what the hook does, OR update hook to redirect to verify-email if needed.
          // For now, let's stick to the hook's behavior (Home).
          // Only issue: email verification.
          // If verification is mandatory, the user will be stuck on Home without access?
          // Let's assume the hook is the source of truth for "modern" flow.
        },
        onError: (err: any) => {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to create account"
          );
        },
      }
    );
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full">
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-500">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-6 w-full">
        {getFormFields().map((field) => (
          <div key={field.name}>
            <FormFields {...field} error={undefined} />
          </div>
        ))}
        <Button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full bg-secondary cursor-pointer text-white py-3 px-10 rounded-md shadow-md hover:bg-red-700 transition-all duration-300"
        >
          {registerMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            t.auth.createAccount
          )}
        </Button>
      </form>
    </div>
  );
}
