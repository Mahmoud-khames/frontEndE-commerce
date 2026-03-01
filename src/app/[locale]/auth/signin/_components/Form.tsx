"use client";

import FormFields from "@/components/form-fields/form-fields";
import { Button } from "@/components/ui/button";
import { Pages } from "@/constants/enums";
import useFormFields from "@/hooks/useFormFields";
import { useLogin } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import React from "react";

interface Translation {
  auth: {
    login: string;
  };
}

interface FormProps {
  locale: string;
  t: Translation;
}

export default function Form({ t }: FormProps) {
  const loginMutation = useLogin();
  const { getFormFields } = useFormFields({ slug: Pages.LOGIN, t });
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email.includes("@")) {
      setError("Invalid email format");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    loginMutation.mutate(
      { email, password },
      {
        onError: (err: any) => {
          setError(
            err.response?.data?.message || err.message || "Login failed"
          );
        },
      }
    );
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full">
      {error && (
        <div role="alert" className="text-red-500">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6 w-full">
        {getFormFields().map((field) => (
          <div key={field.name}>
            <FormFields {...field} error={undefined} />
          </div>
        ))}
        <Button
          type="submit"
          disabled={loginMutation.isPending}
          variant="secondary"
          className="w-full"
          aria-label={t.auth.login}
        >
          {loginMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : (
            t.auth.login
          )}
        </Button>
      </form>
    </div>
  );
}
