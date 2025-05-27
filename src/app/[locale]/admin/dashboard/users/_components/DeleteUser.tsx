"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { useAppDispatch } from "@/redux/hooks";
import { fetchUsers } from "@/redux/features/user/userSlice";
import { deleteUser } from "@/server";
import { Trash2, Loader2 } from "lucide-react";

export default function DeleteUser({
  user,
  t,
}: {
  user: any;
  t: any;
}) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleDelete = async () => {
    setIsPending(true);
    try {
      const response = await deleteUser(user._id);
      toast.success(response.data.message || t.admin.userDeletedSuccessfully || "User deleted successfully");
      dispatch(fetchUsers());
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t.common.error || "An error occurred");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="flex items-center gap-1">
          <Trash2 className="h-4 w-4" />
          {t.admin.delete || "Delete"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.admin.deleteUser || "Delete User"}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.admin.deleteUserConfirmation || "Are you sure you want to delete this user? This action cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t.common.cancel || "Cancel"}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t.common.loading || "Loading..."}
              </>
            ) : (
              t.admin.delete || "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}