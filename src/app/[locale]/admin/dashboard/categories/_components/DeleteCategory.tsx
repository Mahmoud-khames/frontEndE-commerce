import { Button } from "@/components/ui/button";
import { deleteCategory } from "@/server";import { Loader2, Trash2 } from "lucide-react";
import React, { useState } from "react";import { toast } from "react-toastify";
import { useAppDispatch } from "@/redux/hooks";
import { fetchCategories } from "@/redux/features/category/categorySlice";
export default function DeleteCategory({ t, category }: {   t: any; 
  category: any;}) {
  const [loading, setLoading] = useState(false);  const dispatch = useAppDispatch();
  const handleDelete = async () => {
    if (window.confirm(t.admin.confirmDeleteCategory || "Are you sure you want to delete this category?")) {      try {
        setLoading(true);        await deleteCategory(category._id);
        toast.success(t.admin.deleteCategorySuccess || "Category deleted successfully");        
        // تحديث قائمة الفئات        dispatch(fetchCategories());
              } catch (error) {
        toast.error(t.admin.deleteCategoryError || "Failed to delete category");      } finally {
        setLoading(false);      }
    }  };
  return (
    <Button      variant="destructive"
      size="sm"      disabled={loading}
      onClick={handleDelete}    >
      {loading ? (        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (        <Trash2 className="w-4 h-4" />
      )}    </Button>
  );
}

























