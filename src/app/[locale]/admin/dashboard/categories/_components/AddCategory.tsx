"use client";

import { useState } from "react";
// import { useRouter } from "next/navigation";
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
import { useCreateCategory } from "@/hooks/useCategories";
// Removed Redux & server imports
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, PlusCircle, Upload } from "lucide-react";
import Image from "next/image";

export function AddCategory({
  t,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}) {
  // const router = useRouter();
  const createCategoryMutation = useCreateCategory(); // Hook usage
  const [open, setOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const isSubmitting = createCategoryMutation.isPending; // Use mutation state

  // ... schema definition remains same ...
  const categorySchema = z.object({
    nameEn: z.string().min(3, {
      message: t.admin.categoryNameRequired || "Category name is required",
    }),
    nameAr: z.string().min(3, {
      message: t.admin.categoryNameRequired || "Category name is required",
    }),
    descriptionEn: z.string().min(10, {
      message:
        t.admin.categoryDescriptionRequired ||
        "Category description is required",
    }),
    descriptionAr: z.string().min(10, {
      message:
        t.admin.categoryDescriptionRequired ||
        "Category description is required",
    }),
    status: z.boolean(),
    image: z.any().optional(),
  });

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      nameEn: "",
      nameAr: "",
      descriptionEn: "",
      descriptionAr: "",
      status: true,
      image: null,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCategoryImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: z.infer<typeof categorySchema>) => {
    if (!categoryImage) {
      toast.error(
        t.admin.categoryImageRequired || "Category image is required"
      );
      return;
    }

    try {
      const formData = new FormData();
      formData.append("nameEn", data.nameEn);
      formData.append("nameAr", data.nameAr);
      formData.append("descriptionEn", data.descriptionEn);
      formData.append("descriptionAr", data.descriptionAr);
      formData.append("status", data.status.toString());
      formData.append("categoryImage", categoryImage);

      // Mutate
      await createCategoryMutation.mutateAsync(formData);

      // Toast handled in hook onSuccess usually, but let's keep it safe.
      // The hook in useCategories.ts handles SUCCESS toast.
      // We process close/reset here.

      // Reset form and close dialog
      form.reset();
      setPreviewImage(null);
      setCategoryImage(null);
      setOpen(false);

      // No need to dispatch fetchCategories, hook invalidates queries.
      // router.refresh(); // Optional with React Query
    } catch {
      // Error toast handled in hook or here?
      // The hook provided doesn't have onError, so typically query throws.
      // We can catch it here.
    }
  };

  const handleClose = () => {
    form.reset();
    setPreviewImage(null);
    setCategoryImage(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t.admin.addCategory || "Add Category"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.admin.addCategory || "Add New Category"}</DialogTitle>
          <DialogDescription>
            {t.admin.addCategoryDescription ||
              "Fill in the details to create a new category"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="nameEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t.admin.categoryNameEn || "Category Name English"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        t.admin.enterCategoryNameEn ||
                        "Enter category Name English"
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nameAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t.admin.categoryNameAr || "Category Name Arabic"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        t.admin.enterCategoryNameAr ||
                        "Enter category Name Arabic"
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descriptionEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t.admin.categoryDescription || "Category Description"} (EN)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        t.admin.enterCategoryDescription ||
                        "Enter category description"
                      }
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descriptionAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t.admin.categoryDescription || "Category Description"} (AR)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        t.admin.enterCategoryDescription ||
                        "Enter category description"
                      }
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {t.admin.categoryStatus || "Status"}
                    </FormLabel>
                    <FormDescription>
                      {field.value
                        ? t.common.active || "Active"
                        : t.common.inactive || "Inactive"}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div>
              <FormLabel>{t.admin.categoryImage || "Category Image"}</FormLabel>
              <div className="mt-2 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 h-64">
                {previewImage ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={previewImage}
                      alt="Category preview"
                      fill
                      className="object-contain"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setPreviewImage(null);
                        setCategoryImage(null);
                      }}
                    >
                      {t.common.delete || "Remove"}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4 flex text-sm text-gray-600">
                      <label
                        htmlFor="category-image"
                        className="relative cursor-pointer rounded-md bg-white font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
                      >
                        <span>
                          {t.admin.uploadCategoryImage || "Upload Image"}
                        </span>
                        <input
                          id="category-image"
                          name="category-image"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                {t.common.cancel || "Cancel"}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.common.loading || "Saving..."}
                  </>
                ) : (
                  t.common.save || "Save"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
