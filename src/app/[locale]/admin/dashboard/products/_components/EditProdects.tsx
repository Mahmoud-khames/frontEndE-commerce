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
import { fetchProducts } from "@/redux/features/prodect/prodectSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchCategories } from "@/redux/features/category/categorySlice";
import Image from "next/image";
import { updateProduct } from "@/server";
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
import { IProduct } from "@/types/type";

export default function EditProduct({
  t,
  locale,
  product,
}: {
  t: any;
  locale: string;
  product: IProduct;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const dispatch = useAppDispatch();
  const { categories } = useAppSelector((state) => state.category);
  const [open, setOpen] = useState(false);
  const apiURL = process.env.NEXT_PUBLIC_API_URL;
  
  const [hasDiscount, setHasDiscount] = useState(
    product?.oldProductPrice && product.oldProductPrice > 0 || 
    product?.productDiscount && product.productDiscount > 0
  );
  const [discountType, setDiscountType] = useState<"fixed" | "percentage">(
    product?.productDiscountPercentage && product.productDiscountPercentage > 0 ? "percentage" : "fixed"
  );
  const [discountDates, setDiscountDates] = useState(
    !!(product?.productDiscountStartDate && product?.productDiscountEndDate)
  );
  const [colorInput, setColorInput] = useState("");
  const [sizeInput, setSizeInput] = useState("");
  const [colors, setColors] = useState<string[]>(product?.productColors || []);
  const [sizes, setSizes] = useState<string[]>(product?.productSizes || []);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(
    product?.productImage ? `${apiURL}${product.productImage}` : null
  );
  const [existingImages, setExistingImages] = useState<string[]>(
    product?.productImages || []
  );
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [imagesPreview, setImagesPreview] = useState<string[]>([]);

  // Define Zod schema for form validation
  const productSchema = z.object({
    productName: z.string().min(3, { message: t.admin.minProductNameLength }),
    productDescription: z.string().min(10, { message: t.admin.minProductDescriptionLength }),
    productPrice: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: t.admin.invalidPrice,
    }),
    oldProductPrice: z.string().optional(),
    hasDiscount: z.boolean().default(false),
    productDiscount: z.string().optional(),
    productDiscountPercentage: z.string().optional(),
    productDiscountStartDate: z.string().optional(),
    productDiscountEndDate: z.string().optional(),
    productCategory: z.string().min(1, { message: t.admin.productCategoryRequired }),
    productQuantity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: t.admin.invalidQuantity,
    }),
    productStatus: z.boolean().default(true),
    productColors: z.any().optional(),
    productSizes: z.any().optional(),
    productImage: z.any().optional(),
    productImages: z.array(z.any()),
    productSlug: z.string().optional()
  });

  // Setup form with React Hook Form and Zod
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productName: product?.productName || "",
      productDescription: product?.productDescription || "",
      productPrice: product?.productPrice?.toString() || "",
      oldProductPrice: product?.oldProductPrice?.toString() || "",
      hasDiscount: hasDiscount,
      productDiscount: product?.productDiscount?.toString() || "",
      productDiscountPercentage: product?.productDiscountPercentage?.toString() || "",
      productDiscountStartDate: product?.productDiscountStartDate 
        ? new Date(product.productDiscountStartDate).toISOString().slice(0, 16) 
        : "",
      productDiscountEndDate: product?.productDiscountEndDate 
        ? new Date(product.productDiscountEndDate).toISOString().slice(0, 16) 
        : "",
      productCategory: product?.productCategory?._id || "",
      productQuantity: product?.productQuantity?.toString() || "",
      productStatus: product?.productStatus || true,
      productColors: product?.productColors || [],
      productSizes: product?.productSizes || [],
      productImages: [],
      productSlug: product?.productSlug
    },
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    // وظيفة لتطبيع المصفوفات
    const normalizeArray = (arr: any[]): string[] => {
      if (!arr || !Array.isArray(arr)) return [];
      
      // تحويل كل عنصر إلى سلسلة نصية بسيطة
      return arr.map(item => {
        if (typeof item === 'string') {
          // إزالة علامات الاقتباس والأقواس إذا وجدت
          return item.replace(/^\["|"\]$|^"|"$|\\/g, '');
        }
        return String(item);
      });
    };

    // تطبيق التنسيق الصحيح على الألوان والمقاسات
    const normalizedColors = normalizeArray(product?.productColors || []);
    const normalizedSizes = normalizeArray(product?.productSizes || []);
    
    console.log('Normalized Colors:', normalizedColors);
    console.log('Normalized Sizes:', normalizedSizes);
    
    setColors(normalizedColors);
    setSizes(normalizedSizes);
  }, [product]);

  // Handle adding a new color
  const handleAddColor = () => {
    if (!colorInput.trim()) return;
    
    // التحقق من عدم وجود اللون بالفعل (بغض النظر عن حالة الأحرف)
    const normalizedInput = colorInput.trim();
    const colorExists = colors.some(
      color => color.toLowerCase() === normalizedInput.toLowerCase()
    );
    
    if (!colorExists) {
      const newColors = [...colors, normalizedInput];
      setColors(newColors);
      setColorInput("");
    } else {
      toast.warning(t.admin.colorAlreadyExists);
      setColorInput("");
    }
  };

  // Handle removing a color
  const handleRemoveColor = (index: number) => {
    const newColors = colors.filter((_, i) => i !== index);
    setColors(newColors);
  };

  // Handle adding a new size
  const handleAddSize = () => {
    if (!sizeInput.trim()) return;
    
    // التحقق من عدم وجود المقاس بالفعل (بغض النظر عن حالة الأحرف)
    const normalizedInput = sizeInput.trim();
    const sizeExists = sizes.some(
      size => size.toLowerCase() === normalizedInput.toLowerCase()
    );
    
    if (!sizeExists) {
      const newSizes = [...sizes, normalizedInput];
      setSizes(newSizes);
      setSizeInput("");
    } else {
      toast.warning(t.admin.sizeAlreadyExists);
      setSizeInput("");
    }
  };

  // Handle removing a size
  const handleRemoveSize = (index: number) => {
    const newSizes = sizes.filter((_, i) => i !== index);
    setSizes(newSizes);
  };

  // Handle discount toggle
  const handleDiscountToggle = (checked: boolean) => {
    setHasDiscount(checked);
    form.setValue("hasDiscount", checked);
    
    // Clear discount fields when discount is disabled
    if (!checked) {
      form.setValue("oldProductPrice", "");
      form.setValue("productDiscount", "");
      form.setValue("productDiscountPercentage", "");
      form.setValue("productDiscountStartDate", "");
      form.setValue("productDiscountEndDate", "");
    }
  };

  // Handle main image upload
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      form.setValue("productImage", file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle additional images upload
  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      form.setValue("productImages", files);
      
      const previews = files.map((file) => URL.createObjectURL(file));
      setImagesPreview(previews);
    }
  };

  // Handle removing an existing image
  const handleRemoveImage = (imageUrl: string) => {
    setExistingImages((prev) => prev.filter((img) => img !== imageUrl));
    setDeletedImages((prev) => [...prev, imageUrl]);
  };

  // Form submission handler
  const onSubmit = (data: z.infer<typeof productSchema>) => {
    const formDataToSend = new FormData();
    
    // إضافة البيانات النصية
    formDataToSend.append('productName', data.productName);
    formDataToSend.append('productDescription', data.productDescription);
    formDataToSend.append('productPrice', data.productPrice);
    
    if (data.hasDiscount) {
      if (discountType === "fixed" && data.oldProductPrice) {
        formDataToSend.append('oldProductPrice', data.oldProductPrice);
        // حساب قيمة الخصم الثابت
        if (parseFloat(data.productPrice) > parseFloat(data.oldProductPrice)) {
          const fixedDiscount = parseFloat(data.productPrice) - parseFloat(data.oldProductPrice);
          formDataToSend.append('productDiscount', fixedDiscount.toString());
        }
      } else if (discountType === "percentage") {
        // إرسال النسبة المئوية للخصم
        if (data.productDiscountPercentage) {
          formDataToSend.append('productDiscountPercentage', data.productDiscountPercentage);
        }
        
        // إرسال قيمة الخصم
        if (data.productDiscount) {
          formDataToSend.append('productDiscount', data.productDiscount);
        }
        
        // إرسال تواريخ الخصم
        if (discountDates) {
          if (data.productDiscountStartDate) {
            formDataToSend.append('productDiscountStartDate', data.productDiscountStartDate);
          }
          if (data.productDiscountEndDate) {
            formDataToSend.append('productDiscountEndDate', data.productDiscountEndDate);
          }
        } else {
          // إذا لم يتم تحديد تواريخ، نضع تواريخ افتراضية (من اليوم ولمدة شهر)
          const today = new Date();
          const nextMonth = new Date();
          nextMonth.setMonth(today.getMonth() + 1);
          
          formDataToSend.append('productDiscountStartDate', today.toISOString());
          formDataToSend.append('productDiscountEndDate', nextMonth.toISOString());
        }
      }
    } else {
      // إذا لم يكن هناك خصم، نضع قيم افتراضية
      formDataToSend.append('oldProductPrice', '');
      formDataToSend.append('productDiscount', '0');
      formDataToSend.append('productDiscountPercentage', '0');
      formDataToSend.append('productDiscountStartDate', '');
      formDataToSend.append('productDiscountEndDate', '');
    }
    
    // معالجة الألوان والمقاسات بشكل صحيح
    // تأكد من أن الألوان والمقاسات هي مصفوفات بسيطة من السلاسل النصية
    const processArray = (arr: any[]): string[] => {
      return arr.map(item => {
        if (typeof item === 'string') {
          // إزالة أي تنسيق JSON إضافي
          try {
            const parsed = JSON.parse(item);
            return typeof parsed === 'string' ? parsed : item;
          } catch (e) {
            return item;
          }
        }
        return String(item);
      });
    };
    
    const processedColors = processArray(colors);
    const processedSizes = processArray(sizes);
    
    // إرسال المصفوفات كـ JSON
    formDataToSend.append('productColors', JSON.stringify(processedColors));
    formDataToSend.append('productSizes', JSON.stringify(processedSizes));
    
    formDataToSend.append('productCategory', data.productCategory);
    formDataToSend.append('productQuantity', data.productQuantity);
    formDataToSend.append('productStatus', data.productStatus.toString());
    
    // إضافة الصور المحذوفة
    formDataToSend.append('deletedImages', JSON.stringify(deletedImages));
    
    // إضافة الصور الجديدة
    if (data.productImage instanceof File) {
      formDataToSend.append('productImage', data.productImage);
    }
    
    if (data.productImages.length > 0) {
      data.productImages.forEach((file: File) => {
        formDataToSend.append('productImages', file);
      });
    }
    
    startTransition(async () => {
      try {
        const response = await updateProduct(formDataToSend, product.productSlug);
        toast.success(response.data.message || t.admin.productUpdated);
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
              {/* Product Name */}
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.admin.productName}</FormLabel>
                    <FormControl>
                      <Input placeholder={t.admin.enterProductName} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Product Price */}
              <FormField
                control={form.control}
                name="productPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.admin.productPrice}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder={t.admin.enterProductPrice} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Discount Option */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Checkbox
                  id="hasDiscount"
                  checked={hasDiscount}
                  onCheckedChange={handleDiscountToggle}
                />
                <Label htmlFor="hasDiscount">{t.admin.addDiscount}</Label>
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
                      <Label htmlFor="fixedDiscount">{t.admin.fixedDiscount}</Label>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <input
                        type="radio"
                        id="percentageDiscount"
                        checked={discountType === "percentage"}
                        onChange={() => setDiscountType("percentage")}
                      />
                      <Label htmlFor="percentageDiscount">{t.admin.percentageDiscount}</Label>
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
                            <Input type="number" placeholder={t.admin.enterOldPrice} {...field} />
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
                                <FormLabel>{t.admin.discountStartDate}</FormLabel>
                                <FormControl>
                                  <Input
                                    type="datetime-local"
                                    {...field}
                                  />
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
                                  <Input
                                    type="datetime-local"
                                    {...field}
                                  />
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
            
            {/* Product Description */}
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
              {/* Product Category */}
              <FormField
                control={form.control}
                name="productCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.admin.productCategory}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t.admin.selectCategory} />
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
              
              {/* Product Quantity */}
              <FormField
                control={form.control}
                name="productQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.admin.productQuantity}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder={t.admin.enterProductQuantity} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Product Colors */}
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
                      onClick={() => handleRemoveColor(index)}
                      className="text-red-500 ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Product Sizes */}
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
                      onClick={() => handleRemoveSize(index)}
                      className="text-red-500 ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Main Image */}
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
                    alt={t.admin.mainImagePreview}
                    className="w-32 h-32 object-cover rounded"
                  />
                </div>
              )}
            </div>
            
            {/* Additional Images */}
            <div className="space-y-2">
              <Label>{t.admin.additionalImages}</Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesChange}
              />
              
              {/* New image previews */}
              {imagesPreview.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {imagesPreview.map((preview, index) => (
                    <img
                      key={`new-${index}`}
                      src={preview}
                      alt={`${t.admin.preview} ${index + 1}`}
                      className="w-24 h-24 object-cover rounded"
                    />
                  ))}
                </div>
              )}
              
              {/* Existing images */}
              {existingImages.length > 0 && (
                <div className="mt-4">
                  <Label className="block mb-2">{t.admin.existingImages}</Label>
                  <div className="flex flex-wrap gap-2">
                    {existingImages.map((img, index) => (
                      <div key={`existing-${index}`} className="relative">
                        <Image
                          src={`${apiURL}${img}`}
                          alt={product.productName}
                          width={100}
                          height={100}
                          className="object-cover rounded"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-0 right-0 w-6 h-6 p-0 min-w-0 min-h-0"
                          onClick={() => handleRemoveImage(img)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Product Status */}
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
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                {t.common.cancel}
              </Button>
              <Button
                type="submit"
                className="bg-secondary hover:bg-secondary/90 cursor-pointer"
                disabled={isPending}
              >
                {isPending ? t.admin.sending : t.admin.saveChanges}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
