"use client";

import { useParams } from "next/navigation";
import EnhancedSearchBar from "@/components/search/EnhancedSearchBar";

// Updated prop interface to optionally accept search string (old behavior) or use messages
export default function SearchInput({
  search,
  messages,
}: {
  search?: string;
  messages?: any;
}) {
  const { locale } = useParams();

  // If messages is passed, use it as 't' for EnhancedSearchBar
  // Fallback to minimal placeholder if only 'search' string is provided
  const t = messages || { search: { placeholder: search } };

  return (
    <div className="w-full">
      <EnhancedSearchBar
        t={t}
        locale={locale as string}
        variant="minimal"
        className="w-full"
      />
    </div>
  );
}
