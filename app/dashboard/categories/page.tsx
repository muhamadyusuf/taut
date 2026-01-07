import { Metadata } from "next";
import CategoriesClient from "./CategoriesClient";

export const metadata: Metadata = {
  title: "Kategori",
};

export default function Page() {
  return <CategoriesClient />;
}