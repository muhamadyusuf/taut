import { Metadata } from "next";
import FormsClient from "./FormsClient";

export const metadata: Metadata = {
  title: "Formulir",
};

export default function Page() {
  return <FormsClient />;
}
