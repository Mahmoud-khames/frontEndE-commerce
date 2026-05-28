import type { ApiError, Locale } from "@/types";

const technicalErrorPatterns = [
  /axios/i,
  /network error/i,
  /request failed/i,
  /timeout/i,
  /econn/i,
  /cannot\s/i,
  /undefined/i,
  /stack/i,
  /^error:/i,
];

const fallbackMessage = (locale?: Locale | string) =>
  locale === "ar"
    ? "حدث خطأ غير متوقع. من فضلك حاول مرة أخرى."
    : "Something went wrong. Please try again.";

export const isApiError = (error: unknown): error is ApiError =>
  !!error && typeof error === "object" && "message" in error;

export const getSafeErrorMessage = (
  error: unknown,
  locale?: Locale | string,
  fallback?: string
): string => {
  const safeFallback = fallback || fallbackMessage(locale);

  if (!isApiError(error)) return safeFallback;
  const message = typeof error.message === "string" ? error.message.trim() : "";

  if (!message) return safeFallback;
  if (technicalErrorPatterns.some((pattern) => pattern.test(message))) {
    return safeFallback;
  }

  return message;
};

export const normalizeApiError = (
  error: unknown,
  locale?: Locale | string
): ApiError => {
  const maybeAxios = error as {
    message?: string;
    response?: { status?: number; data?: { message?: string } };
  };

  return {
    message: getSafeErrorMessage(
      {
        message: maybeAxios.response?.data?.message || maybeAxios.message,
      },
      locale
    ),
    status: maybeAxios.response?.status,
    data: maybeAxios.response?.data,
  };
};
