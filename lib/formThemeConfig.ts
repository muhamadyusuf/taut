interface FormTheme {
  label: string;
  swatch: string; // preview warna kecil di theme picker
  headerBar: string; // aksen warna di atas kartu header formulir
  pageBg: string; // warna latar halaman pengisian formulir
  button: string; // tombol "Kirim" / "Berikutnya"
}

export const FORM_THEMES: Record<string, FormTheme> = {
  "default-purple": {
    label: "Ungu Klasik",
    swatch: "bg-[#673ab7]",
    headerBar: "border-t-[#673ab7]",
    pageBg: "bg-[#f2ecff]",
    button: "bg-[#673ab7] hover:bg-[#5a2fa3] text-white",
  },
  "ocean-blue": {
    label: "Biru Laut",
    swatch: "bg-[#0b57d0]",
    headerBar: "border-t-[#0b57d0]",
    pageBg: "bg-[#e8f0fe]",
    button: "bg-[#0b57d0] hover:bg-[#0a4bb8] text-white",
  },
  "forest-green": {
    label: "Hijau Hutan",
    swatch: "bg-[#188038]",
    headerBar: "border-t-[#188038]",
    pageBg: "bg-[#e6f4ea]",
    button: "bg-[#188038] hover:bg-[#146b2e] text-white",
  },
  "sunset-orange": {
    label: "Oranye Senja",
    swatch: "bg-[#e8710a]",
    headerBar: "border-t-[#e8710a]",
    pageBg: "bg-[#fef2e6]",
    button: "bg-[#e8710a] hover:bg-[#cc6209] text-white",
  },
  "rose-red": {
    label: "Merah Mawar",
    swatch: "bg-[#c5221f]",
    headerBar: "border-t-[#c5221f]",
    pageBg: "bg-[#fce8e6]",
    button: "bg-[#c5221f] hover:bg-[#a91d1a] text-white",
  },
  "midnight": {
    label: "Malam Gelap",
    swatch: "bg-[#202124]",
    headerBar: "border-t-[#202124]",
    pageBg: "bg-[#e8eaed]",
    button: "bg-[#202124] hover:bg-[#3c4043] text-white",
  },
};

export const DEFAULT_FORM_THEME = "default-purple";

export function getFormTheme(key?: string): FormTheme {
  return FORM_THEMES[key || DEFAULT_FORM_THEME] || FORM_THEMES[DEFAULT_FORM_THEME];
}
