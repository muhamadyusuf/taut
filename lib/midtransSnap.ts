/**
 * Pemuat Midtrans Snap untuk pembayaran langganan.
 *
 * Bedanya dengan pemuat di halaman toko: di sini client key baru diketahui
 * SETELAH server membuat token, jadi skripnya tidak bisa dipasang saat halaman
 * dibuka. Pemuatan dijanjikan lewat Promise dan menunggu event `load` — bukan
 * menebak dengan setTimeout, yang akan gagal pada koneksi lambat.
 */

export type SnapCallbacks = {
  onSuccess?: (result: unknown) => void;
  onPending?: (result: unknown) => void;
  onError?: (result: unknown) => void;
  onClose?: () => void;
};

type SnapApi = {
  pay: (token: string, callbacks?: SnapCallbacks) => void;
};

const SCRIPT_ID = "midtrans-snap-platform";

function readSnap(): SnapApi | undefined {
  return (globalThis as unknown as { snap?: SnapApi }).snap;
}

export function loadSnap(
  clientKey: string,
  isProduction: boolean
): Promise<SnapApi> {
  return new Promise((resolve, reject) => {
    const existing = readSnap();
    if (existing) return resolve(existing);

    const src = isProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";

    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    // Skrip sudah pernah dipasang tapi objeknya belum siap — cukup ikut
    // menunggu, jangan memasang skrip kedua.
    if (script) {
      script.addEventListener("load", () => {
        const snap = readSnap();
        snap ? resolve(snap) : reject(new Error("Snap gagal dimuat."));
      });
      script.addEventListener("error", () =>
        reject(new Error("Gagal memuat Midtrans Snap."))
      );
      return;
    }

    script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = src;
    script.setAttribute("data-client-key", clientKey);
    script.onload = () => {
      const snap = readSnap();
      snap ? resolve(snap) : reject(new Error("Snap gagal dimuat."));
    };
    script.onerror = () => reject(new Error("Gagal memuat Midtrans Snap."));
    document.body.appendChild(script);
  });
}
