import { Button } from "@/components/ui/button";
import { useDeleteCategory } from "@/hooks/useCategories";
import { Loader2, Trash2 } from "lucide-react";
import React from "react";
import { toast } from "react-toastify";

export default function DeleteCategory({
  t,
  category,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  category: any;
}) {
  const deleteCategoryMutation = useDeleteCategory();
  // We can use mutation.isPending for loading state
  const loading = deleteCategoryMutation.isPending;

  const handleDelete = async () => {
    if (
      window.confirm(
        t.admin.confirmDeleteCategory ||
          "Are you sure you want to delete this category?"
      )
    ) {
      try {
        await deleteCategoryMutation.mutateAsync(category._id);
        // Success handled in hook
      } catch {
        // Error handling if needed, usually hook covers it or toast
        toast.error(t.admin.deleteCategoryError || "Failed to delete category");
      }
    }
  };
  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={loading}
      onClick={handleDelete}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}{" "}
    </Button>
  );
}
