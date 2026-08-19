import { Metadata } from "next";
import FormsClient from "./FormsClient";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";

/** Judul tab ikut bahasa pilihan pengguna, sama seperti isi halamannya. */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: getDictionary(locale).dashboard.pageTitles.forms };
}

export default function Page() {
  return <FormsClient />;
}
