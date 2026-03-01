// app/[locale]/admin/customize/_components/CustomizeManager.tsx
"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { useAllSlides, useCustomize } from "@/hooks/useCustomize";
import type { Customize, SliderType, SliderSettings } from "@/types";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Icons
import {
  Loader2,
  Plus,
  Trash2,
  Upload,
  Edit,
  PlusCircle,
  Copy,
  Power,
  GripVertical,
  Eye,
  EyeOff,
  Calendar,
  Settings,
  Image as ImageIcon,
  X,
} from "lucide-react";

// ==================== Types ====================
interface CustomizeManagerProps {
  t: Record<string, any>;
  locale: string;
}

interface FormState {
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  buttonTextEn: string;
  buttonTextAr: string;
  buttonLink: string;
  displayOrder: number;
  isActive: boolean;
  type: SliderType;
  startDate: string;
  endDate: string;
  settings: SliderSettings;
}

const defaultSettings: SliderSettings = {
  autoPlay: true,
  autoPlaySpeed: 3000,
  showArrows: true,
  showDots: true,
  loop: true,
};

const defaultFormState: FormState = {
  titleEn: "",
  titleAr: "",
  descriptionEn: "",
  descriptionAr: "",
  buttonTextEn: "Shop Now",
  buttonTextAr: "تسوق الآن",
  buttonLink: "",
  displayOrder: 0,
  isActive: true,
  type: "hero",
  startDate: "",
  endDate: "",
  settings: defaultSettings,
};

// ==================== Helper Functions ====================
const formatDateForInput = (date?: string | null): string => {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 16);
};

const createFormData = (
  form: FormState,
  files: File[],
  deleteImages?: string[]
): FormData => {
  const formData = new FormData();

  // Basic fields
  formData.append("titleEn", form.titleEn);
  formData.append("titleAr", form.titleAr);
  formData.append("descriptionEn", form.descriptionEn);
  formData.append("descriptionAr", form.descriptionAr);
  formData.append("buttonTextEn", form.buttonTextEn);
  formData.append("buttonTextAr", form.buttonTextAr);
  formData.append("buttonLink", form.buttonLink);
  formData.append("displayOrder", form.displayOrder.toString());
  formData.append("isActive", form.isActive.toString());
  formData.append("type", form.type);

  // Dates
  formData.append("startDate", form.startDate || "");
  formData.append("endDate", form.endDate || "");

  // Settings
  formData.append("settings[autoPlay]", form.settings.autoPlay.toString());
  formData.append(
    "settings[autoPlaySpeed]",
    form.settings.autoPlaySpeed.toString()
  );
  formData.append("settings[showArrows]", form.settings.showArrows.toString());
  formData.append("settings[showDots]", form.settings.showDots.toString());
  formData.append("settings[loop]", form.settings.loop.toString());

  // Files
  files.forEach((file) => {
    formData.append("slideImages", file);
  });

  // Delete images
  if (deleteImages && deleteImages.length > 0) {
    formData.append("deleteImages", JSON.stringify(deleteImages));
  }

  return formData;
};

// ==================== Main Component ====================
export function CustomizeManager({ t, locale }: CustomizeManagerProps) {
  // State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Customize | null>(null);
  const [slideToDelete, setSlideToDelete] = useState<Customize | null>(null);
  const [form, setForm] = useState<FormState>(defaultFormState);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Queries & Mutations
  const {
    data,
    isLoading: isLoadingSlides,
    error,
  } = useAllSlides({
    includeInactive: true,
  });

  const {
    createSlide,
    updateSlide,
    deleteSlide,
    addImage,
    deleteImage,
    toggleStatus,
    duplicateSlide,
    isLoading: isMutating,
  } = useCustomize();

  const slides = data?.slides || [];

  // ==================== Handlers ====================

  const resetForm = useCallback(() => {
    setForm(defaultFormState);
    setEditingSlide(null);
    setSelectedFiles([]);
    setPreviews([]);
  }, []);

  const handleOpenDialog = useCallback(
    (slide?: Customize) => {
      if (slide) {
        setEditingSlide(slide);
        setForm({
          titleEn: slide.titleEn || "",
          titleAr: slide.titleAr || "",
          descriptionEn: slide.descriptionEn || "",
          descriptionAr: slide.descriptionAr || "",
          buttonTextEn: slide.buttonTextEn || "Shop Now",
          buttonTextAr: slide.buttonTextAr || "تسوق الآن",
          buttonLink: slide.buttonLink || "",
          displayOrder: slide.displayOrder || 0,
          isActive: slide.isActive ?? true,
          type: slide.type || "hero",
          startDate: formatDateForInput(slide.startDate),
          endDate: formatDateForInput(slide.endDate),
          settings: slide.settings || defaultSettings,
        });
      } else {
        resetForm();
      }
      setDialogOpen(true);
    },
    [resetForm]
  );

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    resetForm();
  }, [resetForm]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      setSelectedFiles((prev) => [...prev, ...files]);

      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);

      e.target.value = "";
    },
    []
  );

  const handleRemovePreview = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.titleEn.trim() || !form.titleAr.trim()) {
      return;
    }

    const formData = createFormData(form, selectedFiles);

    try {
      if (editingSlide) {
        await updateSlide.mutateAsync({ id: editingSlide._id, formData });
      } else {
        await createSlide.mutateAsync(formData);
      }
      handleCloseDialog();
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleDelete = async () => {
    if (!slideToDelete) return;

    try {
      await deleteSlide.mutateAsync(slideToDelete._id);
      setDeleteDialogOpen(false);
      setSlideToDelete(null);
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleAddImageToSlide = async (
    slideId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("slideImage", file);
    formData.append("id", slideId);

    try {
      await addImage.mutateAsync(formData);
    } catch (error) {
      // Error handled in mutation
    }

    e.target.value = "";
  };

  const handleDeleteImageFromSlide = async (
    slideId: string,
    imageIndex: number
  ) => {
    try {
      await deleteImage.mutateAsync({ id: slideId, imageIndex });
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleToggleStatus = async (slideId: string) => {
    try {
      await toggleStatus.mutateAsync(slideId);
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleDuplicate = async (slideId: string) => {
    try {
      await duplicateSlide.mutateAsync(slideId);
    } catch (error) {
      // Error handled in mutation
    }
  };

  const updateFormField = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateSettings = <K extends keyof SliderSettings>(
    field: K,
    value: SliderSettings[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      settings: { ...prev.settings, [field]: value },
    }));
  };

  // ==================== Render ====================

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-red-500">
            {locale === "ar"
              ? "حدث خطأ في تحميل البيانات"
              : "Error loading data"}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            {locale === "ar" ? "إعادة المحاولة" : "Retry"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {t.admin?.customizeSettings || "Hero Slides Manager"}
          </h1>
          <p className="text-muted-foreground">
            {locale === "ar"
              ? "إدارة سلايدات الصفحة الرئيسية"
              : "Manage homepage hero slides"}
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={() => handleOpenDialog()}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              {locale === "ar" ? "إنشاء سلايد جديد" : "Create New Slide"}
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSlide
                  ? locale === "ar"
                    ? "تعديل السلايد"
                    : "Edit Slide"
                  : locale === "ar"
                  ? "إنشاء سلايد جديد"
                  : "Create New Slide"}
              </DialogTitle>
              <DialogDescription>
                {editingSlide
                  ? locale === "ar"
                    ? "قم بتعديل بيانات السلايد"
                    : "Update slide information"
                  : locale === "ar"
                  ? "أنشئ سلايد جديد للصفحة الرئيسية"
                  : "Create a new hero slide for homepage"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Titles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="titleEn">
                    {locale === "ar" ? "العنوان (إنجليزي) *" : "Title (EN) *"}
                  </Label>
                  <Input
                    id="titleEn"
                    value={form.titleEn}
                    onChange={(e) => updateFormField("titleEn", e.target.value)}
                    placeholder="Welcome to Our Store"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titleAr">
                    {locale === "ar" ? "العنوان (عربي) *" : "Title (AR) *"}
                  </Label>
                  <Input
                    id="titleAr"
                    value={form.titleAr}
                    onChange={(e) => updateFormField("titleAr", e.target.value)}
                    placeholder="مرحباً بك في متجرنا"
                    required
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="descriptionEn">
                    {locale === "ar" ? "الوصف (إنجليزي)" : "Description (EN)"}
                  </Label>
                  <Textarea
                    id="descriptionEn"
                    value={form.descriptionEn}
                    onChange={(e) =>
                      updateFormField("descriptionEn", e.target.value)
                    }
                    placeholder="Discover amazing products..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descriptionAr">
                    {locale === "ar" ? "الوصف (عربي)" : "Description (AR)"}
                  </Label>
                  <Textarea
                    id="descriptionAr"
                    value={form.descriptionAr}
                    onChange={(e) =>
                      updateFormField("descriptionAr", e.target.value)
                    }
                    placeholder="اكتشف منتجات رائعة..."
                    rows={3}
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Button Text */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buttonTextEn">
                    {locale === "ar" ? "نص الزر (إنجليزي)" : "Button Text (EN)"}
                  </Label>
                  <Input
                    id="buttonTextEn"
                    value={form.buttonTextEn}
                    onChange={(e) =>
                      updateFormField("buttonTextEn", e.target.value)
                    }
                    placeholder="Shop Now"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buttonTextAr">
                    {locale === "ar" ? "نص الزر (عربي)" : "Button Text (AR)"}
                  </Label>
                  <Input
                    id="buttonTextAr"
                    value={form.buttonTextAr}
                    onChange={(e) =>
                      updateFormField("buttonTextAr", e.target.value)
                    }
                    placeholder="تسوق الآن"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Button Link */}
              <div className="space-y-2">
                <Label htmlFor="buttonLink">
                  {locale === "ar" ? "رابط الزر" : "Button Link"}
                </Label>
                <Input
                  id="buttonLink"
                  value={form.buttonLink}
                  onChange={(e) =>
                    updateFormField("buttonLink", e.target.value)
                  }
                  placeholder="/products"
                />
              </div>

              {/* Type & Order */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{locale === "ar" ? "النوع" : "Type"}</Label>
                  <Select
                    value={form.type}
                    onValueChange={(value: SliderType) =>
                      updateFormField("type", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hero">Hero</SelectItem>
                      <SelectItem value="banner">Banner</SelectItem>
                      <SelectItem value="promotional">Promotional</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayOrder">
                    {locale === "ar" ? "ترتيب العرض" : "Display Order"}
                  </Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) =>
                      updateFormField(
                        "displayOrder",
                        parseInt(e.target.value) || 0
                      )
                    }
                    min="0"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">
                    <Calendar className="inline-block w-4 h-4 mr-1" />
                    {locale === "ar" ? "تاريخ البداية" : "Start Date"}
                  </Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={form.startDate}
                    onChange={(e) =>
                      updateFormField("startDate", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">
                    <Calendar className="inline-block w-4 h-4 mr-1" />
                    {locale === "ar" ? "تاريخ النهاية" : "End Date"}
                  </Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={form.endDate}
                    onChange={(e) => updateFormField("endDate", e.target.value)}
                  />
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4 border rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <h3 className="font-semibold">
                    {locale === "ar" ? "إعدادات السلايدر" : "Slider Settings"}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoPlay">
                      {locale === "ar" ? "تشغيل تلقائي" : "Auto Play"}
                    </Label>
                    <Switch
                      id="autoPlay"
                      checked={form.settings.autoPlay}
                      onCheckedChange={(checked) =>
                        updateSettings("autoPlay", checked)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="autoPlaySpeed">
                      {locale === "ar"
                        ? "سرعة التشغيل (مللي ثانية)"
                        : "Speed (ms)"}
                    </Label>
                    <Input
                      id="autoPlaySpeed"
                      type="number"
                      value={form.settings.autoPlaySpeed}
                      onChange={(e) =>
                        updateSettings(
                          "autoPlaySpeed",
                          parseInt(e.target.value) || 3000
                        )
                      }
                      min="1000"
                      step="500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showArrows">
                      {locale === "ar" ? "إظهار الأسهم" : "Show Arrows"}
                    </Label>
                    <Switch
                      id="showArrows"
                      checked={form.settings.showArrows}
                      onCheckedChange={(checked) =>
                        updateSettings("showArrows", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showDots">
                      {locale === "ar" ? "إظهار النقاط" : "Show Dots"}
                    </Label>
                    <Switch
                      id="showDots"
                      checked={form.settings.showDots}
                      onCheckedChange={(checked) =>
                        updateSettings("showDots", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="loop">
                      {locale === "ar" ? "تكرار" : "Loop"}
                    </Label>
                    <Switch
                      id="loop"
                      checked={form.settings.loop}
                      onCheckedChange={(checked) =>
                        updateSettings("loop", checked)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between border rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Power className="w-4 h-4" />
                  <Label htmlFor="isActive">
                    {locale === "ar" ? "حالة التفعيل" : "Active Status"}
                  </Label>
                </div>
                <Switch
                  id="isActive"
                  checked={form.isActive}
                  onCheckedChange={(checked) =>
                    updateFormField("isActive", checked)
                  }
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-4 border rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  <Label className="font-semibold">
                    {locale === "ar" ? "صور السلايد" : "Slide Images"}
                  </Label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Existing images (when editing) */}
                  {editingSlide?.slideImages?.map((img, idx) => (
                    <div
                      key={`existing-${idx}`}
                      className="relative aspect-video border rounded-lg overflow-hidden group"
                    >
                      <Image
                        src={img.url}
                        alt={img.altEn || `Slide ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs">#{idx + 1}</span>
                      </div>
                    </div>
                  ))}

                  {/* New image previews */}
                  {previews.map((url, idx) => (
                    <div
                      key={`preview-${idx}`}
                      className="relative aspect-video border rounded-lg overflow-hidden"
                    >
                      <Image
                        src={url}
                        alt={`Preview ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        onClick={() => handleRemovePreview(idx)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {/* Add image button */}
                  <label className="aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">
                      {locale === "ar" ? "إضافة صورة" : "Add Image"}
                    </span>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileSelect}
                    />
                  </label>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  disabled={isMutating}
                >
                  {locale === "ar" ? "إلغاء" : "Cancel"}
                </Button>
                <Button type="submit" disabled={isMutating}>
                  {isMutating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {locale === "ar" ? "جاري الحفظ..." : "Saving..."}
                    </>
                  ) : editingSlide ? (
                    locale === "ar" ? (
                      "تحديث"
                    ) : (
                      "Update"
                    )
                  ) : locale === "ar" ? (
                    "إنشاء"
                  ) : (
                    "Create"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Loading State */}
      {isLoadingSlides ? (
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((j) => (
                    <Skeleton key={j} className="aspect-video rounded-lg" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : slides.length === 0 ? (
        /* Empty State */
        <Card>
          <CardContent className="py-12 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {locale === "ar" ? "لا توجد سلايدات" : "No Slides Found"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {locale === "ar"
                ? "ابدأ بإنشاء أول سلايد للصفحة الرئيسية"
                : "Get started by creating your first hero slide"}
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {locale === "ar" ? "إنشاء سلايد" : "Create Slide"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Slides List */
        <div className="grid gap-6">
          {slides.map((slide) => (
            <Card key={slide._id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    <div>
                      <CardTitle className="text-lg">
                        {locale === "ar" ? slide.titleAr : slide.titleEn}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{slide.type}</Badge>
                        <span>•</span>
                        <span>
                          {locale === "ar" ? "الترتيب:" : "Order:"}{" "}
                          {slide.displayOrder}
                        </span>
                        <span>•</span>
                        <span>
                          {slide.slideImages?.length || 0}{" "}
                          {locale === "ar" ? "صور" : "images"}
                        </span>
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(slide)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      {locale === "ar" ? "تعديل" : "Edit"}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicate(slide._id)}
                      disabled={isMutating}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      {locale === "ar" ? "نسخ" : "Copy"}
                    </Button>

                    <Button
                      variant={slide.isActive ? "outline" : "secondary"}
                      size="sm"
                      onClick={() => handleToggleStatus(slide._id)}
                      disabled={isMutating}
                    >
                      {slide.isActive ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-1" />
                          {locale === "ar" ? "إخفاء" : "Hide"}
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          {locale === "ar" ? "إظهار" : "Show"}
                        </>
                      )}
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSlideToDelete(slide);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      {locale === "ar" ? "حذف" : "Delete"}
                    </Button>

                    <Badge
                      variant={slide.isActive ? "default" : "secondary"}
                      className={
                        slide.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {slide.isActive
                        ? locale === "ar"
                          ? "نشط"
                          : "Active"
                        : locale === "ar"
                        ? "غير نشط"
                        : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {slide.slideImages?.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-video border rounded-lg overflow-hidden group"
                    >
                      <Image
                        src={image.url}
                        alt={
                          locale === "ar"
                            ? image.altAr || `صورة ${index + 1}`
                            : image.altEn || `Image ${index + 1}`
                        }
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleDeleteImageFromSlide(slide._id, index)
                          }
                          disabled={isMutating}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-center py-1 text-xs">
                        #{index + 1}
                      </div>
                    </div>
                  ))}

                  {/* Add image to existing slide */}
                  <label className="aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">
                      {locale === "ar" ? "إضافة صورة" : "Add Image"}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleAddImageToSlide(slide._id, e)}
                      disabled={isMutating}
                    />
                  </label>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {locale === "ar" ? "تأكيد الحذف" : "Confirm Delete"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {locale === "ar"
                ? `هل أنت متأكد من حذف "${slideToDelete?.titleAr}"؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Are you sure you want to delete "${slideToDelete?.titleEn}"? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isMutating}>
              {locale === "ar" ? "إلغاء" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isMutating}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isMutating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {locale === "ar" ? "جاري الحذف..." : "Deleting..."}
                </>
              ) : locale === "ar" ? (
                "حذف"
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default CustomizeManager;
