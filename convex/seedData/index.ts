import { SeedArticle } from "./types";
import { BATCH_01 } from "./batch01";
import { BATCH_02 } from "./batch02";
import { BATCH_03 } from "./batch03";
import { BATCH_04 } from "./batch04";
import { BATCH_05 } from "./batch05";
import { BATCH_06 } from "./batch06";
import { BATCH_07 } from "./batch07";
import { BATCH_08 } from "./batch08";
import { BATCH_09 } from "./batch09";
import { BATCH_10 } from "./batch10";

/**
 * Kalender editorial 100 artikel, disusun sebagai 10 pilar topik.
 *
 * Urutan array = urutan terbit. Pilar sengaja diselang-seling saat dijadwalkan
 * lewat `interleave` di bawah, supaya blog tidak menerbitkan sepuluh artikel
 * QR Code berturut-turut lalu sepuluh artikel keamanan — pola yang terbaca
 * sebagai konten massal, bukan blog yang dikelola.
 */
const BATCHES = [
  BATCH_01,
  BATCH_02,
  BATCH_03,
  BATCH_04,
  BATCH_05,
  BATCH_06,
  BATCH_07,
  BATCH_08,
  BATCH_09,
  BATCH_10,
];

// Ambil satu artikel dari tiap pilar secara bergiliran (round-robin).
function interleave(batches: SeedArticle[][]): SeedArticle[] {
  const result: SeedArticle[] = [];
  const maxLength = Math.max(...batches.map((b) => b.length));

  for (let i = 0; i < maxLength; i++) {
    for (const batch of batches) {
      if (batch[i]) result.push(batch[i]);
    }
  }

  return result;
}

export const SEED_ARTICLES: SeedArticle[] = interleave(BATCHES);

export type { SeedArticle };
