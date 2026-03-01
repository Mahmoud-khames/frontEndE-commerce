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
import { useDeleteUser } from "@/hooks/useUsers";
import { Trash2, Loader2 } from "lucide-react";

export default function DeleteUser({
  user,
  t,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const deleteUserMutation = useDeleteUser();
  const [isPending, setIsPending] = useState(false);

  const handleDelete = async () => {
    setIsPending(true);
    try {
      await deleteUserMutation.mutateAsync(user._id);
      setOpen(false);
      router.refresh();
    } catch {
      // Error handled by hook
    } finally {
      setIsPending(false);
    }
  };

  // const isPending = deleteUserMutation.isPending; // Could use this but manual state handles close

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="flex items-center gap-1">
          <Trash2 className="h-4 w-4" />
          {t.admin.delete || "Delete"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t.admin.deleteUser || "Delete User"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t.admin.deleteUserConfirmation ||
              "Are you sure you want to delete this user? This action cannot be undone."}
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
