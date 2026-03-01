/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCategories } from "@/hooks/useCategories";
import { Category } from "@/types";
import { AddCategory } from "./AddCategory";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EditCategory from "./EditCategory";
import DeleteCategory from "./DeleteCategory";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export default function CategoriesTable({
  t,
  locale,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  locale: string;
}) {
  const { data: response, isLoading: loadingResult } = useCategories();
  const categories = response?.data || [];
  const loading = loadingResult;

  // Function to safely get localized value
  // Now supports getting from separate fields if they exist on the item
  const getLocalizedValue = (
    value: any,
    enField?: string,
    arField?: string,
    item?: any
  ) => {
    // If explicit item and fields are provided, try them first based on locale
    if (locale === "en" && enField && item && item[enField])
      return item[enField];
    if (locale === "ar" && arField && item && item[arField])
      return item[arField];

    if (!value) return "-";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      return value[locale] || value.en || value.ar || "-";
    }
    return String(value);
  };

  // Function to truncate long text, also supports localized extraction
  const truncateText = (
    text: any,
    item?: any,
    enField?: string,
    arField?: string,
    maxLength: number = 50
  ) => {
    const str = getLocalizedValue(text, enField, arField, item);
    // If still just "text" without item logic
    return str.length > maxLength ? `${str.substring(0, maxLength)}...` : str;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">{t.admin.manageCategories}</h2>
        <AddCategory t={t} />
      </div>
      <div className="bg-white p-4 rounded shadow overflow-x-auto">
        <Table className="w-full min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead className="text-left p-2">#</TableHead>
              <TableHead className="text-left p-2">
                {t.admin.categoryImage}
              </TableHead>
              <TableHead className="text-left p-2">
                {t.admin.categoryName}
              </TableHead>
              <TableHead className="text-center p-2 ">
                {t.admin.categoryDescription}
              </TableHead>
              <TableHead className="text-left p-2">
                {t.admin.categoryStatus}
              </TableHead>
              <TableHead className="text-left p-2">
                {t.common.actions}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : categories?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  {t.admin.noCategories}
                </TableCell>
              </TableRow>
            ) : (
              categories?.map((category: Category, index: number) => (
                <TableRow key={category._id} className="hover:bg-gray-50">
                  <TableCell className="p-2">{index + 1}</TableCell>
                  <TableCell className="p-2">
                    <div className="w-16 h-16 relative rounded overflow-hidden">
                      {category.image ? (
                        <Image
                          src={`${category.image}`}
                          alt={getLocalizedValue(
                            category?.name,
                            "nameEn",
                            "nameAr",
                            category
                          )}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-500">
                            {t.admin.noImage}
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="p-2 font-medium">
                    {getLocalizedValue(
                      category?.name,
                      "nameEn",
                      "nameAr",
                      category
                    )}
                  </TableCell>
                  <TableCell className="p-2 max-w-[200px]">
                    <div
                      className="truncate"
                      title={getLocalizedValue(
                        category.description,
                        "descriptionEn",
                        "descriptionAr",
                        category
                      )}
                    >
                      {truncateText(
                        category.description,
                        category,
                        "descriptionEn",
                        "descriptionAr",
                        30
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="p-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        category.status
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {category.status ? t.common.active : t.common.inactive}
                    </span>
                  </TableCell>
                  <TableCell className="p-2">
                    <div className="flex gap-3 justify-center ">
                      <EditCategory category={category} t={t} />
                      <DeleteCategory category={category} t={t} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
