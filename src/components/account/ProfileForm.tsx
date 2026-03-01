// src/components/account/ProfileForm.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, User, Upload, Lock, Mail, Phone, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/providers/AuthProvider";
import { authService } from "@/services/authService";

interface ProfileFormProps {
  t: any;
  locale: string;
}

export default function ProfileForm({ t, locale }: ProfileFormProps) {
  const { user, updateUser } = useAuth();
  const [isPending, setIsPending] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const router = useRouter();
  const isRTL = locale === "ar";

  // Define form schema
  const userSchema = z
    .object({
      firstName: z.string().min(2, {
        message: isRTL ? "يجب أن يكون الاسم الأول حرفين على الأقل" : "First name must be at least 2 characters",
      }),
      lastName: z.string().min(2, {
        message: isRTL ? "يجب أن يكون اسم العائلة حرفين على الأقل" : "Last name must be at least 2 characters",
      }),
      email: z.string().email({ 
        message: isRTL ? "بريد إلكتروني غير صالح" : "Invalid email address" 
      }),
      phone: z.string().optional(),
      userImage: z.any().optional(),
      currentPassword: z.string().optional(),
      newPassword: z.string().min(6, {
        message: isRTL ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters",
      }).optional().or(z.literal("")),
      confirmPassword: z.string().optional(),
    })
    .refine(
      (data) => {
        if (data.currentPassword || data.newPassword || data.confirmPassword) {
          return !!data.currentPassword && !!data.newPassword && !!data.confirmPassword;
        }
        return true;
      },
      {
        message: isRTL ? "جميع حقول كلمة المرور مطلوبة لتغيير كلمة المرور" : "All password fields are required to change password",
        path: ["confirmPassword"],
      }
    )
    .refine(
      (data) => {
        if (data.newPassword && data.confirmPassword) {
          return data.newPassword === data.confirmPassword;
        }
        return true;
      },
      {
        message: isRTL ? "كلمات المرور غير متطابقة" : "Passwords do not match",
        path: ["confirmPassword"],
      }
    );

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPreviewImage(user.avatar || null);
    }
  }, [user, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (max 800KB)
      if (file.size > 800 * 1024) {
        toast.error(isRTL ? "حجم الصورة يجب أن يكون أقل من 800KB" : "Image size must be less than 800KB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error(isRTL ? "يجب أن يكون الملف صورة" : "File must be an image");
        return;
      }

      form.setValue("userImage", file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: z.infer<typeof userSchema>) => {
    if (!user) return;

    setIsPending(true);

    try {
      // Update Profile
      const updateData: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      };

      const profileResponse = await authService.updateProfile(updateData);

      if (profileResponse.user) {
        updateUser(profileResponse.user);
        toast.success(
          profileResponse.message || 
          (isRTL ? "تم تحديث الملف الشخصي بنجاح" : "Profile updated successfully")
        );
      }

      // Change Password if provided
      if (data.currentPassword && data.newPassword) {
        try {
          await authService.changePassword({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
          });
          toast.success(isRTL ? "تم تغيير كلمة المرور بنجاح" : "Password changed successfully");

          // Reset password fields
          form.setValue("currentPassword", "");
          form.setValue("newPassword", "");
          form.setValue("confirmPassword", "");
        } catch (passwordError: any) {
          toast.error(
            passwordError.response?.data?.message || 
            (isRTL ? "فشل تغيير كلمة المرور" : "Failed to change password")
          );
        }
      }

      router.refresh();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 
        (isRTL ? "حدث خطأ" : "An error occurred")
      );
    } finally {
      setIsPending(false);
    }
  };

  const getInitials = () => {
    if (!user) return "U";
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit className="h-5 w-5" />
          {isRTL ? "تحرير الملف الشخصي" : "Edit Profile"}
        </CardTitle>
        <CardDescription>
          {isRTL ? "قم بتحديث معلومات حسابك الشخصية" : "Update your personal account information"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Profile Picture Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={previewImage || undefined} />
                <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-base font-medium">
                    {isRTL ? "صورة الملف الشخصي" : "Profile Picture"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? "JPG، GIF أو PNG. الحد الأقصى 800KB" : "JPG, GIF or PNG. Max size of 800KB"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Input
                    id="userImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("userImage")?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isRTL ? "رفع صورة" : "Upload Image"}
                  </Button>
                  {previewImage && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPreviewImage(null);
                        form.setValue("userImage", undefined);
                      }}
                    >
                      {isRTL ? "إزالة" : "Remove"}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Personal Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">
                  {isRTL ? "المعلومات الشخصية" : "Personal Information"}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {isRTL ? "الاسم الأول" : "First Name"}
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={isRTL ? "أحمد" : "John"} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {isRTL ? "اسم العائلة" : "Last Name"}
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={isRTL ? "محمد" : "Doe"} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {isRTL ? "البريد الإلكتروني" : "Email"}
                        </FormLabel>
                        <FormControl>
                          <Input {...field} type="email" disabled />
                        </FormControl>
                        <FormDescription>
                          {isRTL ? "لا يمكن تغيير البريد الإلكتروني" : "Email cannot be changed"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {isRTL ? "رقم الهاتف" : "Phone"}
                        </FormLabel>
                        <FormControl>
                          <Input {...field} type="tel" placeholder="+1 234 567 8900" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Password Change */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-1 flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  {isRTL ? "تغيير كلمة المرور" : "Change Password"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {isRTL ? "اترك الحقول فارغة إذا لم ترد تغيير كلمة المرور" : "Leave fields empty if you don't want to change your password"}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>{isRTL ? "كلمة المرور الحالية" : "Current Password"}</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isRTL ? "كلمة المرور الجديدة" : "New Password"}</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isRTL ? "تأكيد كلمة المرور" : "Confirm New Password"}</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isPending}
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
              <Button type="submit" disabled={isPending} className="min-w-[140px]">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isRTL ? "جاري الحفظ..." : "Saving..."}
                  </>
                ) : (
                  isRTL ? "حفظ التغييرات" : "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}