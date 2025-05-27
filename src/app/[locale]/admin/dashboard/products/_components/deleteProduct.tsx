import { Button } from "@/components/ui/button";
import { deleteProduct } from "@/server";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-toastify";

import { useAppDispatch } from "@/redux/hooks"; // أضف هذا الاستيراد
import { fetchProducts } from "@/redux/features/prodect/prodectSlice";
import { IProduct } from "@/types/type";

export default function DeleteProduct({ t, product}: { 
  t: any; 
  product: IProduct;

}) {
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch(); // أضف هذا السطر

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteProduct(product.productSlug);
      toast.success(t.admin.deleteProductSuccess);
      
      // أضف هذا السطر لتحديث القائمة
      dispatch(fetchProducts({ applyFilters: false }));
      
    } catch (error) {
      toast.error(t.admin.deleteProductError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      disabled={loading}
      onClick={handleDelete} // عدل هذا السطر
      className="bg-secondary cursor-pointer text-white py-3 px-10 rounded-md shadow-md hover:bg-secondary/80 transition-all duration-300"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        t.admin.deleteProduct
      )}
    </Button>
  );
}