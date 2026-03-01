"use client";

import FormFields from "@/components/form-fields/form-fields";
import { Button } from "@/components/ui/button";
import { Pages } from "@/constants/enums";
import useFormFields from "@/hooks/useFormFields"; // Fixed path
import { useForgotPassword } from "@/hooks/useAuth";
import React, { useState } from "react";
import { Loader2 } from "lucide-react";

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

export default function Form({ t }: FormProps) {
  const forgotPasswordMutation = useForgotPassword();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { getFormFields } = useFormFields({
    slug: Pages.FORGOT_PASSWORD,
    t,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    forgotPasswordMutation.mutate(email, {
      onSuccess: (data: any) => {
        // Hook handles toast, but we can set local success too
        setSuccess("Reset link sent to your email.");
      },
      onError: (err: any) => {
        setError(
          err.response?.data?.error ||
            err.message ||
            "Failed to send reset link"
        );
      },
    });
  };

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
          disabled={forgotPasswordMutation.isPending}
          className="w-full bg-secondary cursor-pointer text-white py-3 px-10 rounded-md shadow-md hover:bg-red-700 transition-all duration-300"
        >
          {forgotPasswordMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>
    </div>
  );
}
