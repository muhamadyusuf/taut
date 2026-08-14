"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { Loader2 } from "lucide-react";
import ProductForm from "../../_components/ProductForm";

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as Id<"products">;

  // Ambil data produk yang ada
  const product = useQuery(api.shop.getProductById, { id: productId });

  if (product === undefined) {
    return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-brand"/></div>;
  }

  if (product === null) {
    return <div className="p-10 text-center text-danger">Produk tidak ditemukan.</div>;
  }

  // Render Form dengan mode "edit" dan data awal
  return (
      <ProductForm mode="edit" initialData={product} />
  );
}