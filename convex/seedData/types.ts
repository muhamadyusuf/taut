/**
 * Satu entri kalender editorial. Konten ditulis manual per topik — bukan
 * hasil template yang diputar ulang — supaya tiap artikel menyasar kata kunci
 * yang berbeda dan tidak terbaca sebagai konten massal oleh mesin pencari.
 */
export type SeedArticle = {
  title: string;
  slug: string;
  category: string;
  tags: string[];
  excerpt: string;
  content: string;
};
