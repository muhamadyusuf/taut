import { MetadataRoute } from 'next';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://singkat.in';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: `${baseUrl}/sign-in`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    // Tambahkan halaman publik lain jika ada
  ];

  // Artikel yang sudah terbit ikut masuk sitemap
  try {
    const articles = await fetchQuery(api.articles.getPublishedArticles, {});
    const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
      url: `${baseUrl}/blog/${a.slug}`,
      lastModified: new Date(a.publishedAt),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
    return [...staticRoutes, ...articleRoutes];
  } catch {
    // Kalau Convex tidak bisa dihubungi, sitemap statis tetap terbit
    return staticRoutes;
  }
}
