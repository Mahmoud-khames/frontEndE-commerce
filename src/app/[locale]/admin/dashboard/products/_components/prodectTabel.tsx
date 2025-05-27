/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchProducts } from "@/redux/features/prodect/prodectSlice";
import { AddProducts } from "./addProdects";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EditProduct from "./EditProdects";
import DeleteProduct from "./deleteProduct";
import { Loader2 } from "lucide-react";

export default function ProductsTable({
  t,
  locale,
}: {
  t: any;
  locale: string;
}) {
  const dispatch = useAppDispatch();
  const { products, status } = useAppSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts({ applyFilters: false }));
  }, [dispatch]);

  // وظيفة لتقصير النص الطويل
  const truncateText = (text: string, maxLength: number = 50) => {
    if (!text) return "-";
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">{t.admin.ManageProducts}</h2>
        <AddProducts t={t} locale={locale} />
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
                {t.admin.productStatus}
              </TableHead>
              <TableHead className="text-left p-2">
                {t.common.actions}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {status === "loading" ? (
              <TableRow>
                <TableCell
                  colSpan={11}
                  className="p-4 text-center"
                >
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
              products?.map((product: any, index) => (
                <TableRow key={product._id} className="hover:bg-gray-50">
                  <TableCell className="p-2">{index + 1}</TableCell>
                  <TableCell className="p-2 font-medium">
                    {product.productName}
                  </TableCell>
                  <TableCell className="p-2 max-w-[200px]">
                    <div className="truncate" title={product.productDescription}>
                      {truncateText(product.productDescription, 30)}
                    </div>
                  </TableCell>
                  <TableCell className="p-2 font-medium">
                    {product.productPrice}
                  </TableCell>
                  <TableCell className="p-2 text-gray-500">
                    {product.oldProductPrice > 0 ? product.oldProductPrice : "-"}
                  </TableCell>
                  <TableCell className="p-2">
                    {Array.isArray(product.productColors) && product.productColors.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {product.productColors.map((color: any, idx: number) => {
                          // تنظيف سلسلة اللون من أي تنسيق JSON
                          const cleanColor = typeof color === 'string' 
                            ? color.replace(/^\["|"\]$|^"|"$|\\/g, '') 
                            : color;
                            
                          return (
                            <div 
                              key={idx} 
                              className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-xs"
                              title={cleanColor}
                            >
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: cleanColor.toLowerCase() }}
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
                    {Array.isArray(product.productSizes) && product.productSizes.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {product.productSizes.map((size: any, idx: number) => {
                          // تنظيف سلسلة المقاس من أي تنسيق JSON
                          const cleanSize = typeof size === 'string' 
                            ? size.replace(/^\["|"\]$|^"|"$|\\/g, '') 
                            : size;
                            
                          return (
                            <span 
                              key={idx} 
                              className="px-2 py-1 rounded-full bg-gray-100 text-xs"
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
                      {product.productCategory?.name || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="p-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.productStatus 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
