"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addDays, format, startOfDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  Pencil,
  Trash2,
  PlusCircle,
  Copy,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Tag,
  Percent,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  History,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useAllCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
  useToggleCouponStatus,
  useDuplicateCoupon,
  useCouponStats,
} from "@/hooks/useCoupons";
import type { Coupon, CreateCouponPayload } from "@/types";

interface CouponItemsProps {
  t: any;
  locale: string;
}

type DiscountType = "percentage" | "fixed";
type CouponType = "public" | "private" | "first_order" | "birthday";

interface CouponFormData {
  code: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  discountType: DiscountType;
  discountValue: string;
  minPurchaseAmount: string;
  maxDiscountAmount: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  isActive: boolean;
  usageLimit: string;
  usageLimitPerUser: string;
  type: CouponType;
  applyToShipping: boolean;
  stackable: boolean;
}

const initialFormData: CouponFormData = {
  code: "",
  nameEn: "",
  nameAr: "",
  descriptionEn: "",
  descriptionAr: "",
  discountType: "percentage",
  discountValue: "",
  minPurchaseAmount: "0",
  maxDiscountAmount: "",
  startDate: new Date(),
  endDate: undefined,
  isActive: true,
  usageLimit: "",
  usageLimitPerUser: "1",
  type: "public",
  applyToShipping: false,
  stackable: false,
};

export default function CouponItems({ t, locale }: CouponItemsProps) {
  const isArabic = locale === "ar";

  // Queries
  const { data: couponsData, isLoading, refetch } = useAllCoupons();
  const { data: statsData } = useCouponStats();

  // Mutations
  const createCouponMutation = useCreateCoupon();
  const updateCouponMutation = useUpdateCoupon();
  const deleteCouponMutation = useDeleteCoupon();
  const toggleStatusMutation = useToggleCouponStatus();
  const duplicateMutation = useDuplicateCoupon();

  // State
  const [formData, setFormData] = useState<CouponFormData>(initialFormData);
  const [editMode, setEditMode] = useState(false);
  const [currentCouponId, setCurrentCouponId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const coupons = couponsData?.coupons || [];
  const stats = statsData?.stats;

  // Form Handlers
  const updateFormField = useCallback(
    <K extends keyof CouponFormData>(field: K, value: CouponFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error when field is updated
      if (formErrors[field]) {
        setFormErrors((prev) => ({ ...prev, [field]: "" }));
      }
    },
    [formErrors]
  );

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.code.trim()) {
      errors.code = isArabic ? "رمز الكوبون مطلوب" : "Coupon code is required";
    }
    if (!formData.nameEn.trim()) {
      errors.nameEn = isArabic
        ? "الاسم بالإنجليزية مطلوب"
        : "English name is required";
    }
    if (!formData.nameAr.trim()) {
      errors.nameAr = isArabic
        ? "الاسم بالعربية مطلوب"
        : "Arabic name is required";
    }
    if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
      errors.discountValue = isArabic
        ? "قيمة الخصم مطلوبة"
        : "Discount value is required";
    }
    if (
      formData.discountType === "percentage" &&
      parseFloat(formData.discountValue) > 100
    ) {
      errors.discountValue = isArabic
        ? "النسبة لا يمكن أن تتجاوز 100%"
        : "Percentage cannot exceed 100%";
    }
    if (!formData.startDate) {
      errors.startDate = isArabic
        ? "تاريخ البداية مطلوب"
        : "Start date is required";
    }
    if (!formData.endDate) {
      errors.endDate = isArabic
        ? "تاريخ الانتهاء مطلوب"
        : "End date is required";
    }
    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate >= formData.endDate
    ) {
      errors.endDate = isArabic
        ? "تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية"
        : "End date must be after start date";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setEditMode(false);
    setCurrentCouponId(null);
    setFormErrors({});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(isArabic ? "يرجى تصحيح الأخطاء" : "Please fix the errors");
      return;
    }

    const payload: CreateCouponPayload = {
      code: formData.code.toUpperCase().trim(),
      nameEn: formData.nameEn.trim(),
      nameAr: formData.nameAr.trim(),
      descriptionEn: formData.descriptionEn.trim(),
      descriptionAr: formData.descriptionAr.trim(),
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue),
      minPurchaseAmount: parseFloat(formData.minPurchaseAmount) || 0,
      maxDiscountAmount: formData.maxDiscountAmount
        ? parseFloat(formData.maxDiscountAmount)
        : undefined,
      startDate: formData.startDate!.toISOString(),
      endDate: formData.endDate!.toISOString(),
      isActive: formData.isActive,
      usageLimit: formData.usageLimit
        ? parseInt(formData.usageLimit)
        : undefined,
      usageLimitPerUser: parseInt(formData.usageLimitPerUser) || 1,
      type: formData.type,
      applyToShipping: formData.applyToShipping,
      stackable: formData.stackable,
    };

    console.log("Submitting coupon payload:", payload);

    try {
      if (editMode && currentCouponId) {
        await updateCouponMutation.mutateAsync({
          id: currentCouponId,
          data: payload,
        });
      } else {
        await createCouponMutation.mutateAsync(payload);
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setFormData({
      code: coupon.code || "",
      nameEn: coupon.nameEn || "",
      nameAr: coupon.nameAr || "",
      descriptionEn: coupon.descriptionEn || "",
      descriptionAr: coupon.descriptionAr || "",
      discountType: coupon.discountType || "percentage",
      discountValue: (coupon.discountValue || 0).toString(),
      minPurchaseAmount: (coupon.minPurchaseAmount || 0).toString(),
      maxDiscountAmount: coupon.maxDiscountAmount?.toString() || "",
      startDate: coupon.startDate ? new Date(coupon.startDate) : new Date(),
      endDate: coupon.endDate ? new Date(coupon.endDate) : undefined,
      isActive: coupon.isActive ?? true,
      usageLimit: coupon.usageLimit?.toString() || "",
      usageLimitPerUser: (coupon.usageLimitPerUser || 1).toString(),
      type: (coupon.type as CouponType) || "public",
      applyToShipping: coupon.applyToShipping || false,
      stackable: coupon.stackable || false,
    });
    setCurrentCouponId(coupon._id);
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setCouponToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (couponToDelete) {
      await deleteCouponMutation.mutateAsync(couponToDelete);
      setDeleteDialogOpen(false);
      setCouponToDelete(null);
    }
  };

  const handleToggleStatus = async (id: string) => {
    await toggleStatusMutation.mutateAsync(id);
  };

  const handleDuplicate = async (id: string) => {
    await duplicateMutation.mutateAsync(id);
  };

  const getLocalizedName = (coupon: Coupon) => {
    return isArabic
      ? coupon.nameAr || coupon.nameEn
      : coupon.nameEn || coupon.nameAr;
  };

  const getCouponStatus = (coupon: Coupon) => {
    if (!coupon.isActive) {
      return {
        label: isArabic ? "غير نشط" : "Inactive",
        variant: "secondary" as const,
        icon: XCircle,
      };
    }

    if (!coupon.startDate || !coupon.endDate) {
      return {
        label: isArabic ? "غير معروف" : "Unknown",
        variant: "secondary" as const,
        icon: AlertCircle,
      };
    }

    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);

    if (now < startDate) {
      return {
        label: isArabic ? "قادم" : "Upcoming",
        variant: "outline" as const,
        icon: Clock,
      };
    }
    if (now > endDate) {
      return {
        label: isArabic ? "منتهي" : "Expired",
        variant: "destructive" as const,
        icon: AlertCircle,
      };
    }
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return {
        label: isArabic ? "مستنفد" : "Exhausted",
        variant: "destructive" as const,
        icon: XCircle,
      };
    }
    return {
      label: isArabic ? "نشط" : "Active",
      variant: "default" as const,
      icon: CheckCircle,
    };
  };

  const isSubmitting =
    createCouponMutation.isPending || updateCouponMutation.isPending;

  return (
    <TooltipProvider>
      <div className={`flex flex-col gap-6 p-4 ${isArabic ? "rtl" : "ltr"}`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Tag className="h-6 w-6" />
              {isArabic ? "إدارة الكوبونات" : "Coupons Management"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isArabic
                ? "إنشاء وإدارة كوبونات الخصم"
                : "Create and manage discount coupons"}
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
            className="bg-primary hover:bg-primary/90"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            {isArabic ? "إضافة كوبون" : "Add Coupon"}
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? "إجمالي الكوبونات" : "Total Coupons"}
                    </p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Tag className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? "نشطة" : "Active"}
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.active}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? "إجمالي الاستخدام" : "Total Usage"}
                    </p>
                    <p className="text-2xl font-bold">{stats.totalUsage}</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? "إجمالي الخصومات" : "Total Discounts"}
                    </p>
                    <p className="text-2xl font-bold">
                      ${stats.totalDiscount?.toFixed(2) || 0}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Coupons Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {isArabic ? "قائمة الكوبونات" : "Coupons List"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-24" />
                    <Skeleton className="h-12 flex-1" />
                    <Skeleton className="h-12 w-20" />
                    <Skeleton className="h-12 w-32" />
                  </div>
                ))}
              </div>
            ) : coupons.length === 0 ? (
              <div className="text-center py-12">
                <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {isArabic ? "لا توجد كوبونات" : "No coupons found"}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    resetForm();
                    setDialogOpen(true);
                  }}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {isArabic ? "إضافة أول كوبون" : "Add First Coupon"}
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isArabic ? "الرمز" : "Code"}</TableHead>
                      <TableHead>{isArabic ? "الاسم" : "Name"}</TableHead>
                      <TableHead>{isArabic ? "الخصم" : "Discount"}</TableHead>
                      <TableHead>{isArabic ? "النوع" : "Type"}</TableHead>
                      <TableHead>{isArabic ? "الاستخدام" : "Usage"}</TableHead>
                      <TableHead>
                        {isArabic ? "الصلاحية" : "Validity"}
                      </TableHead>
                      <TableHead>{isArabic ? "الحالة" : "Status"}</TableHead>
                      <TableHead className="text-center">
                        {isArabic ? "الإجراءات" : "Actions"}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coupons.map((coupon: Coupon) => {
                      const status = getCouponStatus(coupon);
                      const StatusIcon = status.icon;

                      return (
                        <TableRow key={coupon._id}>
                          <TableCell>
                            <code className="bg-muted px-2 py-1 rounded font-mono font-bold">
                              {coupon.code}
                            </code>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {getLocalizedName(coupon)}
                              </p>
                              {coupon.descriptionEn && (
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {isArabic
                                    ? coupon.descriptionAr
                                    : coupon.descriptionEn}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {coupon.discountType === "percentage" ? (
                                <>
                                  <Percent className="h-4 w-4 text-green-600" />
                                  <span className="font-semibold text-green-600">
                                    {coupon.discountValue}%
                                  </span>
                                </>
                              ) : (
                                <>
                                  <DollarSign className="h-4 w-4 text-green-600" />
                                  <span className="font-semibold text-green-600">
                                    {coupon.discountValue}
                                  </span>
                                </>
                              )}
                            </div>
                            {coupon.minPurchaseAmount > 0 && (
                              <p className="text-xs text-muted-foreground">
                                {isArabic ? "الحد الأدنى:" : "Min:"} $
                                {coupon.minPurchaseAmount}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {coupon.type?.replace("_", " ") || "public"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <span className="font-semibold">
                                {coupon.usageCount || 0}
                              </span>
                              {coupon.usageLimit && (
                                <span className="text-muted-foreground">
                                  /{coupon.usageLimit}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {coupon.startDate
                                  ? format(new Date(coupon.startDate), "MMM dd")
                                  : "-"}
                              </div>
                              <div className="text-muted-foreground">
                                →{" "}
                                {coupon.endDate
                                  ? format(
                                      new Date(coupon.endDate),
                                      "MMM dd, yyyy"
                                    )
                                  : "-"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.variant} className="gap-1">
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEdit(coupon)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {isArabic ? "تعديل" : "Edit"}
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleToggleStatus(coupon._id)
                                    }
                                    disabled={toggleStatusMutation.isPending}
                                  >
                                    {coupon.isActive ? (
                                      <ToggleRight className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <ToggleLeft className="h-4 w-4 text-gray-400" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {coupon.isActive
                                    ? isArabic
                                      ? "إلغاء التفعيل"
                                      : "Deactivate"
                                    : isArabic
                                    ? "تفعيل"
                                    : "Activate"}
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDuplicate(coupon._id)}
                                    disabled={duplicateMutation.isPending}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {isArabic ? "نسخ" : "Duplicate"}
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() =>
                                      handleDeleteClick(coupon._id)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {isArabic ? "حذف" : "Delete"}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                {editMode
                  ? isArabic
                    ? "تعديل الكوبون"
                    : "Edit Coupon"
                  : isArabic
                  ? "إضافة كوبون جديد"
                  : "Add New Coupon"}
              </DialogTitle>
              <DialogDescription>
                {isArabic
                  ? "املأ التفاصيل لإنشاء أو تعديل كوبون الخصم"
                  : "Fill in the details to create or edit a discount coupon"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Code */}
              <div className="space-y-2">
                <Label htmlFor="code" className="flex items-center gap-1">
                  {isArabic ? "رمز الكوبون" : "Coupon Code"}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    updateFormField("code", e.target.value.toUpperCase())
                  }
                  placeholder="SUMMER2024"
                  className={cn(
                    "uppercase",
                    formErrors.code && "border-destructive"
                  )}
                />
                {formErrors.code && (
                  <p className="text-xs text-destructive">{formErrors.code}</p>
                )}
              </div>

              {/* Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nameEn">
                    {isArabic ? "الاسم (EN)" : "Name (EN)"}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nameEn"
                    value={formData.nameEn}
                    onChange={(e) => updateFormField("nameEn", e.target.value)}
                    placeholder="Summer Sale"
                    className={cn(formErrors.nameEn && "border-destructive")}
                  />
                  {formErrors.nameEn && (
                    <p className="text-xs text-destructive">
                      {formErrors.nameEn}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nameAr">
                    {isArabic ? "الاسم (AR)" : "Name (AR)"}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nameAr"
                    value={formData.nameAr}
                    onChange={(e) => updateFormField("nameAr", e.target.value)}
                    placeholder="تخفيضات الصيف"
                    className={cn(formErrors.nameAr && "border-destructive")}
                  />
                  {formErrors.nameAr && (
                    <p className="text-xs text-destructive">
                      {formErrors.nameAr}
                    </p>
                  )}
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="descriptionEn">
                    {isArabic ? "الوصف (EN)" : "Description (EN)"}
                  </Label>
                  <Textarea
                    id="descriptionEn"
                    value={formData.descriptionEn}
                    onChange={(e) =>
                      updateFormField("descriptionEn", e.target.value)
                    }
                    placeholder="Get amazing summer discounts..."
                    className="min-h-20 resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descriptionAr">
                    {isArabic ? "الوصف (AR)" : "Description (AR)"}
                  </Label>
                  <Textarea
                    id="descriptionAr"
                    value={formData.descriptionAr}
                    onChange={(e) =>
                      updateFormField("descriptionAr", e.target.value)
                    }
                    placeholder="احصل على خصومات صيفية مذهلة..."
                    className="min-h-20 resize-none"
                  />
                </div>
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isArabic ? "نوع الخصم" : "Discount Type"}</Label>
                  <Select
                    value={formData.discountType}
                    onValueChange={(val: DiscountType) =>
                      updateFormField("discountType", val)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">
                        <div className="flex items-center gap-2">
                          <Percent className="h-4 w-4" />
                          {isArabic ? "نسبة مئوية" : "Percentage"}
                        </div>
                      </SelectItem>
                      <SelectItem value="fixed">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          {isArabic ? "قيمة ثابتة" : "Fixed Amount"}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountValue">
                    {formData.discountType === "percentage"
                      ? isArabic
                        ? "قيمة الخصم (%)"
                        : "Discount Value (%)"
                      : isArabic
                      ? "قيمة الخصم ($)"
                      : "Discount Value ($)"}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="discountValue"
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) =>
                      updateFormField("discountValue", e.target.value)
                    }
                    placeholder={
                      formData.discountType === "percentage" ? "20" : "100"
                    }
                    min="0"
                    max={
                      formData.discountType === "percentage" ? "100" : undefined
                    }
                    step="0.01"
                    className={cn(
                      formErrors.discountValue && "border-destructive"
                    )}
                  />
                  {formErrors.discountValue && (
                    <p className="text-xs text-destructive">
                      {formErrors.discountValue}
                    </p>
                  )}
                </div>
              </div>

              {/* Min Purchase & Max Discount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minPurchase">
                    {isArabic
                      ? "الحد الأدنى للشراء ($)"
                      : "Minimum Purchase ($)"}
                  </Label>
                  <Input
                    id="minPurchase"
                    type="number"
                    value={formData.minPurchaseAmount}
                    onChange={(e) =>
                      updateFormField("minPurchaseAmount", e.target.value)
                    }
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                {formData.discountType === "percentage" && (
                  <div className="space-y-2">
                    <Label htmlFor="maxDiscount">
                      {isArabic
                        ? "الحد الأقصى للخصم ($)"
                        : "Max Discount Amount ($)"}
                    </Label>
                    <Input
                      id="maxDiscount"
                      type="number"
                      value={formData.maxDiscountAmount}
                      onChange={(e) =>
                        updateFormField("maxDiscountAmount", e.target.value)
                      }
                      placeholder={isArabic ? "بدون حد" : "No limit"}
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}
              </div>





{/* Dates - Using Native Date Input */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Start Date */}
  <div className="space-y-2">
    <Label htmlFor="startDate">
      {isArabic ? "تاريخ البداية" : "Start Date"}
      <span className="text-destructive">*</span>
    </Label>
    <Input
      id="startDate"
      type="date"
      value={
        formData.startDate
          ? formData.startDate.toISOString().split("T")[0]
          : ""
      }
      onChange={(e) => {
        if (e.target.value) {
          const newDate = new Date(e.target.value + "T00:00:00");
          updateFormField("startDate", newDate);
          // Reset end date if it's before or equal to new start date
          if (formData.endDate && formData.endDate <= newDate) {
            updateFormField("endDate", undefined);
          }
        } else {
          updateFormField("startDate", undefined);
        }
      }}
      className={cn(
        "w-full",
        formErrors.startDate && "border-destructive"
      )}
    />
    {formErrors.startDate && (
      <p className="text-xs text-destructive">{formErrors.startDate}</p>
    )}
  </div>

  {/* End Date */}
  <div className="space-y-2">
    <Label htmlFor="endDate">
      {isArabic ? "تاريخ الانتهاء" : "End Date"}
      <span className="text-destructive">*</span>
    </Label>
    <Input
      id="endDate"
      type="date"
      value={
        formData.endDate
          ? formData.endDate.toISOString().split("T")[0]
          : ""
      }
      onChange={(e) => {
        if (e.target.value) {
          const newDate = new Date(e.target.value + "T23:59:59");
          updateFormField("endDate", newDate);
        } else {
          updateFormField("endDate", undefined);
        }
      }}
      min={
        formData.startDate
          ? new Date(formData.startDate.getTime() + 86400000)
              .toISOString()
              .split("T")[0]
          : undefined
      }
      className={cn(
        "w-full",
        formErrors.endDate && "border-destructive"
      )}
    />
    {formErrors.endDate && (
      <p className="text-xs text-destructive">{formErrors.endDate}</p>
    )}
  </div>
</div>

              {/* Usage Limits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="usageLimit">
                    {isArabic
                      ? "الحد الأقصى للاستخدام الكلي"
                      : "Total Usage Limit"}
                  </Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) =>
                      updateFormField("usageLimit", e.target.value)
                    }
                    placeholder={isArabic ? "غير محدود" : "Unlimited"}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usageLimitPerUser">
                    {isArabic
                      ? "الحد الأقصى لكل مستخدم"
                      : "Usage Limit Per User"}
                  </Label>
                  <Input
                    id="usageLimitPerUser"
                    type="number"
                    value={formData.usageLimitPerUser}
                    onChange={(e) =>
                      updateFormField("usageLimitPerUser", e.target.value)
                    }
                    placeholder="1"
                    min="1"
                  />
                </div>
              </div>

              {/* Coupon Type */}
              <div className="space-y-2">
                <Label>{isArabic ? "نوع الكوبون" : "Coupon Type"}</Label>
                <Select
                  value={formData.type}
                  onValueChange={(val: CouponType) =>
                    updateFormField("type", val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      {isArabic ? "عام" : "Public"}
                    </SelectItem>
                    <SelectItem value="private">
                      {isArabic ? "خاص" : "Private"}
                    </SelectItem>
                    <SelectItem value="first_order">
                      {isArabic ? "الطلب الأول" : "First Order"}
                    </SelectItem>
                    <SelectItem value="birthday">
                      {isArabic ? "عيد الميلاد" : "Birthday"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Switches */}
              <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="isActive">
                      {isArabic ? "نشط" : "Active"}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {isArabic
                        ? "تفعيل أو إلغاء تفعيل الكوبون"
                        : "Enable or disable the coupon"}
                    </p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      updateFormField("isActive", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="applyToShipping">
                      {isArabic ? "تطبيق على الشحن" : "Apply to Shipping"}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {isArabic
                        ? "تطبيق الخصم على رسوم الشحن"
                        : "Apply discount to shipping fees"}
                    </p>
                  </div>
                  <Switch
                    id="applyToShipping"
                    checked={formData.applyToShipping}
                    onCheckedChange={(checked) =>
                      updateFormField("applyToShipping", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="stackable">
                      {isArabic ? "قابل للدمج" : "Stackable"}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {isArabic
                        ? "يمكن دمجه مع كوبونات أخرى"
                        : "Can be combined with other coupons"}
                    </p>
                  </div>
                  <Switch
                    id="stackable"
                    checked={formData.stackable}
                    onCheckedChange={(checked) =>
                      updateFormField("stackable", checked)
                    }
                  />
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setDialogOpen(false);
                  }}
                  disabled={isSubmitting}
                >
                  {isArabic ? "إلغاء" : "Cancel"}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editMode
                    ? isArabic
                      ? "تحديث"
                      : "Update"
                    : isArabic
                    ? "إنشاء"
                    : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {isArabic ? "تأكيد الحذف" : "Confirm Deletion"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {isArabic
                  ? "هل أنت متأكد من حذف هذا الكوبون؟ لا يمكن التراجع عن هذا الإجراء."
                  : "Are you sure you want to delete this coupon? This action cannot be undone."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteCouponMutation.isPending}>
                {isArabic ? "إلغاء" : "Cancel"}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={deleteCouponMutation.isPending}
                className="bg-destructive hover:bg-destructive/90"
              >
                {deleteCouponMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isArabic ? "حذف" : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
