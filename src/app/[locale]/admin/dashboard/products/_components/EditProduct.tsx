/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { useUpdateProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import Image from "next/image";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product } from "@/types";
import { Edit, X } from "lucide-react";

export default function EditProduct({
  t,
  locale,
  product,
}: {
  t: any;
  locale: string;
  product: Product;
}) {
  const router = useRouter();
  const updateProductMutation = useUpdateProduct();
  const { data: categoriesResponse } = useCategories();
  const categories = categoriesResponse?.data || [];

  const [open, setOpen] = useState(false);

  const [hasDiscount, setHasDiscount] = useState(
    !!(product?.oldProductPrice > 0 || product?.productDiscount > 0)
  );

  const [discountType, setDiscountType] = useState<"fixed" | "percentage">(
    product?.productDiscountPercentage > 0 ? "percentage" : "fixed"
  );

  const [discountDates, setDiscountDates] = useState(
    !!(product?.productDiscountStartDate && product?.productDiscountEndDate)
  );

  // Localized Inputs State
  const [colorInputEn, setColorInputEn] = useState("");
  const [colorInputAr, setColorInputAr] = useState("");
  const [sizeInputEn, setSizeInputEn] = useState("");
  const [sizeInputAr, setSizeInputAr] = useState("");

  // Normalize arrays helper
  const normalizeArray = (arr: any[]): string[] => {
    if (!arr || !Array.isArray(arr)) return [];
    return arr.map((item) => {
      if (typeof item === "string") {
        return item.replace(/^\["|"\]$|^"|"$|\\/g, "");
      }
      return String(item);
    });
  };

  const getLocalizedValue = (value: any, lang: string) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      return value[lang] || "";
    }
    return String(value);
  };

  // Initialize Localized State
  const initialColorsEn = normalizeArray(
    (product as any).productColorsEn || []
  );
  const initialColorsAr = normalizeArray(
    (product as any).productColorsAr || []
  );
  const initialSizesEn = normalizeArray((product as any).productSizesEn || []);
  const initialSizesAr = normalizeArray((product as any).productSizesAr || []);

  const [colorsEn, setColorsEn] = useState<string[]>(initialColorsEn);
  const [colorsAr, setColorsAr] = useState<string[]>(initialColorsAr);
  const [sizesEn, setSizesEn] = useState<string[]>(initialSizesEn);
  const [sizesAr, setSizesAr] = useState<string[]>(initialSizesAr);

  // Initialize from legacy or virtuals if implicit
  useEffect(() => {
    if (open) {
      // Re-initialize state when modal opens to ensure fresh data if product prop changed
      // But also check if we need to fall back to generic arrays
      let newColorsEn = normalizeArray((product as any).productColorsEn || []);
      let newColorsAr = normalizeArray((product as any).productColorsAr || []);
      let newSizesEn = normalizeArray((product as any).productSizesEn || []);
      let newSizesAr = normalizeArray((product as any).productSizesAr || []);

      if (
        newColorsEn.length === 0 &&
        newColorsAr.length === 0 &&
        (product as any).productColors?.length > 0
      ) {
        const raw = (product as any).productColors;
        if (Array.isArray(raw)) newColorsEn = normalizeArray(raw);
        else if (typeof raw === "object") {
          if (raw.en) newColorsEn = normalizeArray(raw.en);
          if (raw.ar) newColorsAr = normalizeArray(raw.ar);
        }
      }

      if (
        newSizesEn.length === 0 &&
        newSizesAr.length === 0 &&
        (product as any).productSizes?.length > 0
      ) {
        const raw = (product as any).productSizes;
        if (Array.isArray(raw)) newSizesEn = normalizeArray(raw);
        else if (typeof raw === "object") {
          if (raw.en) newSizesEn = normalizeArray(raw.en);
          if (raw.ar) newSizesAr = normalizeArray(raw.ar);
        }
      }

      setColorsEn(newColorsEn);
      setColorsAr(newColorsAr);
      setSizesEn(newSizesEn);
      setSizesAr(newSizesAr);
    }
  }, [product, open]);

  const [mainImagePreview, setMainImagePreview] = useState<string | null>(
    product?.productImage ? `${product.productImage}` : null
  );
  const [existingImages, setExistingImages] = useState<string[]>(
    product?.productImages || []
  );
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [imagesPreview, setImagesPreview] = useState<string[]>([]);

  // Define Zod schema
  const productSchema = z.object({
    productNameEn: z.string().min(3, { message: t.admin.minProductNameLength }),
    productNameAr: z.string().min(3, { message: t.admin.minProductNameLength }),
    productDescriptionEn: z
      .string()
      .min(10, { message: t.admin.minProductDescriptionLength }),
    productDescriptionAr: z
      .string()
      .min(10, { message: t.admin.minProductDescriptionLength }),
    productPrice: z
      .string()
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: t.admin.invalidPrice,
      }),
    oldProductPrice: z.string().optional(),
    hasDiscount: z.boolean().default(false),
    productDiscount: z.string().optional(),
    productDiscountPercentage: z.string().optional(),
    productDiscountStartDate: z.string().optional(),
    productDiscountEndDate: z.string().optional(),
    productCategory: z
      .string()
      .min(1, { message: t.admin.productCategoryRequired }),
    productQuantity: z
      .string()
      .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: t.admin.invalidQuantity,
      }),
    productStatus: z.boolean().default(true),
    NEW: z.boolean().default(false),
    productCode: z.string().optional(),
    productColorsEn: z.array(z.string()).default([]),
    productColorsAr: z.array(z.string()).default([]),
    productSizesEn: z.array(z.string()).default([]),
    productSizesAr: z.array(z.string()).default([]),
    productImage: z.any().optional(),
    productImages: z.array(z.any()),
    productSlug: z.string().optional(),
  });

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productNameEn:
        getLocalizedValue(product?.productName, "en") ||
        (product as any).productNameEn ||
        "",
      productNameAr:
        getLocalizedValue(product?.productName, "ar") ||
        (product as any).productNameAr ||
        "",
      productDescriptionEn:
        getLocalizedValue(product?.productDescription, "en") ||
        (product as any).productDescriptionEn ||
        "",
      productDescriptionAr:
        getLocalizedValue(product?.productDescription, "ar") ||
        (product as any).productDescriptionAr ||
        "",
      productPrice: product?.productPrice?.toString() || "",
      oldProductPrice: product?.oldProductPrice?.toString() || "",
      hasDiscount: hasDiscount,
      productDiscount: product?.productDiscount?.toString() || "",
      productDiscountPercentage:
        product?.productDiscountPercentage?.toString() || "",
      productDiscountStartDate: product?.productDiscountStartDate
        ? new Date(product.productDiscountStartDate).toISOString().slice(0, 16)
        : "",
      productDiscountEndDate: product?.productDiscountEndDate
        ? new Date(product.productDiscountEndDate).toISOString().slice(0, 16)
        : "",
      productCategory:
        typeof product?.productCategory === "object"
          ? (product.productCategory as any)._id
          : product?.productCategory || "",
      productQuantity: product?.productQuantity?.toString() || "",
      productStatus: product?.productStatus || true,
      NEW: product?.NEW || false,
      productCode: (product as any)?.productCode || "",
      productColorsEn: [], // synced via state/effect
      productColorsAr: [],
      productSizesEn: [],
      productSizesAr: [],
      productImages: [],
      productSlug: product?.productSlug, // Keep existing slug if valid
    },
  });

  // Handlers
  const handleAddColor = (lang: "en" | "ar") => {
    const input = lang === "en" ? colorInputEn : colorInputAr;
    const currentList = lang === "en" ? colorsEn : colorsAr;
    const setList = lang === "en" ? setColorsEn : setColorsAr;
    const setInput = lang === "en" ? setColorInputEn : setColorInputAr;

    if (input && !currentList.includes(input)) {
      setList([...currentList, input]);
      setInput("");
    } else if (input && currentList.includes(input)) {
      toast.warning(t.admin.colorAlreadyExists);
    }
  };

  const handleRemoveColor = (lang: "en" | "ar", index: number) => {
    const currentList = lang === "en" ? colorsEn : colorsAr;
    const setList = lang === "en" ? setColorsEn : setColorsAr;
    setList(currentList.filter((_, i) => i !== index));
  };

  const handleAddSize = (lang: "en" | "ar") => {
    const input = lang === "en" ? sizeInputEn : sizeInputAr;
    const currentList = lang === "en" ? sizesEn : sizesAr;
    const setList = lang === "en" ? setSizesEn : setSizesAr;
    const setInput = lang === "en" ? setSizeInputEn : setSizeInputAr;

    if (input && !currentList.includes(input)) {
      setList([...currentList, input]);
      setInput("");
    } else if (input && currentList.includes(input)) {
      toast.warning(t.admin.sizeAlreadyExists);
    }
  };

  const handleRemoveSize = (lang: "en" | "ar", index: number) => {
    const currentList = lang === "en" ? sizesEn : sizesAr;
    const setList = lang === "en" ? setSizesEn : setSizesAr;
    setList(currentList.filter((_, i) => i !== index));
  };

  const handleDiscountToggle = (checked: boolean) => {
    setHasDiscount(checked);
    form.setValue("hasDiscount", checked);
    if (!checked) {
      form.setValue("oldProductPrice", "");
      form.setValue("productDiscount", "");
      form.setValue("productDiscountPercentage", "");
      form.setValue("productDiscountStartDate", "");
      form.setValue("productDiscountEndDate", "");
    }
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      form.setValue("productImage", file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      form.setValue("productImages", files);
      const previews = files.map((file) => URL.createObjectURL(file));
      setImagesPreview(previews);
    }
  };

  const handleRemoveImage = (imageUrl: string) => {
    setExistingImages((prev) => prev.filter((img) => img !== imageUrl));
    setDeletedImages((prev) => [...prev, imageUrl]);
  };

  const onSubmit = async (data: z.infer<typeof productSchema>) => {
    const formDataToSend = new FormData();
    formDataToSend.append("productNameEn", data.productNameEn);
    formDataToSend.append("productNameAr", data.productNameAr);
    formDataToSend.append("productDescriptionEn", data.productDescriptionEn);
    formDataToSend.append("productDescriptionAr", data.productDescriptionAr);
    formDataToSend.append("productPrice", data.productPrice);
    formDataToSend.append("productCategory", data.productCategory);
    formDataToSend.append("productQuantity", data.productQuantity);
    formDataToSend.append("productStatus", data.productStatus.toString());
    formDataToSend.append("NEW", (data.NEW ?? false).toString());
    if (data.productCode)
      formDataToSend.append("productCode", data.productCode);

    // Send to both En/Ar keys
    formDataToSend.append("productColorsEn", JSON.stringify(colorsEn));
    formDataToSend.append("productColorsAr", JSON.stringify(colorsAr));
    formDataToSend.append("productSizesEn", JSON.stringify(sizesEn));
    formDataToSend.append("productSizesAr", JSON.stringify(sizesAr));

    if (hasDiscount) {
      formDataToSend.append("oldProductPrice", data.oldProductPrice || "0");
      formDataToSend.append(
        "productDiscountPercentage",
        data.productDiscountPercentage || "0"
      );
      if (data.productDiscountStartDate)
        formDataToSend.append(
          "productDiscountStartDate",
          data.productDiscountStartDate
        );
      if (data.productDiscountEndDate)
        formDataToSend.append(
          "productDiscountEndDate",
          data.productDiscountEndDate
        );
    } else {
      formDataToSend.append("oldProductPrice", "0");
      formDataToSend.append("productDiscountPercentage", "0");
    }

    if (deletedImages.length > 0) {
      formDataToSend.append("deletedImages", JSON.stringify(deletedImages));
    }

    if (data.productImage instanceof File) {
      formDataToSend.append("productImage", data.productImage);
    }

    if (data.productImages && data.productImages.length > 0) {
      data.productImages.forEach((file: File) =>
        formDataToSend.append("productImages", file)
      );
    }

    try {
      await updateProductMutation.mutateAsync({
        slug: product.productSlug,
        formData: formDataToSend,
      });
      setOpen(false);
      router.refresh();
    } catch {
      // Error handled by hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="hover:text-white font-semibold text-white-foreground transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-slate-500/50 hover:shadow-sm/50"
        >
          {t.admin.editProduct}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.admin.editProduct}</DialogTitle>
          <DialogDescription>{t.admin.addProductDescription}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="productNameEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.admin.productName} (EN)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t.admin.enterProductName + " (EN)"}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="productNameAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.admin.productName} (AR)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t.admin.enterProductName + " (AR)"}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="productPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.admin.productPrice}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t.admin.enterProductPrice}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="productDescriptionEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.admin.productDescription} (EN)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t.admin.enterProductDescription + " (EN)"}
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="productDescriptionAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.admin.productDescription} (AR)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t.admin.enterProductDescription + " (AR)"}
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Checkbox
                  id="hasDiscount"
                  checked={hasDiscount}
                  onCheckedChange={handleDiscountToggle}
                />
                <Label htmlFor="hasDiscount">
                  {t.admin.addDiscountToProduct}
                </Label>
              </div>

              {hasDiscount && (
                <div className="space-y-4 p-4 border rounded-md">
                  <div className="flex space-x-4 rtl:space-x-reverse">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <input
                        type="radio"
                        id="fixedDiscount"
                        checked={discountType === "fixed"}
                        onChange={() => setDiscountType("fixed")}
                      />
                      <Label htmlFor="fixedDiscount">
                        {t.admin.fixedDiscount}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <input
                        type="radio"
                        id="percentageDiscount"
                        checked={discountType === "percentage"}
                        onChange={() => setDiscountType("percentage")}
                      />
                      <Label htmlFor="percentageDiscount">
                        {t.admin.percentageDiscount}
                      </Label>
                    </div>
                  </div>

                  {discountType === "fixed" ? (
                    <FormField
                      control={form.control}
                      name="oldProductPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.admin.oldProductPrice}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={t.admin.enterOldProductPrice}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <FormField
                      control={form.control}
                      name="productDiscountPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.admin.discountPercentage}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={t.admin.enterDiscountPercentage}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Checkbox
                      id="discountDates"
                      checked={discountDates}
                      onCheckedChange={(checked) => setDiscountDates(!!checked)}
                    />
                    <Label htmlFor="discountDates">
                      {t.admin.setDiscountPeriod}
                    </Label>
                  </div>

                  {discountDates && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="productDiscountStartDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.admin.discountStartDate}</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="productDiscountEndDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.admin.discountEndDate}</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <FormField
                control={form.control}
                name="NEW"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 rtl:space-x-reverse">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>{t.admin.markAsNew}</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="productCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.admin.productCategory}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t.admin.chooseProductCategory}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        {categories?.map((category: any) => (
                          <SelectItem
                            className="hover:bg-secondary hover:text-white"
                            key={category._id}
                            value={category._id}
                          >
                            {category.nameEn ||
                              category.nameAr ||
                              category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="productQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.admin.productQuantity}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t.admin.enterProductQuantity}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Product Code */}
            <FormField
              control={form.control}
              name="productCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t.admin.productCode || "Product Code"} (
                    {t.admin.optional || "Optional"})
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        t.admin.enterProductCode || "Enter unique product code"
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Colors - Localized */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded bg-gray-50/50">
              {/* EN */}
              <div className="space-y-2">
                <Label>{t.admin.productColors} (EN)</Label>
                <div className="flex gap-2">
                  <Input
                    value={colorInputEn}
                    onChange={(e) => setColorInputEn(e.target.value)}
                    placeholder="Red, Blue..."
                  />
                  <Button type="button" onClick={() => handleAddColor("en")}>
                    {t.admin.add}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {colorsEn.map((color, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-white border p-1 rounded px-2"
                    >
                      <div
                        className="w-3 h-3 rounded-full border"
                        style={{ backgroundColor: color.toLowerCase() }}
                      />
                      <span className="text-sm">{color}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveColor("en", index)}
                        className="text-red-500 hover:text-red-700 ml-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* AR */}
              <div className="space-y-2">
                <Label>{t.admin.productColors} (AR)</Label>
                <div className="flex gap-2">
                  <Input
                    value={colorInputAr}
                    onChange={(e) => setColorInputAr(e.target.value)}
                    placeholder="أحمر, أزرق..."
                  />
                  <Button type="button" onClick={() => handleAddColor("ar")}>
                    {t.admin.add}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {colorsAr.map((color, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-white border p-1 rounded px-2"
                    >
                      <span className="text-sm">{color}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveColor("ar", index)}
                        className="text-red-500 hover:text-red-700 ml-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sizes - Localized */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded bg-gray-50/50">
              {/* EN */}
              <div className="space-y-2">
                <Label>{t.admin.productSizes} (EN)</Label>
                <div className="flex gap-2">
                  <Input
                    value={sizeInputEn}
                    onChange={(e) => setSizeInputEn(e.target.value)}
                    placeholder="S, M, L..."
                  />
                  <Button type="button" onClick={() => handleAddSize("en")}>
                    {t.admin.add}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {sizesEn.map((size, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-white border p-1 rounded px-2"
                    >
                      <span className="text-sm">{size}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSize("en", index)}
                        className="text-red-500 hover:text-red-700 ml-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* AR */}
              <div className="space-y-2">
                <Label>{t.admin.productSizes} (AR)</Label>
                <div className="flex gap-2">
                  <Input
                    value={sizeInputAr}
                    onChange={(e) => setSizeInputAr(e.target.value)}
                    placeholder="صغير, متوسط..."
                  />
                  <Button type="button" onClick={() => handleAddSize("ar")}>
                    {t.admin.add}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {sizesAr.map((size, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-white border p-1 rounded px-2"
                    >
                      <span className="text-sm">{size}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSize("ar", index)}
                        className="text-red-500 hover:text-red-700 ml-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t.admin.mainImage}</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleMainImageChange}
              />
              {mainImagePreview && (
                <div className="mt-2 relative w-32 h-32">
                  <img
                    src={mainImagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t.admin.additionalImages}</Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesChange}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {existingImages.map((img, index) => (
                  <div key={`existing-${index}`} className="relative">
                    <img
                      src={`${img}`}
                      alt={`Existing ${index}`}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-0 right-0 h-6 w-6 rounded-full"
                      onClick={() => handleRemoveImage(img)}
                    >
                      &times;
                    </Button>
                  </div>
                ))}
                {imagesPreview.map((preview, index) => (
                  <div key={`preview-${index}`} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index}`}
                      className="w-24 h-24 object-cover rounded"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={updateProductMutation.isPending}>
              {updateProductMutation.isPending
                ? t.common.loading
                : t.admin.saveChanges}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
