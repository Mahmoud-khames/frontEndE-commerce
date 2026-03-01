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
import { useUpdateCategory } from "@/hooks/useCategories";
// Removed Redux & server imports
import Image from "next/image";
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
import { Edit, Loader2, Upload } from "lucide-react";

export default function EditCategory({
  t,
  category,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  category: any;
}) {
  // const router = useRouter(); // Removed unused router
  const updateCategoryMutation = useUpdateCategory();
  const [open, setOpen] = useState(false);

  const [previewImage, setPreviewImage] = useState<string | null>(
    category.image ? `${category.image}` : null
  );
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const isSubmitting = updateCategoryMutation.isPending;

  const categorySchema = z.object({
    nameEn: z.string().min(3, { message: t.admin.minCategoryNameLength }),
    nameAr: z.string().min(3, { message: t.admin.minCategoryNameLength }),
    descriptionEn: z
      .string()
      .min(10, { message: t.admin.minCategoryDescriptionLength }),
    descriptionAr: z
      .string()
      .min(10, { message: t.admin.minCategoryDescriptionLength }),
    status: z.boolean(),
    image: z.any().optional(),
  });

  type CategoryFormValues = z.infer<typeof categorySchema>;

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      nameEn: category.nameEn || "",
      nameAr: category.nameAr || "",
      descriptionEn: category.descriptionEn || category.description || "",
      descriptionAr: category.descriptionAr || category.description || "",
      status: category.status,
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
    try {
      const formData = new FormData();
      formData.append("nameEn", data.nameEn);
      formData.append("nameAr", data.nameAr);
      formData.append("descriptionEn", data.descriptionEn);
      formData.append("descriptionAr", data.descriptionAr);
      formData.append("status", data.status.toString());

      if (categoryImage) {
        formData.append("categoryImage", categoryImage);
      }

      await updateCategoryMutation.mutateAsync({
        id: category._id,
        formData: formData,
      });

      // useUpdateCategory handles success toast and invalidation logic

      // Close dialog and refresh categories
      setOpen(false);
      // router.refresh(); // Optional
    } catch {
      // Error handled generally or add toast here if mutation doesn't
      toast.error(t.common.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.admin.editCategory}</DialogTitle>
          <DialogDescription>{t.admin.updateCategoryDetails}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="nameEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.admin.categoryNameEn}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t.admin.enterCategoryNameEn}
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
                  <FormLabel>{t.admin.categoryNameAr}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t.admin.enterCategoryNameAr}
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
                  <FormLabel>{t.admin.categoryDescription} (EN)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t.admin.enterCategoryDescription}
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
                  <FormLabel>{t.admin.categoryDescription} (AR)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t.admin.enterCategoryDescription}
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
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>{t.admin.categoryStatus}</FormLabel>
                  <FormDescription>
                    {t.admin.categoryStatusDescription}
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={() => (
                <FormItem>
                  <FormLabel>{t.admin.categoryImage}</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-4">
                      {previewImage ? (
                        <div className="w-24 h-24">
                          <Image
                            src={previewImage!}
                            alt={t.admin.categoryImage}
                            width={96}
                            height={96}
                            className="object-cover rounded"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center">
                          <Upload className="h-6 w-6" />
                        </div>
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="!hidden"
                      />
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => {
                          const input =
                            document.querySelector<HTMLInputElement>(
                              'input[type="file"]'
                            );
                          input?.click();
                        }}
                      >
                        {t.admin.uploadImage}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t.common.save
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
