import Footer from "../_components/marketing/Footer";
import Navbar from "../_components/marketing/Navbar";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8faff]">
      {/* Navbar nempel di atas */}
      <Navbar />
      
      {/* Isi Halaman (Home/About/Contact) */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer nempel di bawah */}
      <Footer />
    </div>
  );
}