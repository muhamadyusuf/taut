// eslint-disable-next-line import/no-anonymous-default-export
export default {
  providers: [
    {
      // Konfigurasi untuk Production (Domain Baru Anda)
      domain: "https://clerk.singkat.in", 
      applicationID: "convex",
    },
    // (Opsional) Biarkan yang lama agar Development tetap jalan
    // Ganti URL di bawah ini dengan URL Clerk Development Anda (dari dashboard Clerk -> API Keys -> Issuer)
    // Biasanya formatnya: https://suited-marmot-12.clerk.accounts.dev
    {
      domain: "https://closing-finch-38.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};