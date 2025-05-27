/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, User } from "lucide-react";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { updateUserProfile } from "@/redux/features/user/userSlice";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface TranslationType {
  formFields?: {
    [key: string]: any;
  };
  admin?: {
    userImage?: string;
    userImagePreview?: string;
  };
  common?: {
    loading?: string;
    error?: string;
    save?: string;
  };
  profile?: {
    profileUpdated?: string;
    personalInfo?: string;
    accountSettings?: string;
    uploadImage?: string;
    changePassword?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    allPasswordFieldsRequired?: string;
    passwordsDoNotMatch?: string;
    passwordChangeError?: string;
  };
  navigation?: {
    profile?: string;
  };
  [key: string]: any;
}

export default function ProfileForm({ t }: { t: TranslationType }) {
  const user = useAppSelector((state) => state.user.user);
  const [isPending, setIsPending] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const router = useRouter();
  const apiURL = process.env.NEXT_PUBLIC_API_URL;
  const dispatch = useAppDispatch();

  // Define form schema with Zod
  const userSchema = z.object({
    firstName: z.string().min(2, { message: t.admin?.minFirstNameLength || "First name must be at least 2 characters" }),
    lastName: z.string().min(2, { message: t.admin?.minLastNameLength || "Last name must be at least 2 characters" }),
    email: z.string().email({ message: t.admin?.invalidEmail || "Invalid email address" }),
    phone: z.string().optional(),
    userImage: z.any().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  }).refine(data => {
    // If any password field is filled, all password fields must be filled
    if (data.currentPassword || data.newPassword || data.confirmPassword) {
      return !!data.currentPassword && !!data.newPassword && !!data.confirmPassword;
    }
    return true;
  }, {
    message: t.profile?.allPasswordFieldsRequired || "All password fields are required to change password",
    path: ["confirmPassword"],
  }).refine(data => {
    // If new password is provided, it must match confirm password
    if (data.newPassword && data.confirmPassword) {
      return data.newPassword === data.confirmPassword;
    }
    return true;
  }, {
    message: t.profile?.passwordsDoNotMatch || "Passwords do not match",
    path: ["confirmPassword"],
  });

  // Setup form with React Hook Form and Zod
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

  // Set preview image when component mounts
  useEffect(() => {
    if (user?.userImage) {
      setPreviewImage(
        user.userImage.startsWith('/')
          ? `${apiURL}${user.userImage}`
          : '/user.jpg'
      );
    } else {
      setPreviewImage('/user.jpg');
    }
  }, [user, apiURL]);

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      form.setValue("userImage", file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Form submission handler
  const onSubmit = async (data: z.infer<typeof userSchema>) => {
    if (!user) return;
    
    setIsPending(true);
    const formDataToSend = new FormData();
    
    // Add user ID
    formDataToSend.append('uId', user._id);
    
    // Add text data
    formDataToSend.append('firstName', data.firstName);
    formDataToSend.append('lastName', data.lastName);
    formDataToSend.append('email', data.email);
    formDataToSend.append('role', user.role); // Keep the existing role
    
    if (data.phone) {
      formDataToSend.append('phone', data.phone);
    }
    
    // Handle password change
    if (data.currentPassword && data.newPassword) {
      formDataToSend.append('oldPassword', data.currentPassword);
      formDataToSend.append('newPassword', data.newPassword);
      formDataToSend.append('password', 'currentpassword'); // For the regular update endpoint
    } else {
      // If no new password, send a placeholder to satisfy backend validation
      formDataToSend.append('password', 'currentpassword');
    }
    
    // Add user image if provided
    if (data.userImage instanceof File) {
      formDataToSend.append('userImage', data.userImage);
    }
    
    try {
      // Dispatch the updateUserProfile action
      const resultAction = await dispatch(updateUserProfile(formDataToSend));
      
      if (updateUserProfile.fulfilled.match(resultAction)) {
        // If password change was requested, call the password change endpoint
        if (data.currentPassword && data.newPassword) {
          try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/change-password`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                uId: user.id,
                oldPassword: data.currentPassword,
                newPassword: data.newPassword,
              }),
              credentials: 'include',
            });
          } catch (passwordError: any) {
            toast.error(passwordError.message || t.profile?.passwordChangeError || "Failed to update password");
          }
        }
        
        toast.success(resultAction.payload.message || t.profile?.profileUpdated || "Profile updated successfully");
        router.refresh();
        
        // Reset password fields
        form.setValue('currentPassword', '');
        form.setValue('newPassword', '');
        form.setValue('confirmPassword', '');
      } else if (updateUserProfile.rejected.match(resultAction)) {
        toast.error(resultAction.payload as string || t.common?.error || "An error occurred");
      }
    } catch (error: any) {
      toast.error(error.message || t.common?.error || "An error occurred");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="w-full lg:w-3/4">
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle>{t.navigation?.profile || "Profile"}</CardTitle>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Profile Image Section */}
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 pb-6">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-sm">
                  {previewImage ? (
                    <Image
                      src={previewImage}
                      alt={t.admin?.userImagePreview || "User image preview"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">{t.profile?.uploadImage || "Profile Picture"}</h3>
                    <p className="text-sm text-gray-500">
                      {t.profile?.imageRequirements || "JPG, GIF or PNG. Max size of 800K"}
                    </p>
                  </div>
                  
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="max-w-sm"
                  />
                </div>
              </div>
              
              <Separator />
              
              {/* Personal Information Section */}
              <div className="pt-4">
                <h3 className="text-lg font-medium mb-4">{t.profile?.personalInfo || "Personal Information"}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.formFields?.firstName || "First Name"}</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                        <FormLabel>{t.formFields?.lastName || "Last Name"}</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                        <FormLabel>{t.formFields?.email || "Email"}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.formFields?.phone || "Phone"}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <Separator />
              
              {/* Password Change Section */}
              <div className="pt-4">
                <h3 className="text-lg font-medium mb-4">{t.profile?.changePassword || "Change Password"}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.profile?.currentPassword || "Current Password"}</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div></div> {/* Empty div for grid alignment */}
                  
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.profile?.newPassword || "New Password"}</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
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
                        <FormLabel>{t.profile?.confirmPassword || "Confirm New Password"}</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={isPending} className="min-w-[120px]">
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t.common?.loading || "Loading..."}
                    </>
                  ) : (
                    t.common?.save || "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
