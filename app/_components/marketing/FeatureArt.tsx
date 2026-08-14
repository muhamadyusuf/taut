/**
 * Ilustrasi SVG khusus untuk tiap fitur di landing page.
 *
 * Sengaja tidak memakai ikon dari icon-set umum — tiap gambar dibuat untuk
 * memperagakan apa yang fitur itu lakukan, bukan sekadar melambangkannya.
 * Semua warna memakai token tema, jadi ikut berubah di mode gelap.
 *
 * Animasi hover dikendalikan dari globals.css lewat kelas `art-*`, memanfaatkan
 * `.group` pada kartu induk. Semuanya murni presentasional (tanpa hook),
 * sehingga tetap jadi server component dan nol JavaScript ke browser.
 */

const SVG_PROPS = {
  viewBox: "0 0 260 130",
  className: "h-full w-full text-subtle",
  "aria-hidden": true,
} as const;

/** Custom Slug — URL panjang menyusut jadi tautan pendek. */
export function SlugArt() {
  return (
    <svg {...SVG_PROPS}>
      {/* Dua baris "URL panjang" yang menyusut saat kartu di-hover */}
      <rect
        className="art-anim art-shrink"
        x="30" y="28" width="200" height="9" rx="4.5"
        fill="currentColor" opacity="0.38"
      />
      <rect
        className="art-anim art-shrink"
        style={{ transitionDelay: "70ms" }}
        x="30" y="44" width="152" height="9" rx="4.5"
        fill="currentColor" opacity="0.22"
      />

      {/* Panah proses */}
      <path d="M130 66 v10" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M124 72 l6 6 l6 -6"
        fill="none" stroke="var(--brand)" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
      />

      {/* Hasil akhir */}
      <rect x="64" y="88" width="132" height="30" rx="15" fill="var(--brand)" opacity="0.14" />
      <rect
        x="64" y="88" width="132" height="30" rx="15"
        fill="none" stroke="var(--brand)" strokeWidth="1.5"
      />
      <text
        x="130" y="107" textAnchor="middle"
        fontSize="12.5" fontWeight="700" fill="var(--brand)"
      >
        singkat.in/kamu
      </text>
    </svg>
  );
}

/** Analitik — batang naik dengan garis tren dan riak di puncak. */
export function AnalyticsArt() {
  const bars = [
    { x: 42, h: 26 },
    { x: 76, h: 44 },
    { x: 110, h: 33 },
    { x: 144, h: 60 },
    { x: 178, h: 48 },
    { x: 212, h: 78 },
  ];
  const base = 112;

  return (
    <svg {...SVG_PROPS}>
      {/* Garis dasar */}
      <line x1="30" y1={base} x2="238" y2={base} stroke="currentColor" strokeWidth="1" opacity="0.3" />

      {bars.map((b, i) => {
        const last = i === bars.length - 1;
        return (
          <rect
            key={b.x}
            className="art-anim art-bar"
            style={{ transitionDelay: `${i * 45}ms` }}
            x={b.x} y={base - b.h} width="22" height={b.h} rx="5"
            fill={last ? "var(--brand)" : "currentColor"}
            opacity={last ? 1 : 0.28}
          />
        );
      })}

      {/* Garis tren melewati puncak batang */}
      <polyline
        points={bars.map((b) => `${b.x + 11},${base - b.h - 8}`).join(" ")}
        fill="none" stroke="var(--brand)" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" opacity="0.55"
        strokeDasharray="3 5"
      />

      {/* Titik puncak + riak */}
      <circle className="art-ping" cx="223" cy={base - 78 - 8} r="7" fill="var(--brand)" opacity="0.45" />
      <circle cx="223" cy={base - 78 - 8} r="4.5" fill="var(--brand)" />
    </svg>
  );
}

/** QR Code — modul QR dengan garis pemindai yang bergerak. */
export function QrArt() {
  const CELL = 11;
  const X0 = 80;
  const Y0 = 15;

  // Modul non-finder. "1" digambar, "0" dilewati.
  const ROWS = [
    "000101000",
    "000010000",
    "000110000",
    "010101101",
    "101010011",
    "011011010",
    "000101011",
    "000010110",
    "000111001",
  ];

  const inFinder = (r: number, c: number) =>
    (r < 3 && c < 3) || (r < 3 && c > 5) || (r > 5 && c < 3);

  const finder = (r: number, c: number) => (
    <g key={`f${r}-${c}`}>
      <rect
        x={X0 + c * CELL} y={Y0 + r * CELL}
        width={CELL * 3} height={CELL * 3} rx="4"
        fill="none" stroke="var(--brand)" strokeWidth="3"
      />
      <rect
        x={X0 + (c + 1) * CELL} y={Y0 + (r + 1) * CELL}
        width={CELL} height={CELL} rx="1.5"
        fill="var(--brand)"
      />
    </g>
  );

  return (
    <svg {...SVG_PROPS}>
      {ROWS.map((row, r) =>
        row.split("").map((v, c) =>
          v === "1" && !inFinder(r, c) ? (
            <rect
              key={`${r}-${c}`}
              x={X0 + c * CELL} y={Y0 + r * CELL}
              width={CELL - 2} height={CELL - 2} rx="1.5"
              fill="currentColor" opacity="0.5"
            />
          ) : null
        )
      )}

      {finder(0, 0)}
      {finder(0, 6)}
      {finder(6, 0)}

      {/* Garis pemindai */}
      <rect
        className="art-scan"
        x={X0 - 6} y={Y0} width={CELL * 9 + 12} height="3" rx="1.5"
        fill="var(--brand)"
      />
    </svg>
  );
}

/** Microsite — layar ponsel berisi deretan tombol tautan. */
export function MicrositeArt() {
  return (
    <svg {...SVG_PROPS}>
      {/* Badan ponsel */}
      <rect
        x="99" y="10" width="62" height="110" rx="13"
        fill="var(--card)" stroke="currentColor" strokeWidth="1.5" opacity="0.9"
      />
      {/* Poni */}
      <rect x="120" y="15" width="20" height="3.5" rx="1.75" fill="currentColor" opacity="0.4" />

      {/* Avatar + nama */}
      <circle cx="130" cy="36" r="9" fill="var(--brand)" opacity="0.35" />
      <circle cx="130" cy="36" r="9" fill="none" stroke="var(--brand)" strokeWidth="1.5" />
      <rect x="116" y="50" width="28" height="4.5" rx="2.25" fill="currentColor" opacity="0.45" />

      {/* Tombol tautan yang bergeser berurutan saat di-hover */}
      <rect
        className="art-anim art-pill-1"
        x="107" y="62" width="46" height="13" rx="6.5"
        fill="var(--brand)" opacity="0.85"
      />
      <rect
        className="art-anim art-pill-2"
        x="107" y="80" width="46" height="13" rx="6.5"
        fill="currentColor" opacity="0.3"
      />
      <rect
        className="art-anim art-pill-3"
        x="107" y="98" width="46" height="13" rx="6.5"
        fill="currentColor" opacity="0.2"
      />
    </svg>
  );
}

/** Kategori — tumpukan kartu yang memekar jadi tiga kelompok. */
export function CategoryArt() {
  return (
    <svg {...SVG_PROPS}>
      {/* Dua kartu belakang, memekar ke kiri & kanan saat di-hover */}
      <rect
        className="art-anim art-layer-a"
        x="74" y="42" width="84" height="52" rx="12"
        fill="var(--card)" stroke="currentColor" strokeWidth="1.5" opacity="0.75"
      />
      <rect
        className="art-anim art-layer-c"
        x="102" y="42" width="84" height="52" rx="12"
        fill="var(--card)" stroke="currentColor" strokeWidth="1.5" opacity="0.75"
      />

      {/* Kartu depan */}
      <rect
        x="88" y="34" width="84" height="62" rx="13"
        fill="var(--card)" stroke="var(--brand)" strokeWidth="1.75"
      />
      {/* Label kategori */}
      <rect x="100" y="46" width="30" height="8" rx="4" fill="var(--brand)" opacity="0.55" />
      <rect x="100" y="62" width="48" height="6" rx="3" fill="currentColor" opacity="0.35" />
      <rect x="100" y="74" width="34" height="6" rx="3" fill="currentColor" opacity="0.22" />
    </svg>
  );
}

/** Infrastruktur global — bola dunia dengan meridian berputar dan simpul aktif. */
export function GlobalArt() {
  return (
    <svg {...SVG_PROPS}>
      {/* Garis bola dunia */}
      <circle cx="130" cy="64" r="44" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.45" />
      <ellipse cx="130" cy="64" rx="44" ry="15" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.3" />
      <ellipse cx="130" cy="64" rx="44" ry="31" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.22" />

      {/*
        Meridian yang berputar. Elips ini berpusat tepat di titik bola dunia,
        jadi rotasinya presisi meski `transform-box: fill-box` memakai pusat
        kotak elemen itu sendiri.
      */}
      <ellipse
        className="art-sweep"
        cx="130" cy="64" rx="17" ry="44"
        fill="none" stroke="var(--brand)" strokeWidth="1.4" opacity="0.55"
      />

      {/* Rute antar simpul */}
      <path
        d="M101 41 Q130 18 158 54"
        fill="none" stroke="var(--brand)" strokeWidth="1.75"
        strokeDasharray="3 4" strokeLinecap="round" opacity="0.7"
      />

      {/* Simpul server */}
      <circle cx="101" cy="41" r="4.5" fill="var(--brand)" />
      <circle cx="130" cy="95" r="4.5" fill="var(--brand)" opacity="0.55" />
      <circle className="art-ping" cx="158" cy="54" r="10" fill="var(--brand)" opacity="0.35" />
      <circle cx="158" cy="54" r="4.5" fill="var(--brand)" />
    </svg>
  );
}

/** Terbuka untuk umum — deretan anggota yang memekar, dengan slot kosong. */
export function CommunityArt() {
  const members = [
    { cx: 98, cls: "art-anim art-layer-a", opacity: 0.35 },
    { cx: 124, cls: "", opacity: 0.55 },
    { cx: 150, cls: "art-anim art-layer-c", opacity: 0.8 },
  ];

  return (
    <svg {...SVG_PROPS}>
      {members.map((m) => (
        <g key={m.cx} className={m.cls}>
          <circle cx={m.cx} cy="64" r="19" fill="var(--card)" stroke="currentColor" strokeWidth="1.5" />
          {/* Kepala & bahu */}
          <circle cx={m.cx} cy="58" r="6" fill="var(--brand)" opacity={m.opacity} />
          <path d={`M${m.cx - 9} 77 a9 9 0 0 1 18 0`} fill="var(--brand)" opacity={m.opacity} />
        </g>
      ))}

      {/* Slot terbuka — siapa pun boleh bergabung */}
      <circle className="art-ping" cx="178" cy="64" r="19" fill="var(--brand)" opacity="0.2" />
      <circle
        cx="178" cy="64" r="19"
        fill="none" stroke="var(--brand)" strokeWidth="1.75" strokeDasharray="4 4.5"
      />
      <path
        d="M178 56 v16 M170 64 h16"
        stroke="var(--brand)" strokeWidth="2.25" strokeLinecap="round"
      />
    </svg>
  );
}

/** Keamanan — perisai dengan sapuan radar mengelilinginya. */
export function ShieldArt() {
  return (
    <svg {...SVG_PROPS}>
      {/* Cincin radar statis */}
      <circle cx="130" cy="64" r="52" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.22" />
      <circle cx="130" cy="64" r="38" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.16" />

      {/*
        Sapuan radar: lingkaran penuh dengan dasharray, jadi kotak pembatasnya
        tepat berpusat di titik radar. Ini penting karena `transform-box:
        fill-box` memutar elemen terhadap pusat kotaknya sendiri — kalau pakai
        path wedge, pusat putarannya akan meleset.
      */}
      <circle
        className="art-sweep"
        cx="130" cy="64" r="52"
        fill="none" stroke="var(--brand)" strokeWidth="2.5"
        strokeDasharray="46 281" strokeLinecap="round"
      />

      {/* Riak keluar */}
      <circle className="art-ping" cx="130" cy="64" r="30" fill="var(--brand)" opacity="0.18" />

      {/* Perisai */}
      <path
        d="M130 34 l22 9 v16 c0 15 -9 25 -22 30 c-13 -5 -22 -15 -22 -30 v-16 z"
        fill="var(--brand)" opacity="0.16"
      />
      <path
        d="M130 34 l22 9 v16 c0 15 -9 25 -22 30 c-13 -5 -22 -15 -22 -30 v-16 z"
        fill="none" stroke="var(--brand)" strokeWidth="1.75" strokeLinejoin="round"
      />
      <path
        d="M121 65 l6.5 6.5 l13 -14"
        fill="none" stroke="var(--brand)" strokeWidth="2.75"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}
