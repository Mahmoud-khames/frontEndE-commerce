"use client";

import { NextIntlClientProvider, AbstractIntlMessages } from "next-intl";
import { ReactNode } from "react";
import { Locale } from "@/i18n.config";

interface IntlProviderProps {
  children: ReactNode;
  locale: Locale;
  messages: AbstractIntlMessages;
}

export function IntlProvider({
  children,
  locale,
  messages,
}: IntlProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
      {children}
    </NextIntlClientProvider>
  );
}
