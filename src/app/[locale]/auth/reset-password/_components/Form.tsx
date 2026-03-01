"use client";

import FormFields from "@/components/form-fields/form-fields";
import { Button } from "@/components/ui/button";
import { Pages, Routes } from "@/constants/enums";
import useFormFields from "@/hooks/useFormFields"; // Fixed import path from ../../../../../hooks...
import React, { useState, useEffect } from "react"; // React hooks
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useResetPassword } from "@/hooks/useAuth";

interface FormProps {
  locale: string;
  t: any;
}

export default function Form({ locale, t }: FormProps) {
  const resetPasswordMutation = useResetPassword();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [token, setToken] = useState("");

  // remove router if not used directly (hook navigates), but hook might need router.
  // The hook useResetPassword navigates to /login on success.

  const searchParams = useSearchParams();

  // Get token from URL
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const { getFormFields } = useFormFields({
    slug: Pages.RESET_PASSWORD,
    t,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;

    if (!token) {
      setError("Reset token is missing");
      return;
    }

    resetPasswordMutation.mutate(
      { token, password },
      {
        onSuccess: (data: any) => {
          setSuccess("Password reset successful! Redirecting to login...");
          // Hook navigates after toast.
        },
        onError: (err: any) => {
          setError(
            err.response?.data?.error ||
              err.message ||
              "Failed to reset password"
          );
        },
      }
    );
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
            <FormFields {...field} error={undefined} />
          </div>
        ))}

        <Button
          type="submit"
          disabled={resetPasswordMutation.isPending}
          className="w-full bg-secondary cursor-pointer text-white py-3 px-10 rounded-md shadow-md hover:bg-red-700 transition-all duration-300"
        >
          {resetPasswordMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            t.auth.resetPassword || "Reset Password"
          )}
        </Button>
      </form>
    </div>
  );
}
