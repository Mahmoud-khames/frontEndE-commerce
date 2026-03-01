"use client";

import React, { ReactNode } from "react";
import QueryProvider from "./QueryProvider";
import { AuthProvider } from "./AuthProvider";
import { IntlProvider } from "./IntlProvider";
import type { Locale } from "@/i18n.config";

import { AbstractIntlMessages } from "next-intl";

interface AppProvidersProps {
  children: ReactNode;
  locale: Locale;
  messages: AbstractIntlMessages;
}

export function AppProviders({
  children,
  locale,
  messages,
}: AppProvidersProps) {
  return (
    <IntlProvider locale={locale} messages={messages}>
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
      </QueryProvider>
    </IntlProvider>
  );
}
