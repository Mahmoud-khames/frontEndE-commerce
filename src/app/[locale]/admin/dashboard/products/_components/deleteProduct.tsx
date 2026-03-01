import { Button } from "@/components/ui/button";
import { useDeleteProduct } from "@/hooks/useProducts";
import { Loader2, Trash2 } from "lucide-react";
import React from "react";
import { toast } from "react-toastify";
import { Product } from "@/types";

export default function DeleteProduct({
  t,
  product,
}: {
  t: any;
  product: Product;
}) {
  const deleteProductMutation = useDeleteProduct();
  const loading = deleteProductMutation.isPending;

  const handleDelete = async () => {
    try {
      if (confirm(t.admin.confirmDelete || "Are you sure?")) {
        await deleteProductMutation.mutateAsync(product.productSlug);
        // Toast and invalidation handled in hook
      }
    } catch {
      // generic error handler
    }
  };

  return (
    <Button
      disabled={loading}
      onClick={handleDelete}
      className="bg-secondary cursor-pointer text-white py-3 px-10 rounded-md shadow-md hover:bg-secondary/80 transition-all duration-300"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </Button>
  );
}
