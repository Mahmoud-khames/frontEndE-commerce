"use client";

import { useState, useTransition, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { useAppDispatch } from "@/redux/hooks";
import { fetchUsers } from "@/redux/features/user/userSlice";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { registerUser } from "@/server";
import { PlusCircle, Loader2 } from "lucide-react";
import Image from "next/image";

export default function AddUser({
  t,
  locale,
}: {
  t: any;
  locale: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  // Define form schema with Zod
  const userSchema = z.object({
    firstName: z.string().min(2, { message: t.admin.minFirstNameLength || "First name must be at least 2 characters" }),
    lastName: z.string().min(2, { message: t.admin.minLastNameLength || "Last name must be at least 2 characters" }),
    email: z.string().email({ message: t.admin.invalidEmail || "Invalid email address" }),
    password: z.string().min(6, { message: t.admin.minPasswordLength || "Password must be at least 6 characters" }),
    cPassword: z.string(),
    phone: z.string().optional(),
    role: z.string().default("user"),
    userImage: z.any().optional(),
  }).refine((data) => data.password === data.cPassword, {
    message: t.admin.passwordsDoNotMatch || "Passwords do not match",
    path: ["cPassword"],
  });

  // Setup form with React Hook Form and Zod
  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      cPassword: "",
      phone: "",
      role: "user",
    },
  });
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      form.setValue("userImage", file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Form submission handler
  const onSubmit = (data: z.infer<typeof userSchema>) => {
    const formDataToSend = new FormData();
    
    // Add text data
    formDataToSend.append('firstName', data.firstName);
    formDataToSend.append('lastName', data.lastName);
    formDataToSend.append('email', data.email);
    formDataToSend.append('password', data.password);
    formDataToSend.append('cPassword', data.cPassword);
    formDataToSend.append('role', data.role);
    
    if (data.phone) {
      formDataToSend.append('phone', data.phone);
    }
    
    // Add user image if provided
    if (data.userImage instanceof File) {
      formDataToSend.append('userImage', data.userImage);
    }
    
    startTransition(async () => {
      try {
        const response = await registerUser(formDataToSend);
        toast.success(response.data.message || t.admin.userAddedSuccessfully || "User added successfully");
        dispatch(fetchUsers());
        setOpen(false);
        form.reset();
        router.refresh();
      } catch (error: any) {
        toast.error(error.response?.data?.message || t.common.error || "An error occurred");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-secondary hover:bg-secondary/90">
          <PlusCircle className="mr-2 h-4 w-4" />
          {t.admin.addUser || "Add User"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.admin.addNewUser || "Add New User"}</DialogTitle>
          <DialogDescription>
            {t.admin.fillUserDetails || "Fill in the details to add a new user."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.admin.firstName || "First Name"}</FormLabel>
                    <FormControl>
                      <Input placeholder={t.admin.enterFirstName || "Enter first name"} {...field} />
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
                    <FormLabel>{t.admin.lastName || "Last Name"}</FormLabel>
                    <FormControl>
                      <Input placeholder={t.admin.enterLastName || "Enter last name"} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.admin.email || "Email"}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder={t.admin.enterEmail || "Enter email"} {...field} />
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
                  <FormLabel>{t.admin.phone || "Phone"}</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder={t.admin.enterPhone || "Enter phone number"} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.admin.password || "Password"}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={t.admin.enterPassword || "Enter password"} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.admin.confirmPassword || "Confirm Password"}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={t.admin.confirmPassword || "Confirm password"} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.admin.role || "Role"}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t.admin.selectRole || "Select role"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">{t.admin.user || "User"}</SelectItem>
                      <SelectItem value="admin">{t.admin.admin || "Admin"}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <Label>{t.admin.userImage || "User Image"}</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {previewImage && (
                <div className="mt-2">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden">
                    <Image
                      src={previewImage}
                      alt={t.admin.userImagePreview || "User image preview"}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button type="submit" disabled={isPending} className="bg-secondary hover:bg-secondary/90">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.common.loading || "Loading..."}
                  </>
                ) : (
                  t.admin.addUser || "Add User"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}