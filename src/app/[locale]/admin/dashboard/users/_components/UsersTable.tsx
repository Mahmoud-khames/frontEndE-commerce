"use client";

import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchUsers } from "@/redux/features/user/userSlice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

import Image from "next/image";
import AddUser from "./AddUser";
import DeleteUser from "./DeleteUser";
import EditUser from "./EditUser";

export default function UsersTable({
  t,
  locale,
}: {
  t: any;
  locale: string;
}) {
  const dispatch = useAppDispatch();
  const { users, isLoading } = useAppSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  return (
    <div className="">
      <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 flex justify-between items-center border-b">
        <h2 className="text-xl font-semibold">{t.admin.users || "Users"}</h2>
        <AddUser t={t} locale={locale} />
      </div>
      <div className="p-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left p-2">#</TableHead>
              <TableHead className="text-left p-2">{t.admin.image || "Image"}</TableHead>
              <TableHead className="text-left p-2">{t.admin.firstName || "First Name"}</TableHead>
              <TableHead className="text-left p-2">{t.admin.lastName || "Last Name"}</TableHead>
              <TableHead className="text-left p-2">{t.admin.email || "Email"}</TableHead>
              <TableHead className="text-left p-2">{t.admin.phone || "Phone"}</TableHead>
              <TableHead className="text-left p-2">{t.admin.role || "Role"}</TableHead>
              <TableHead className="text-left p-2">{t.common.actions || "Actions"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="p-4 text-center"
                >
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-secondary" />
                    <span className="text-gray-600">{t.common.loading || "Loading..."}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : users?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="p-2 text-center">
                  {t.admin.noData || "No users found"}
                </TableCell>
              </TableRow>
            ) : (
              users?.map((user: any, index) => (
                <TableRow key={user._id} className="hover:bg-gray-50">
                  <TableCell className="p-2">{index + 1}</TableCell>
                  <TableCell className="p-2">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                      <Image
                        src={user.userImage?.startsWith('/') 
                          ? `${process.env.NEXT_PUBLIC_API_URL}${user.userImage}` 
                          : '/user.jpg'}
                        alt={user.firstName}
                        fill
                        className="object-cover"
                        onError={(e: any) => {
                          e.target.src = '/user.jpg';
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="p-2 font-medium">
                    {user.firstName}
                  </TableCell>
                  <TableCell className="p-2">
                    {user.lastName}
                  </TableCell>
                  <TableCell className="p-2">
                    {user.email}
                  </TableCell>
                  <TableCell className="p-2">
                    {user.phone || "-"}
                  </TableCell>
                  <TableCell className="p-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'admin' 
                        ? "bg-purple-100 text-purple-800" 
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell className="p-2">
                    <div className="flex gap-3">
                      <EditUser user={user} t={t} locale={locale} />
                      <DeleteUser user={user} t={t} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
    </div>
  );
}
