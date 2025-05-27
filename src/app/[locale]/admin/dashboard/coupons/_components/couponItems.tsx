/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
} from "@/server";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Pencil, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";

export default function CouponItems({ t, locale }: { t: any; locale: string }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [currentCoupon, setCurrentCoupon] = useState<any>(null);
  const isArabic = locale === "ar";

  // Form state
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [expiry, setExpiry] = useState<Date | undefined>(new Date());
  const [status, setStatus] = useState(true);
  const [maxUses, setMaxUses] = useState("0");

  useEffect(() => {
    fetchCoupons();
  }, [locale]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await getAllCoupons();
      setCoupons(response.data.coupons);
      setLoading(false);
    } catch (error) {
      toast.error(isArabic ? "حدث خطأ أثناء جلب قسائم الخصم" : "Failed to fetch coupons");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Ensure expiry is always a Date
      if (!expiry) {
        toast.error(isArabic ? "يرجى تحديد تاريخ انتهاء الصلاحية" : "Please select an expiry date");
        return;
      }

      const couponData = {
        code,
        discount: Number(discount),
        expiry, // Now we know this is not undefined
        status,
        maxUses: Number(maxUses),
      };

      if (editMode && currentCoupon) {
        await updateCoupon(currentCoupon._id, couponData);
        toast.success(isArabic ? "تم تحديث قسيمة الخصم بنجاح" : "Coupon updated successfully");
      } else {
        await createCoupon(couponData);
        toast.success(isArabic ? "تم إنشاء قسيمة الخصم بنجاح" : "Coupon created successfully");
      }

      resetForm();
      fetchCoupons();
    } catch (error) {
      toast.error(isArabic ? "حدث خطأ أثناء حفظ قسيمة الخصم" : "Failed to save coupon");
    }
  };

  const handleEdit = (coupon: any) => {
    setCurrentCoupon(coupon);
    setCode(coupon.code);
    setDiscount(coupon.discount.toString());
    setExpiry(new Date(coupon.expiry));
    setStatus(coupon.status);
    setMaxUses(coupon.maxUses.toString());
    setEditMode(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCoupon(id);
      toast.success(isArabic ? "تم حذف قسيمة الخصم بنجاح" : "Coupon deleted successfully");
      fetchCoupons();
    } catch (error) {
      toast.error(isArabic ? "حدث خطأ أثناء حذف قسيمة الخصم" : "Failed to delete coupon");
    }
  };

  const resetForm = () => {
    setCode("");
    setDiscount("");
    setExpiry(new Date());
    setStatus(true);
    setMaxUses("0");
    setEditMode(false);
    setCurrentCoupon(null);
  };

  return (
    <div className={`flex flex-col gap-6 p-4 ${isArabic ? "rtl" : "ltr"}`}>
      <h1 className="text-2xl font-bold mb-6">
        {t?.admin?.coupons || (isArabic ? "إدارة قسائم الخصم" : "Coupons Management")}
      </h1>

      <div className="flex flex-col gap-6 p-1">
        {/* Coupon Form */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              {editMode
                ? t?.admin?.editCoupon || (isArabic ? "تعديل الكوبون" : "Edit Coupon")
                : t?.admin?.addCoupon || (isArabic ? "إضافة كوبون جديد" : "Add New Coupon")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">
                  {t?.admin?.couponCode || (isArabic ? "رمز الكوبون" : "Coupon Code")}
                </Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={isArabic ? "صيف2023" : "SUMMER2023"}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount">
                  {t?.admin?.discount || (isArabic ? "الخصم (%)" : "Discount (%)")}
                </Label>
                <Input
                  id="discount"
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiry">
                  {t?.admin?.expiryDate || (isArabic ? "تاريخ الانتهاء" : "Expiry Date")}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !expiry && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expiry ? (
                        format(expiry, "PPP")
                      ) : (
                        <span>{isArabic ? "اختر تاريخ" : "Pick a date"}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={expiry}
                      onSelect={setExpiry}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxUses">
                  {t?.admin?.maxUses || (isArabic ? "الحد الأقصى للاستخدام (0 للاستخدام غير المحدود)" : "Maximum Uses (0 for unlimited)")}
                </Label>
                <Input
                  id="maxUses"
                  type="number"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="flex items-center space-x-2" dir={isArabic ? "rtl" : "ltr"}>
                <Switch
                dir={isArabic ? "rtl" : "ltr"}
                  className="w-10"
                  id="status"
                  checked={status}
                  onCheckedChange={setStatus}
                />
                <Label htmlFor="status">{t?.admin?.active || (isArabic ? "نشط" : "Active")}</Label>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" className="">
                  {editMode
                    ? t?.admin?.update || (isArabic ? "تحديث" : "Update")
                    : t?.admin?.create || (isArabic ? "إنشاء" : "Create")}
                </Button>
                {editMode && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    {t?.admin?.cancel || (isArabic ? "إلغاء" : "Cancel")}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Coupons List */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{t?.admin?.couponsList || (isArabic ? "قائمة الكوبونات" : "Coupons List")}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
              </div>
            ) : coupons.length === 0 ? (
              <p className="text-center text-gray-500">
                {t?.admin?.noCoupons || (isArabic ? "لا توجد كوبونات" : "No coupons found")}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">
                        {t?.admin?.code || (isArabic ? "الرمز" : "Code")}
                      </th>
                      <th className="text-left p-2">
                        {t?.admin?.discount || (isArabic ? "الخصم" : "Discount")}
                      </th>
                      <th className="text-left p-2">
                        {t?.admin?.expiry || (isArabic ? "تاريخ الانتهاء" : "Expiry")}
                      </th>
                      <th className="text-left p-2">
                        {t?.admin?.status || (isArabic ? "الحالة" : "Status")}
                      </th>
                      <th className="text-left p-2">
                        {t?.admin?.maxUses || (isArabic ? "الحد الأقصى للاستخدام" : "Max Uses")}
                      </th>
                      <th className="text-left p-2">
                        {t?.admin?.actions || (isArabic ? "الإجراءات" : "Actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((coupon: any) => (
                      <tr
                        key={coupon._id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-2">{coupon.code}</td>
                        <td className="p-2">{coupon.discount}%</td>
                        <td className="p-2">
                          {format(new Date(coupon.expiry), "PPP")}
                        </td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              coupon.status
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {coupon.status
                              ? t?.admin?.active || (isArabic ? "نشط" : "Active")
                              : t?.admin?.inactive || (isArabic ? "غير نشط" : "Inactive")}
                          </span>
                        </td>
                        <td className="p-2">
                          {coupon.maxUses === 0 ? "∞" : coupon.maxUses}
                        </td>
                        <td className="p-2">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(coupon)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(coupon._id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
