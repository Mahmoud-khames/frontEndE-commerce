"use client";

import React, { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchCategories } from "@/redux/features/category/categorySlice";
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
  t: any;
  locale: string;
}) {
  const dispatch = useAppDispatch();
  // Update the destructuring to use the correct property name
  const { categories, loading } = useAppSelector((state) => state.category);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Function to truncate long text
  const truncateText = (text: string, maxLength: number = 50) => {
    if (!text) return "-";
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">{t.admin.manageCategories}</h2>
        <AddCategory t={t} locale={locale} />
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
              <TableHead className="text-left p-2">
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
              categories?.map((category: any, index: number) => (
                <TableRow key={category._id} className="hover:bg-gray-50">
                  <TableCell className="p-2">{index + 1}</TableCell>
                  <TableCell className="p-2">
                    <div className="w-16 h-16 relative rounded overflow-hidden">
                      {category.image ? (
                        <Image
                          src={`${category.image}`}
                          alt={category.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-500">{t.admin.noImage}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="p-2 font-medium">
                    {category.name}
                  </TableCell>
                  <TableCell className="p-2 max-w-[200px]">
                    <div className="truncate" title={category.description}>
                      {truncateText(category.description, 30)}
                    </div>
                  </TableCell>
                  <TableCell className="p-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      category.status 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {category.status
                        ? t.common.active
                        : t.common.inactive}
                    </span>
                  </TableCell>
                  <TableCell className="p-2">
                    <div className="flex gap-3">
                      <EditCategory category={category} t={t} locale={locale} />
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




