"use client";

import FormFields from "@/components/form-fields/form-fields";
import { Button } from "@/components/ui/button";
import { Pages, Routes } from "@/constants/enums";
import useFormFields from "@/hooks/useFormFields";
import { setUser, setIsLoading } from "@/redux/features/user/userSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { login } from "@/server";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";


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

interface LoginResponse {
  data: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    token: string;
  };
}

export default function Form({ locale, t }: FormProps) {
  const { isLoading } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
const router = useRouter()
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const { getFormFields } = useFormFields({ slug: Pages.LOGIN, t });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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

    dispatch(setIsLoading(true));
    try {
      const response: LoginResponse = await login({ email, password });
      console.log(response.data);
      dispatch(setUser(response.data));
      setSuccess("Login successful");

      // navigate to home page
      router.push(`/${locale}/${Routes.ROOT}`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      setError(errorMessage);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full">
      {error && (
        <div role="alert" className="text-red-500">
          {error}
        </div>
      )}
      {success && (
        <div role="alert" className="text-green-500">
          {success}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6 w-full">
        {getFormFields().map((field) => (
          <div key={field.name}>
            <FormFields {...field} />
          </div>
        ))}
        <Button
          type="submit"
          disabled={isLoading}
          variant="secondary"
          className="w-full"
          aria-label={t.auth.login}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : (
            t.auth.login
          )}
        </Button>
      </form>
    </div>
  );
}
