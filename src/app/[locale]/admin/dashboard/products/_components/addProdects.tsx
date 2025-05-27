/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { createProduct } from "@/server";
import { fetchProducts } from "@/redux/features/prodect/prodectSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchCategories } from "@/redux/features/category/categorySlice";
import { faker } from "@faker-js/faker";
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
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle } from "lucide-react";

export function AddProducts({ t, locale }: { t: any; locale: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const { categories } = useAppSelector((state) => state.category);
  const [colorInput, setColorInput] = useState("");
  const [sizeInput, setSizeInput] = useState("");
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [imagesPreview, setImagesPreview] = useState<string[]>([]);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountType, setDiscountType] = useState<"fixed" | "percentage">(
    "fixed"
  );
  const [discountDates, setDiscountDates] = useState(false);
  const productSchema = z.object({
    productName: z.string().min(3, { message: t.admin.minProductNameLength }),
    productDescription: z
      .string()
      .min(10, { message: t.admin.minProductDescriptionLength }),
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
    productColors: z
      .array(z.string())
      .min(1, { message: t.admin.minProductColors }),
    productSizes: z
      .array(z.string())
      .min(1, { message: t.admin.minProductSizes }),
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
      productName: "",
      productDescription: "",
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
      productColors: [],
      productSizes: [],
    },
  });
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // معالجة إضافة لون جديد
  const handleAddColor = () => {
    if (colorInput && !colors.includes(colorInput)) {
      setColors([...colors, colorInput]);
      form.setValue("productColors", [...colors, colorInput]);
      setColorInput("");
    }
  };

  // معالجة إضافة مقاس جديد
  const handleAddSize = () => {
    if (sizeInput && !sizes.includes(sizeInput)) {
      setSizes([...sizes, sizeInput]);
      form.setValue("productSizes", [...sizes, sizeInput]);
      setSizeInput("");
    }
  };

  // معالجة تحميل الصورة الرئيسية
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      form.setValue("productImage", file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  // معالجة تحميل الصور الإضافية
  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      form.setValue("productImages", files);

      const previews = files.map((file) => URL.createObjectURL(file));
      setImagesPreview(previews);
    }
  };

  // تعديل وظيفة onSubmit لإرسال بيانات الخصم
  const onSubmit = (data: z.infer<typeof productSchema>) => {
    const formDataToSend = new FormData();
    formDataToSend.append("productName", data.productName);
    formDataToSend.append("productDescription", data.productDescription);
    formDataToSend.append("productPrice", data.productPrice);

    if (data.hasDiscount) {
      if (discountType === "fixed" && data.oldProductPrice) {
        formDataToSend.append("oldProductPrice", data.oldProductPrice);
        // إضافة قيمة الخصم الثابت
        if (parseFloat(data.productPrice) > parseFloat(data.oldProductPrice)) {
          const fixedDiscount = parseFloat(data.productPrice) - parseFloat(data.oldProductPrice);
          formDataToSend.append("productDiscount", fixedDiscount.toString());
        }
      } else if (discountType === "percentage") {
        // إرسال النسبة المئوية للخصم
        if (data.productDiscountPercentage) {
          formDataToSend.append("productDiscountPercentage", data.productDiscountPercentage);
        }
        
        // إرسال قيمة الخصم
        if (data.productDiscount) {
          formDataToSend.append("productDiscount", data.productDiscount);
        }
        
        // إرسال تواريخ الخصم
        if (discountDates) {
          if (data.productDiscountStartDate) {
            formDataToSend.append("productDiscountStartDate", data.productDiscountStartDate);
          }
          if (data.productDiscountEndDate) {
            formDataToSend.append("productDiscountEndDate", data.productDiscountEndDate);
          }
        } else {
          // إذا لم يتم تحديد تواريخ، نضع تواريخ افتراضية (من اليوم ولمدة شهر)
          const today = new Date();
          const nextMonth = new Date();
          nextMonth.setMonth(today.getMonth() + 1);
          
          formDataToSend.append("productDiscountStartDate", today.toISOString());
          formDataToSend.append("productDiscountEndDate", nextMonth.toISOString());
        }
      }
    } else {
      // إذا لم يكن هناك خصم، نضع قيم افتراضية
      formDataToSend.append("oldProductPrice", "0");
      formDataToSend.append("productDiscount", "0");
      formDataToSend.append("productDiscountPercentage", "0");
    }

    formDataToSend.append("productColors", JSON.stringify(data.productColors));
    formDataToSend.append("productSizes", JSON.stringify(data.productSizes));
    formDataToSend.append("productCategory", data.productCategory);
    formDataToSend.append("productQuantity", data.productQuantity);
    formDataToSend.append("productStatus", data.productStatus.toString());
    formDataToSend.append("NEW", data.NEW.toString());
    formDataToSend.append("productImage", data.productImage);

    data.productImages.forEach((img: File) => {
      formDataToSend.append("productImages", img);
    });

    startTransition(async () => {
      try {
        const response = await createProduct(formDataToSend);
        toast.success(
          response.data.message || t.admin.productCreatedSuccessfully
        );
        dispatch(fetchProducts({ applyFilters: false }));
        router.refresh();
        setOpen(false);
      } catch (error: any) {
        toast.error(error.message || t.common.error);
      }
    });
  };

  const generateFakeImage = async (name = "product.jpg") => {
    const url = "https://picsum.photos/300/300";
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], name, { type: blob.type });
  };

  // توليد منتج وهمي وإرساله
  // تعديل توليد الأرقام بشكل عشوائي باستخدام faker
  const generateFakeProductAndSubmit = async () => {
    if (!categories?.length) {
      toast.error(t.admin.noCategoriesAvailable);
      return;
    }

    const mainImage = await generateFakeImage("main.jpg");
    const images = await Promise.all([
      generateFakeImage("1.jpg"),
      generateFakeImage("2.jpg"),
      generateFakeImage("3.jpg"),
    ]);

    // Generate random data using faker
    const productName = faker.commerce.productName();
    const productDescription = faker.commerce.productDescription();
    const productPrice = faker.commerce.price();
    const oldProductPrice = faker.commerce.price();
    // Use _id instead of id and ensure categories structure is correct
    const randomCategory =
      categories[Math.floor(Math.random() * categories.length)];
    const productCategory = randomCategory?._id || ""; // Fallback to empty string if undefined
    const productQuantity = faker.number.int({ min: 1, max: 100 });
    // const productRating = faker.number.float({ min: 1, max: 5 });
    // const productReviews = faker.number.int({ min: 0, max: 100 });

    // Generate colors and sizes
    const availableColors = ["red", "blue", "green", "black", "white"];
    const availableSizes = ["S", "M", "L", "XL"];
    const productColors = [
      availableColors[Math.floor(Math.random() * availableColors.length)],
    ];
    const productSizes = [
      availableSizes[Math.floor(Math.random() * availableSizes.length)],
    ];

    // Build FormData and submit
    const formDataToSend = new FormData();
    formDataToSend.append("productName", productName);
    formDataToSend.append("productDescription", productDescription);
    formDataToSend.append("productPrice", productPrice);
    formDataToSend.append("oldProductPrice", oldProductPrice);
    formDataToSend.append("productColors", JSON.stringify(productColors));
    formDataToSend.append("productSizes", JSON.stringify(productSizes));
    formDataToSend.append("productCategory", productCategory);
    formDataToSend.append("productQuantity", productQuantity.toString());
    formDataToSend.append("productStatus", "true");
    // formDataToSend.append("productRating", productRating.toString());
    // formDataToSend.append("productReviews", productReviews.toString()); // Send as a number string
    formDataToSend.append("productImage", mainImage);

    images.forEach((img: File) => {
      formDataToSend.append("productImages", img);
    });

    startTransition(async () => {
      try {
        const response = await createProduct(formDataToSend);
        toast.success(
          response.data.message || t.admin.productCreatedSuccessfully
        );
        dispatch(fetchProducts({ applyFilters: false }));

        setOpen(false);
        router.refresh();
      } catch (error: any) {
        toast.error(error.message || t.common.error);
      }
    });
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* اسم المنتج */}
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.admin.productName}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t.admin.enterProductName}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* سعر المنتج */}
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

            {/* خصم المنتج */}
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
                    <div className="space-y-4">
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
                                onChange={(e) => {
                                  field.onChange(e);
                                  // حساب قيمة الخصم تلقائيًا عند تغيير النسبة المئوية
                                  const percentage = parseFloat(e.target.value) || 0;
                                  const price = parseFloat(form.getValues("productPrice")) || 0;
                                  const discountAmount = price * (percentage / 100);
                                  form.setValue("productDiscount", discountAmount.toString());
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="productDiscount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.admin.discountAmount}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder={t.admin.enterProductDiscount}
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  // حساب النسبة المئوية تلقائيًا عند تغيير قيمة الخصم
                                  const discountAmount = parseFloat(e.target.value) || 0;
                                  const price = parseFloat(form.getValues("productPrice")) || 0;
                                  if (price > 0) {
                                    const percentage = (discountAmount / price) * 100;
                                    form.setValue("productDiscountPercentage", percentage.toFixed(2));
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Checkbox
                          id="discountDates"
                          checked={discountDates}
                          onCheckedChange={(checked) => {
                            setDiscountDates(!!checked);
                          }}
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
                                <FormLabel>
                                  {t.admin.discountStartDate}
                                </FormLabel>
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

                      {/* عرض السعر بعد الخصم */}
                      {form.watch("productDiscountPercentage") && form.watch("productPrice") && (
                        <div className="p-3 bg-gray-50 rounded-md">
                          <p className="text-sm font-medium">{t.admin.calculatedPrice}:</p>
                          <p className="text-lg font-bold text-secondary">
                            {(
                              parseFloat(form.getValues("productPrice")) -
                              parseFloat(form.getValues("productDiscount") || "0")
                            ).toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* علامة منتج جديد */}
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
                    <FormDescription>
                      {t.admin.markAsNewDescription}
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>

            {/* وصف المنتج */}
            <FormField
              control={form.control}
              name="productDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.admin.productDescription}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t.admin.enterProductDescription}
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* فئة المنتج */}
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
                          <SelectItem className="hover:bg-secondary hover:text-white" key={category._id} value={category._id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* كمية المنتج */}
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

            {/* ألوان المنتج */}
            <div className="space-y-2">
              <Label>{t.admin.productColors}</Label>
              <div className="flex gap-2">
                <Input
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  placeholder={t.admin.enterProductColor}
                />
                <Button type="button" onClick={handleAddColor}>
                  {t.admin.add}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {colors.map((color, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-gray-100 p-2 rounded"
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: color.toLowerCase() }}
                    />
                    <span>{color}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newColors = colors.filter((_, i) => i !== index);
                        setColors(newColors);
                        form.setValue("productColors", newColors);
                      }}
                      className="text-red-500 ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              {form.formState.errors.productColors && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.productColors.message}
                </p>
              )}
            </div>

            {/* مقاسات المنتج */}
            <div className="space-y-2">
              <Label>{t.admin.productSizes}</Label>
              <div className="flex gap-2">
                <Input
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  placeholder={t.admin.enterProductSize}
                />
                <Button type="button" onClick={handleAddSize}>
                  {t.admin.add}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {sizes.map((size, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-gray-100 p-2 rounded"
                  >
                    <span>{size}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newSizes = sizes.filter((_, i) => i !== index);
                        setSizes(newSizes);
                        form.setValue("productSizes", newSizes);
                      }}
                      className="text-red-500 ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              {form.formState.errors.productSizes && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.productSizes.message}
                </p>
              )}
            </div>

            {/* الصورة الرئيسية */}
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
                    alt="معاينة الصورة الرئيسية"
                    className="w-32 h-32 object-cover rounded"
                  />
                </div>
              )}
              {form.formState.errors.productImage && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.productImage.message as string}
                </p>
              )}
            </div>

            {/* صور المنتج الإضافية */}
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
                      alt={`معاينة ${index + 1}`}
                      className="w-24 h-24 object-cover rounded"
                    />
                  ))}
                </div>
              )}
              {form.formState.errors.productImages && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.productImages.message as string}
                </p>
              )}
            </div>

            {/* حالة المنتج */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <FormField
                control={form.control}
                name="productStatus"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 rtl:space-x-reverse">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>{t.admin.productStatus}</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                {t.admin.reset}
              </Button>
              <Button
                type="submit"
                className="bg-secondary hover:bg-secondary/90"
                disabled={isPending}
              >
                {isPending ? t.admin.sending : t.admin.addProduct}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        {/* <div className="py-4">
          <Button
            onClick={generateFakeProductAndSubmit}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            disabled={isPending}
          >
            {isPending ? t.admin.sending : t.admin.createFakeProduct}
          </Button>
        </div> */}
      </DialogContent>
    </Dialog>
  );
}
