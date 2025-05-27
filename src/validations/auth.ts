/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";


export const createSignUpSchema = (t: any) =>
  z
    .object({
      firstName: z.string().min(1, { message: t.validations.firstName }),
      lastName: z.string().min(1, { message: t.validations.lastName }),
      email: z.string().email({ message: t.validations.email }),
      password: z.string().min(8, { message: t.validations.password }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t.validations.passwordMismatch,
      path: ["confirmPassword"],
    });

export type SignUpSchema = z.infer<ReturnType<typeof createSignUpSchema>>;

export const signInSchema = async (t: any) => {

  return z.object({
    email: z.string().email({ message: t.validations.email }),
    password: z.string().min(8, { message: t.validations.password }),
  });
};

export const forgotPasswordSchema = async (t: any) => {
  return z.object({
    email: z.string().email({ message: t.validations.email }),
  });
};

export const resetPasswordSchema = async (t: any) => {
  return z.object({
    password: z.string().min(8, { message: t.validations.password }),
  });
};

export const verifyEmailSchema = async (t: any) => {
  return z.object({
    email: z.string().email({ message: t.validations.email }),
  });
};

export type ValidationErrors = {
  [key: string]: string[] | undefined;
} | undefined;
