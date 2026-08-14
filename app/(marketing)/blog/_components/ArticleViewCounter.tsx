"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Menambah 1 view saat artikel dibuka. Sudah dibaca pada sesi yang sama tidak
 * dihitung lagi supaya angkanya tidak melonjak karena refresh.
 */
export default function ArticleViewCounter({ slug }: { slug: string }) {
  const incrementViews = useMutation(api.articles.incrementArticleViews);

  useEffect(() => {
    if (!slug) return;

    const key = `article-viewed:${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // sessionStorage bisa diblokir (mode privat) — tetap hitung viewnya
    }

    incrementViews({ slug }).catch(() => {
      // Kegagalan pencatatan view tidak boleh mengganggu pembaca
    });
  }, [slug, incrementViews]);

  return null;
}
