/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCreateProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
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
import { PlusCircle, X } from "lucide-react";

export function AddProduct({ t, locale }: { t: any; locale: string }) {
  const router = useRouter();
  const createProductMutation = useCreateProduct();
  const { data: categoriesResponse } = useCategories();
  const categories = categoriesResponse?.data || [];

  const [open, setOpen] = useState(false);

  // Localized inputs state
  const [colorInputEn, setColorInputEn] = useState("");
  const [colorInputAr, setColorInputAr] = useState("");
  const [colorsEn, setColorsEn] = useState<string[]>([]);
  const [colorsAr, setColorsAr] = useState<string[]>([]);

  const [sizeInputEn, setSizeInputEn] = useState("");
  const [sizeInputAr, setSizeInputAr] = useState("");
  const [sizesEn, setSizesEn] = useState<string[]>([]);
  const [sizesAr, setSizesAr] = useState<string[]>([]);

  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [imagesPreview, setImagesPreview] = useState<string[]>([]);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountType, setDiscountType] = useState<"fixed" | "percentage">(
    "fixed"
  );
  const [discountDates, setDiscountDates] = useState(false);

  const productSchema = z.object({
    productNameEn: z
      .string()
      .min(3, { message: t.admin.minProductNameLength || "Min 3 chars" }),
    productNameAr: z
      .string()
      .min(3, { message: t.admin.minProductNameLength || "Min 3 chars" }),
    productDescriptionEn: z.string().min(10, {
      message: t.admin.minProductDescriptionLength || "Min 10 chars",
    }),
    productDescriptionAr: z.string().min(10, {
      message: t.admin.minProductDescriptionLength || "Min 10 chars",
    }),
    productPrice: z
      .string()
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: t.admin.invalidPrice,
      }),
    oldProductPrice: z.string().optional(),
    hasDiscount: z.boolean().default(false),
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
    NEW: z.boolean().default(true),
    productCode: z.string().optional(),
    productColorsEn: z.array(z.string()).default([]),
    productColorsAr: z.array(z.string()).default([]),
    productSizesEn: z.array(z.string()).default([]),
    productSizesAr: z.array(z.string()).default([]),
    productImage: z.any().refine((file) => file instanceof File, {
      message: t.admin.mainImageRequired,
    }),
    productImages: z.array(z.any()).refine((files) => files.length > 0, {
      message: t.admin.additionalImagesRequired,
    }),
  });

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productNameEn: "",
      productNameAr: "",
      productDescriptionEn: "",
      productDescriptionAr: "",
      productPrice: "",
      oldProductPrice: "",
      hasDiscount: false,
      productDiscountPercentage: "",
      productDiscountStartDate: "",
      productDiscountEndDate: "",
      productCategory: "",
      productQuantity: "",
      productStatus: true,
      NEW: true,
      productCode: "",
      productColorsEn: [],
      productColorsAr: [],
      productSizesEn: [],
      productSizesAr: [],
    },
  });

  // Helper handling
  const handleAddColor = (lang: "en" | "ar") => {
    const input = lang === "en" ? colorInputEn : colorInputAr;
    const currentList = lang === "en" ? colorsEn : colorsAr;
    // const setList = lang === 'en' ? setColorsEn : setColorsAr; // Use correct setter via React closure but explicit here
    const setInput = lang === "en" ? setColorInputEn : setColorInputAr;
    const fieldName = lang === "en" ? "productColorsEn" : "productColorsAr";

    if (input && !currentList.includes(input)) {
      const newList = [...currentList, input];
      if (lang === "en") setColorsEn(newList);
      else setColorsAr(newList);
      form.setValue(fieldName, newList);
      setInput("");
    }
  };

  const handleRemoveColor = (lang: "en" | "ar", index: number) => {
    const currentList = lang === "en" ? colorsEn : colorsAr;
    const fieldName = lang === "en" ? "productColorsEn" : "productColorsAr";

    const newList = currentList.filter((_, i) => i !== index);
    if (lang === "en") setColorsEn(newList);
    else setColorsAr(newList);
    form.setValue(fieldName, newList);
  };

  const handleAddSize = (lang: "en" | "ar") => {
    const input = lang === "en" ? sizeInputEn : sizeInputAr;
    const currentList = lang === "en" ? sizesEn : sizesAr;
    const setInput = lang === "en" ? setSizeInputEn : setSizeInputAr;
    const fieldName = lang === "en" ? "productSizesEn" : "productSizesAr";

    if (input && !currentList.includes(input)) {
      const newList = [...currentList, input];
      if (lang === "en") setSizesEn(newList);
      else setSizesAr(newList);
      form.setValue(fieldName, newList);
      setInput("");
    }
  };

  const handleRemoveSize = (lang: "en" | "ar", index: number) => {
    const currentList = lang === "en" ? sizesEn : sizesAr;
    const fieldName = lang === "en" ? "productSizesEn" : "productSizesAr";

    const newList = currentList.filter((_, i) => i !== index);
    if (lang === "en") setSizesEn(newList);
    else setSizesAr(newList);
    form.setValue(fieldName, newList);
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

  const onSubmit = async (data: z.infer<typeof productSchema>) => {
    const formDataToSend = new FormData();
    formDataToSend.append("productNameEn", data.productNameEn);
    formDataToSend.append("productNameAr", data.productNameAr);
    formDataToSend.append("productDescriptionEn", data.productDescriptionEn);
    formDataToSend.append("productDescriptionAr", data.productDescriptionAr);
    formDataToSend.append("productPrice", data.productPrice);

    if (hasDiscount) {
      formDataToSend.append("oldProductPrice", data.oldProductPrice || "");
      formDataToSend.append(
        "productDiscountPercentage",
        data.productDiscountPercentage || ""
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
      formDataToSend.append("oldProductPrice", "");
      formDataToSend.append("productDiscountPercentage", "");
    }

    // Send localized colors/sizes
    formDataToSend.append(
      "productColorsEn",
      JSON.stringify(data.productColorsEn)
    );
    formDataToSend.append(
      "productColorsAr",
      JSON.stringify(data.productColorsAr)
    );
    formDataToSend.append(
      "productSizesEn",
      JSON.stringify(data.productSizesEn)
    );
    formDataToSend.append(
      "productSizesAr",
      JSON.stringify(data.productSizesAr)
    );

    formDataToSend.append("productCategory", data.productCategory);
    formDataToSend.append("productQuantity", data.productQuantity);
    formDataToSend.append("productStatus", data.productStatus.toString());
    formDataToSend.append("NEW", data.NEW.toString());
    if (data.productCode)
      formDataToSend.append("productCode", data.productCode);

    if (data.productImage)
      formDataToSend.append("productImage", data.productImage);
    if (data.productImages && data.productImages.length > 0) {
      data.productImages.forEach((img: File) =>
        formDataToSend.append("productImages", img)
      );
    }

    try {
      await createProductMutation.mutateAsync(formDataToSend);
      setOpen(false);
      form.reset();
      setMainImagePreview(null);
      setImagesPreview([]);
      setColorsEn([]);
      setColorsAr([]);
      setSizesEn([]);
      setSizesAr([]);
    } catch {
      // Error handled by hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-secondary hover:bg-secondary/90 cursor-pointer">
          <PlusCircle className="mr-2 h-4 w-4" />
          {t.admin.addProduct}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.admin.addProduct}</DialogTitle>
          <DialogDescription>{t.admin.AddProductDescription}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Names */}
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
            </div>

            {/* Price */}
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

            {/* Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            {/* Discount Section */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Checkbox
                  id="hasDiscount"
                  checked={hasDiscount}
                  onCheckedChange={(checked) => {
                    setHasDiscount(!!checked);
                    form.setValue("hasDiscount", !!checked);
                  }}
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

            {/* NEW Status */}
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

            {/* Category and Quantity */}
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
                            {/* We use getLocalizedValue logic here implicitly or just show nameEn/Ar if available */}
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

            {/* Images */}
            <div className="space-y-2">
              <Label>{t.admin.mainImage}</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleMainImageChange}
              />
              {mainImagePreview && (
                <div className="mt-2">
                  <img
                    src={mainImagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded"
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
              {imagesPreview.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {imagesPreview.map((preview, index) => (
                    <img
                      key={index}
                      src={preview}
                      alt={`Preview ${index}`}
                      className="w-24 h-24 object-cover rounded"
                    />
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={createProductMutation.isPending}>
                {createProductMutation.isPending
                  ? t.common.loading
                  : t.admin.addProduct}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
