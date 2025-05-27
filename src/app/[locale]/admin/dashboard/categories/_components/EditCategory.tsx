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
import { fetchCategories } from "@/redux/features/category/categorySlice";
import { useAppDispatch } from "@/redux/hooks";
import Image from "next/image";
import { updateCategory } from "@/server";
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
  locale,
  category,
}: {
  t: any;
  locale: string;
  category: any;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const apiURL = process.env.NEXT_PUBLIC_API_URL;
  
  const [previewImage, setPreviewImage] = useState<string | null>(
    category.image ? `${apiURL}${category.image}` : null
  );
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categorySchema = z.object({
    name: z.string().min(3, { message: t.admin.minCategoryNameLength }),
    description: z.string().min(10, { message: t.admin.minCategoryDescriptionLength }),
    status: z.boolean(),
    image: z.any().optional(),
  });

  type CategoryFormValues = {
    name: string;
    description: string;
    status: boolean;
    image?: File | null;
  };

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category.name,
      description: category.description,
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
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("status", data.status.toString());
      
      if (categoryImage) {
        formData.append("categoryImage", categoryImage);
      }

      await updateCategory(formData, category._id);
      toast.success(t.admin.categoryUpdatedSuccessfully);
      
      // Close dialog and refresh categories
      setOpen(false);
      dispatch(fetchCategories());
    } catch (error: any) {
      toast.error(error.message || t.common.error);
    } finally {
      setIsSubmitting(false);
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
          <DialogDescription>
            {t.admin.updateCategoryDetails}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.admin.categoryName}</FormLabel>
                  <FormControl>
                    <Input placeholder={t.admin.enterCategoryName} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.admin.categoryDescription}</FormLabel>
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
              render={({ field }) => (
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
                          const input = document.querySelector<HTMLInputElement>('input[type="file"]');
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
