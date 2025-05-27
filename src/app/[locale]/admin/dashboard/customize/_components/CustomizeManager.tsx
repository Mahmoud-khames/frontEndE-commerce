/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash, Upload } from "lucide-react";
import Image from "next/image";
import {
  deleteSlideImage,
  getCustomizeImages,
  updateCustomize,
  uploadSlideImage,
} from "@/server";

export function CustomizeManager({ t, locale }: { t: any; locale: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [images, setImages] = useState<any[]>([]);
  const [customize, setCustomize] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [firstShow, setFirstShow] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const apiURL = process.env.NEXT_PUBLIC_API_URL || "";





  useEffect(() => {
    fetchImages();
  }, []);


  const fetchImages = async () => {
    setIsLoading(true);
    try {
      console.log(
        "Fetching images from:",
        `${process.env.NEXT_PUBLIC_API_URL}/customize`
      );
      const response = await getCustomizeImages();
      console.log("API Response:", response.data);
      if (response.data.success) {
        if (response.data.images.length > 0) {
          const firstCustomize = response.data.images[0];
          setImages(firstCustomize.slideImage || []);
          setCustomize(firstCustomize);
          setTitle(firstCustomize.title || "");
          setDescription(firstCustomize.description || "");
          setIsActive(firstCustomize.isActive !== false);
          setFirstShow(firstCustomize.firstShow || 0);
        } else {
          setImages([]);
          setCustomize(null);
          setTitle("");
          setDescription("");
          setIsActive(true);
          setFirstShow(0);
        }
      } else {
        console.error("API returned success: false", response.data);
        toast.error(response.data.message || "Failed to fetch images");
      }
    } catch (error: any) {
      console.error("Error fetching images:", error);
      if (error.message === "Network Error") {
        toast.error(
          "Cannot connect to server. Please check if the backend is running."
        );
      } else {
        toast.error(
          error.response?.data?.message ||
            t.common?.error ||
            "An error occurred"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // تحميل صورة جديدة
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("slideImage", file);

    setIsLoading(true);
    try {
      console.log("Uploading image:", file.name, file.type, file.size);
      const response = await uploadSlideImage(formData);
      console.log("Upload response:", response.data);
      if (response.data.success) {
        toast.success(
          response.data.message ||
            t.admin?.imageUploadedSuccessfully ||
            "Image uploaded successfully"
        );
        fetchImages(); // تحديث القائمة
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(
        error.response?.data?.message || t.common?.error || "An error occurred"
      );
    } finally {
      setIsLoading(false);
      // إعادة تعيين حقل الإدخال
      e.target.value = "";
    }
  };

  // حذف صورة
  const handleDeleteImage = async (imageIndex: number) => {
    if (!customize || !customize._id) return;

    setIsLoading(true);
    try {
      const response = await deleteSlideImage({
        id: customize._id,
        imageIndex,
      });

      if (response.data.success) {
        toast.success(
          response.data.message ||
            t.admin.imageDeletedSuccessfully ||
            "Image deleted successfully"
        );
        fetchImages(); // تحديث القائمة
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || t.common.error || "An error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // تحديث معلومات التخصيص
  const handleUpdateCustomize = async () => {
    if (!customize || !customize._id) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("isActive", isActive.toString());
      formData.append("firstShow", firstShow.toString());

      const response = await updateCustomize(formData, customize._id);

      if (response.data.success) {
        toast.success(
          response.data.message ||
            t.admin.customizeUpdatedSuccessfully ||
            "Customize updated successfully"
        );
        fetchImages(); // تحديث البيانات
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || t.common.error || "An error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {t.admin.customizeSettings || "Customize Settings"}
          </CardTitle>
          <CardDescription>
            {t.admin.customizeSettingsDescription ||
              "Manage your website's appearance and slider images"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t.admin.title || "Title"}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.admin.enterTitle || "Enter title"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              {t.admin.description || "Description"}
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.admin.enterDescription || "Enter description"}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstShow">
              {t.admin.firstShowIndex || "First Show Index"}
            </Label>
            <Input
              id="firstShow"
              type="number"
              min="0"
              value={firstShow}
              onChange={(e) => setFirstShow(parseInt(e.target.value) || 0)}
            />
            <p className="text-sm text-gray-500">
              {t.admin.firstShowDescription ||
                "Index of the image to show first in the slider (0-based)"}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="isActive">
              {isActive
                ? t.common.active || "Active"
                : t.common.inactive || "Inactive"}
            </Label>
          </div>

          <div className="space-y-2">
            <Label>{t.admin.sliderImages || "Slider Images"}</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.length > 0 ? (
                images.map((image, index) => (
                  <div
                    key={index}
                    className="relative border rounded-md overflow-hidden h-48"
                  >
                    <Image
                      src={`${apiURL}${image}`}
                      alt={`Slide ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => handleDeleteImage(index)}
                      disabled={isLoading}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                    {index === firstShow && (
                      <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-center py-1 text-xs">
                        {t.admin?.firstImage || "First Image"}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 border rounded-md">
                  {t.admin?.noImagesFound ||
                    "No images found. Upload some images to get started."}
                </div>
              )}

              {/* Upload new image */}
              <div className="border border-dashed rounded-md flex flex-col items-center justify-center h-48 p-4">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-2">
                  {t.admin?.uploadNewImage || "Upload New Image"}
                </p>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isLoading}
                    id="image-upload"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    onClick={() =>
                      document.getElementById("image-upload")?.click()
                    }
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t.common?.loading || "Loading..."}
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        {t.admin?.browse || "Browse"}
                      </>
                    )}
                  </Button>
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  {t.admin?.imageRequirements || "PNG, JPG, GIF up to 5MB"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleUpdateCustomize}
            disabled={isLoading}
            className="ml-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t.common.saving || "Saving..."}
              </>
            ) : (
              t.common.saveChanges || "Save Changes"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
