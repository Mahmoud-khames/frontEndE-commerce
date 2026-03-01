/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useProducts } from "@/hooks/useProducts";
import { AddProduct } from "./AddProduct";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EditProduct from "./EditProduct";
import DeleteProduct from "./deleteProduct";
import { Loader2 } from "lucide-react";

export default function ProductsTable({
  t,
  locale,
}: {
  t: any;
  locale: string;
}) {
  const { data: response, isLoading: loadingResult } = useProducts();
  const products = response?.data || [];
  const loading = loadingResult;

  const getLocalizedValue = (
    value: any,
    enField?: string,
    arField?: string,
    item?: any
  ) => {
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

  const getLocalizedArray = (item: any, fieldBaseName: string) => {
    // Try explicit localized arrays first (productColorsEn/Ar)
    if (
      locale === "en" &&
      item[`${fieldBaseName}En`] &&
      Array.isArray(item[`${fieldBaseName}En`])
    ) {
      return item[`${fieldBaseName}En`];
    }
    if (
      locale === "ar" &&
      item[`${fieldBaseName}Ar`] &&
      Array.isArray(item[`${fieldBaseName}Ar`])
    ) {
      return item[`${fieldBaseName}Ar`];
    }

    // Try virtual field which might be an object {en: [], ar: []} or just the array itself
    const virtualField = item[fieldBaseName];
    if (!virtualField) return [];

    if (Array.isArray(virtualField)) return virtualField;

    if (typeof virtualField === "object") {
      if (Array.isArray(virtualField[locale])) return virtualField[locale];
      if (Array.isArray(virtualField.en)) return virtualField.en; // Fallback
      if (Array.isArray(virtualField.ar)) return virtualField.ar;
    }

    return [];
  };

  const truncateText = (
    text: any,
    item?: any,
    enField?: string,
    arField?: string,
    maxLength: number = 50
  ) => {
    const str = getLocalizedValue(text, enField, arField, item);
    return str.length > maxLength ? `${str.substring(0, maxLength)}...` : str;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">{t.admin.ManageProducts}</h2>
        <AddProduct t={t} locale={locale} />
      </div>
      <div className="bg-white p-4 rounded shadow overflow-x-auto">
        <Table className="w-full min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead className="text-left p-2">#</TableHead>
              <TableHead className="text-left p-2">
                {t.admin.productName}
              </TableHead>
              <TableHead className="text-left p-2">
                {t.admin.productDescription}
              </TableHead>
              <TableHead className="text-left p-2">
                {t.admin.productPrice}
              </TableHead>
              <TableHead className="text-left p-2">
                {t.admin.oldProductPrice}
              </TableHead>
              <TableHead className="text-left p-2">
                {t.admin.productColors}
              </TableHead>
              <TableHead className="text-left p-2">
                {t.admin.productSizes}
              </TableHead>
              <TableHead className="text-left p-2">
                {t.admin.productCategory}
              </TableHead>
              <TableHead className="text-left p-2">
                {t.admin.productCode || "Product Code"}
              </TableHead>
              <TableHead className="text-left p-2">
                {t.admin.productStatus}
              </TableHead>
              <TableHead className="text-left p-2">
                {t.common.actions}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} className="p-4 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-secondary" />
                    <span className="text-gray-600">{t.common.loading}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="p-2 text-center">
                  {t.admin.noData}
                </TableCell>
              </TableRow>
            ) : (
              products.map((product: any, index: number) => {
                // Price Logic
                const hasDiscount = product.hasActiveDiscount;
                const currentPrice = hasDiscount
                  ? product.productDiscountPrice
                  : product.productPrice;

                // Old Price Logic
                // If discount active, old price is original price.
                // If no active discount but oldProductPrice set (legacy fixed), use that.
                let oldPrice: string | number = "-";
                if (hasDiscount) {
                  oldPrice = product.productPrice;
                } else if (product.oldProductPrice > 0) {
                  oldPrice = product.oldProductPrice;
                }

                const displayColors = getLocalizedArray(
                  product,
                  "productColors"
                );
                const displaySizes = getLocalizedArray(product, "productSizes");

                return (
                  <TableRow key={product._id} className="hover:bg-gray-50">
                    <TableCell className="p-2">{index + 1}</TableCell>
                    <TableCell className="p-2 font-medium">
                      {getLocalizedValue(
                        product.productName,
                        "productNameEn",
                        "productNameAr",
                        product
                      )}
                    </TableCell>
                    <TableCell className="p-2 max-w-[200px]">
                      <div
                        className="truncate"
                        title={getLocalizedValue(
                          product.productDescription,
                          "productDescriptionEn",
                          "productDescriptionAr",
                          product
                        )}
                      >
                        {truncateText(
                          product.productDescription,
                          product,
                          "productDescriptionEn",
                          "productDescriptionAr",
                          30
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="p-2 font-medium">
                      {typeof currentPrice === "number"
                        ? currentPrice.toFixed(2)
                        : currentPrice}
                    </TableCell>
                    <TableCell className="p-2 text-gray-500 line-through decoration-red-500">
                      {typeof oldPrice === "number"
                        ? oldPrice.toFixed(2)
                        : oldPrice}
                    </TableCell>
                    <TableCell className="p-2">
                      {displayColors.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {displayColors.map((color: any, idx: number) => {
                            const cleanColor =
                              typeof color === "string"
                                ? color.replace(/^\["|"\]$|^"|"$|\\/g, "")
                                : color;

                            return (
                              <div
                                key={idx}
                                className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-xs border"
                                title={cleanColor}
                              >
                                <div
                                  className="w-3 h-3 rounded-full border shadow-sm"
                                  style={{
                                    backgroundColor: cleanColor.toLowerCase(),
                                  }}
                                />
                                <span>{cleanColor}</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="p-2">
                      {displaySizes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {displaySizes.map((size: any, idx: number) => {
                            const cleanSize =
                              typeof size === "string"
                                ? size.replace(/^\["|"\]$|^"|"$|\\/g, "")
                                : size;

                            return (
                              <span
                                key={idx}
                                className="px-2 py-1 rounded-full bg-gray-100 text-xs border"
                              >
                                {cleanSize}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="p-2">
                      <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                        {product.productCategory
                          ? getLocalizedValue(
                              product.productCategory.name,
                              "nameEn",
                              "nameAr",
                              product.productCategory
                            )
                          : "-"}
                      </span>
                    </TableCell>
                    <TableCell className="p-2">
                      <span className="px-2 py-1 rounded bg-gray-100 text-xs font-mono">
                        {(product as any).productCode || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="p-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          product.productStatus
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.productStatus
                          ? t.common.active
                          : t.common.inactive}
                      </span>
                    </TableCell>
                    <TableCell className="p-2">
                      <div className="flex gap-3">
                        <EditProduct product={product} t={t} locale={locale} />
                        <DeleteProduct product={product} t={t} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
