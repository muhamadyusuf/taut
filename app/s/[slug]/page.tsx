"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ShoppingCart, Plus, Minus, Trash2, Loader2, Store, Package, ImageOff } from "lucide-react";

// --- MIDTRANS SNAP HOOK ---
const useSnapScript = (isProduction: boolean, clientKey: string) => {
  useEffect(() => {
    if (!clientKey) return;
    const snapSrc = isProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";
    if (!document.getElementById("midtrans-script")) {
      const script = document.createElement("script");
      script.src = snapSrc;
      script.id = "midtrans-script";
      script.setAttribute("data-client-key", clientKey);
      document.body.appendChild(script);
    }
  }, [isProduction, clientKey]);
};

// --- SAFE IMAGE URL VALIDATOR ---
function isSafeImageUrl(url?: string | null): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// --- THEME CONFIG ---
type ThemeKey = "classic" | "dark" | "minimal";

type ThemeTokens = {
  pageBg: string;
  headerBg: string;
  headerText: string;
  headerSub: string;
  logoBg: string;
  divider: string;
  cardBg: string;
  cardTitle: string;
  cardDesc: string;
  descBtn: string;
  priceTxt: string;
  stockBadge: string;
  outBadge: string;
  btnAdd: string;
  btnQtyWrap: string;
  btnQtyText: string;
  btnQtyCtrl: string;
  cartFloat: string;
  cartCountBadge: string;
  emptyIcon: string;
  emptyText: string;
  imgPlaceholderBg: string;
  imgPlaceholderText: string;
  modalOverlay: string;
  modalBg: string;
  modalHeader: string;
  modalItemBg: string;
  modalInput: string;
  modalFooterBg: string;
  modalBtn: string;
  modalTotal: string;
  closeBtn: string;
};

const THEMES: Record<ThemeKey, ThemeTokens> = {
  classic: {
    pageBg: "bg-gray-100",
    headerBg: "bg-white shadow-sm border-b border-gray-200",
    headerText: "text-gray-900",
    headerSub: "text-gray-500",
    logoBg: "bg-blue-100 text-blue-600",
    divider: "border-gray-100",
    cardBg: "bg-white border border-gray-200 shadow-sm hover:shadow-md",
    cardTitle: "text-gray-900",
    cardDesc: "text-gray-500",
    descBtn: "text-blue-500 hover:text-blue-700",
    priceTxt: "text-blue-600",
    stockBadge: "text-green-600 bg-green-50",
    outBadge: "text-red-500 bg-red-50",
    btnAdd: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200",
    btnQtyWrap: "bg-blue-50 border border-blue-200",
    btnQtyText: "text-blue-700",
    btnQtyCtrl: "bg-white border border-gray-200 hover:bg-gray-100 text-gray-700",
    cartFloat: "bg-blue-600 hover:bg-blue-700 text-white shadow-2xl shadow-blue-500/40",
    cartCountBadge: "bg-white text-blue-600",
    emptyIcon: "text-gray-300",
    emptyText: "text-gray-400",
    imgPlaceholderBg: "from-gray-100 to-gray-200",
    imgPlaceholderText: "text-gray-400",
    modalOverlay: "bg-black/60",
    modalBg: "bg-white",
    modalHeader: "border-b border-gray-200 text-gray-900",
    modalItemBg: "bg-gray-50",
    modalInput: "border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-blue-500",
    modalFooterBg: "bg-gray-50 border-t border-gray-200",
    modalBtn: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30",
    modalTotal: "text-blue-600",
    closeBtn: "text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200",
  },
  dark: {
    pageBg: "bg-gray-900",
    headerBg: "bg-gray-800 border-b border-gray-700",
    headerText: "text-gray-100",
    headerSub: "text-gray-400",
    logoBg: "bg-amber-900/50 text-amber-400",
    divider: "border-gray-700",
    cardBg: "bg-gray-800 border border-gray-700 hover:border-gray-500 shadow-xl",
    cardTitle: "text-gray-100",
    cardDesc: "text-gray-400",
    descBtn: "text-amber-400 hover:text-amber-300",
    priceTxt: "text-amber-400",
    stockBadge: "text-emerald-400 bg-emerald-900/40",
    outBadge: "text-red-400 bg-red-900/40",
    btnAdd: "bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold",
    btnQtyWrap: "bg-gray-700 border border-gray-600",
    btnQtyText: "text-amber-400",
    btnQtyCtrl: "bg-gray-600 border border-gray-500 hover:bg-gray-500 text-gray-200",
    cartFloat: "bg-amber-500 hover:bg-amber-400 text-gray-900 shadow-2xl shadow-amber-900/60",
    cartCountBadge: "bg-gray-900 text-amber-400",
    emptyIcon: "text-gray-700",
    emptyText: "text-gray-500",
    imgPlaceholderBg: "from-gray-700 to-gray-800",
    imgPlaceholderText: "text-gray-500",
    modalOverlay: "bg-black/80",
    modalBg: "bg-gray-800",
    modalHeader: "border-b border-gray-700 text-gray-100",
    modalItemBg: "bg-gray-700",
    modalInput: "border border-gray-600 bg-gray-700 text-gray-100 placeholder:text-gray-400 focus:ring-amber-500",
    modalFooterBg: "bg-gray-900 border-t border-gray-700",
    modalBtn: "bg-amber-500 hover:bg-amber-400 text-gray-900 shadow-amber-900/30",
    modalTotal: "text-amber-400",
    closeBtn: "text-gray-400 hover:text-gray-200 bg-gray-700 hover:bg-gray-600",
  },
  minimal: {
    pageBg: "bg-stone-50",
    headerBg: "bg-stone-50 border-b border-stone-200",
    headerText: "text-stone-900",
    headerSub: "text-stone-500",
    logoBg: "bg-stone-200 text-stone-600",
    divider: "border-stone-100",
    cardBg: "bg-white border border-stone-100 hover:shadow-md",
    cardTitle: "text-stone-900",
    cardDesc: "text-stone-500",
    descBtn: "text-stone-600 hover:text-stone-900",
    priceTxt: "text-stone-900 font-extrabold",
    stockBadge: "text-teal-700 bg-teal-50",
    outBadge: "text-rose-600 bg-rose-50",
    btnAdd: "bg-stone-900 hover:bg-stone-700 text-white",
    btnQtyWrap: "bg-stone-100 border border-stone-200",
    btnQtyText: "text-stone-800",
    btnQtyCtrl: "bg-white border border-stone-200 hover:bg-stone-50 text-stone-700",
    cartFloat: "bg-stone-900 hover:bg-stone-700 text-white shadow-xl shadow-stone-900/30",
    cartCountBadge: "bg-white text-stone-900",
    emptyIcon: "text-stone-300",
    emptyText: "text-stone-400",
    imgPlaceholderBg: "from-stone-100 to-stone-200",
    imgPlaceholderText: "text-stone-400",
    modalOverlay: "bg-black/50",
    modalBg: "bg-white",
    modalHeader: "border-b border-stone-200 text-stone-900",
    modalItemBg: "bg-stone-50",
    modalInput: "border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:ring-stone-500",
    modalFooterBg: "bg-stone-50 border-t border-stone-200",
    modalBtn: "bg-stone-900 hover:bg-stone-700 text-white shadow-stone-900/20",
    modalTotal: "text-stone-900",
    closeBtn: "text-stone-400 hover:text-stone-700 bg-stone-100 hover:bg-stone-200",
  },
};

// --- TYPES ---
interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  stock: number;
}

interface Product {
  _id: string;
  title: string;
  price: number;
  description: string;
  imageUrl?: string;
  stock: number;
}

interface SnapConfig {
  isProduction: boolean;
  clientKey: string;
  token: string;
}

// --- PRODUCT IMAGE COMPONENT ---
function ProductImage({ imageUrl, title, t }: { imageUrl?: string; title: string; t: ThemeTokens }) {
  const [error, setError] = useState(false);
  const safe = isSafeImageUrl(imageUrl);

  if (!safe || error) {
    return (
      <div className={`w-full h-56 bg-linear-to-br ${t.imgPlaceholderBg} flex flex-col items-center justify-center gap-2 ${t.imgPlaceholderText}`}>
        {error ? <ImageOff size={28} /> : <Package size={28} />}
        <span className="text-xs">{error ? "Gambar tidak tersedia" : "Tanpa gambar"}</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt={title}
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
      className="w-full h-56 object-cover"
    />
  );
}

// --- MAIN PAGE ---
export default function PublicStorePage() {
  const params = useParams();
  const shopSlug = params.slug as string;

  const shop = useQuery(api.shop.getShopBySlug, { slug: shopSlug });
  const products = useQuery(
    api.shop.getProductsBySeller,
    shop ? { userId: shop.userId } : "skip"
  );

  const createTransaction = useAction(api.shopActions.createTransaction);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [expandedDesc, setExpandedDesc] = useState<Record<string, boolean>>({});

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [snapConfig, setSnapConfig] = useState<SnapConfig | null>(null);

  useSnapScript(snapConfig?.isProduction ?? false, snapConfig?.clientKey ?? "");

  // Resolve active theme
  const rawTheme = shop?.theme ?? "classic";
  const themeKey: ThemeKey = rawTheme in THEMES ? (rawTheme as ThemeKey) : "classic";
  const t = THEMES[themeKey];

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product._id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Stok "${product.title}" hanya tersisa ${product.stock}.`);
          return prev;
        }
        return prev.map(item =>
          item.id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      if (product.stock <= 0) return prev;
      return [...prev, { id: product._id, title: product.title, price: product.price, quantity: 1, stock: product.stock }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQty = (id: string, delta: number, maxStock?: number) => {
    setCart(prev => prev.flatMap(item => {
      if (item.id !== id) return [item];
      const newQty = Math.min(item.quantity + delta, maxStock ?? item.quantity);
      if (newQty <= 0) return [];
      return [{ ...item, quantity: newQty }];
    }));
  };

  const totalAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const getCartQty = (id: string) => cart.find(i => i.id === id)?.quantity ?? 0;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;
    setIsLoading(true);
    try {
      const itemsPayload = cart.map(item => ({
        productId: item.id as Id<"products">,
        quantity: item.quantity,
      }));
      const result = await createTransaction({
        items: itemsPayload,
        buyerName,
        buyerEmail,
        buyerPhone,
        sellerId: shop.userId,
      });
      setSnapConfig(result);
      setTimeout(() => {
        window.snap.pay(result.token, {
          onSuccess: () => { alert("Pembayaran Sukses!"); setCart([]); setIsCheckoutOpen(false); },
          onPending: () => alert("Menunggu Pembayaran..."),
          onError: () => alert("Pembayaran Gagal!"),
          onClose: () => alert("Popup ditutup"),
        });
      }, 1000);
    } catch (err: Error | unknown) {
      const message = err instanceof Error ? err.message : "Kesalahan tidak diketahui";
      alert("Checkout Gagal: " + message);
    } finally {
      setIsLoading(false);
    }
  };

  if (shop === undefined || products === undefined) return (
    <div className={`h-screen flex items-center justify-center ${t.pageBg}`}>
      <div className={`flex flex-col items-center gap-3 ${t.headerSub}`}>
        <Loader2 className="animate-spin" size={32} />
        <span className="text-sm">Memuat toko...</span>
      </div>
    </div>
  );

  if (shop === null) return (
    <div className={`h-screen flex items-center justify-center ${t.pageBg}`}>
      <div className="text-center">
        <Store size={48} className={`mx-auto mb-3 ${t.emptyIcon}`} />
        <p className={`font-medium ${t.emptyText}`}>Toko tidak ditemukan.</p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${t.pageBg} pb-28`}>

      {/* ── HEADER TOKO ── */}
      <div className={t.headerBg}>
        <div className="max-w-4xl mx-auto px-4 py-10 flex flex-col items-center text-center">
          {isSafeImageUrl(shop.logoUrl) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shop.logoUrl!}
              alt="Logo"
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2 border-white/20 shadow-lg"
            />
          ) : (
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg ${t.logoBg}`}>
              <Store size={32} />
            </div>
          )}
          <h1 className={`text-2xl font-bold tracking-tight ${t.headerText}`}>
            {shop.shopName || "Toko Tanpa Nama"}
          </h1>
          <p className={`text-sm mt-2 max-w-md leading-relaxed ${t.headerSub}`}>
            {shop.description || "Selamat datang di toko resmi kami."}
          </p>
        </div>
      </div>

      {/* ── LIST PRODUK ── */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {products.length === 0 ? (
          <div className={`text-center py-20 ${t.emptyText}`}>
            <Package size={48} className={`mx-auto mb-3 opacity-40 ${t.emptyIcon}`} />
            <p className="font-medium">Belum ada produk tersedia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {products.map((product) => {
              const qty = getCartQty(product._id);
              const isExpanded = expandedDesc[product._id] ?? false;
              const longDesc = product.description.length > 400;

              return (
                <div
                  key={product._id}
                  className={`rounded-2xl overflow-hidden flex flex-col transition-all duration-200 ${t.cardBg}`}
                >
                  {/* GAMBAR */}
                  <div className="overflow-hidden">
                    <ProductImage imageUrl={product.imageUrl} title={product.title} t={t} />
                  </div>

                  {/* INFO */}
                  <div className={`p-4 flex-1 flex flex-col gap-2 min-h-55 border-t ${t.divider}`}>
                    <h3 className={`font-bold text-base leading-snug ${t.cardTitle}`}>{product.title}</h3>

                    {/* DESKRIPSI */}
                    <div className={`text-sm leading-relaxed ${t.cardDesc}`}>
                      <p className={`whitespace-pre-wrap${!isExpanded && longDesc ? " line-clamp-3" : ""}`}>
                        {product.description}
                      </p>
                      {longDesc && (
                        <button
                          onClick={() => setExpandedDesc(prev => ({ ...prev, [product._id]: !isExpanded }))}
                          className={`text-xs font-medium mt-1 focus:outline-none ${t.descBtn}`}
                        >
                          {isExpanded ? "Sembunyikan" : "Selengkapnya"}
                        </button>
                      )}
                    </div>

                    {/* HARGA & STOK */}
                    <div className={`mt-auto pt-3 flex items-center justify-between border-t ${t.divider}`}>
                      <span className={`font-bold text-base ${t.priceTxt}`}>
                        Rp {product.price.toLocaleString("id-ID")}
                      </span>
                      {product.stock > 0 ? (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.stockBadge}`}>
                          Stok {product.stock}
                        </span>
                      ) : (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.outBadge}`}>
                          Habis
                        </span>
                      )}
                    </div>
                  </div>

                  {/* TOMBOL CART */}
                  <div className={`px-4 pb-4 pt-1 border-t ${t.divider}`}>
                    {qty === 0 ? (
                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                        className={`w-full mt-2 py-2.5 rounded-xl font-bold text-sm transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${t.btnAdd}`}
                      >
                        <Plus size={16} /> Tambah ke Keranjang
                      </button>
                    ) : (
                      <div className={`mt-2 flex items-center justify-between rounded-xl px-3 py-1.5 ${t.btnQtyWrap}`}>
                        <button
                          onClick={() => updateQty(product._id, -1, product.stock)}
                          className={`p-1.5 rounded-lg transition ${t.btnQtyCtrl}`}
                        >
                          <Minus size={14} />
                        </button>
                        <span className={`font-bold text-sm w-6 text-center ${t.btnQtyText}`}>{qty}</span>
                        <button
                          onClick={() => updateQty(product._id, 1, product.stock)}
                          className={`p-1.5 rounded-lg transition ${t.btnQtyCtrl}`}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── FLOATING CART BUTTON ── */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4 z-50">
          <button
            onClick={() => setIsCheckoutOpen(true)}
            className={`rounded-full px-6 py-3.5 flex items-center gap-4 transition transform hover:-translate-y-0.5 active:scale-95 ${t.cartFloat}`}
          >
            <div className="flex items-center gap-2 font-bold">
              <ShoppingCart size={20} />
              <span className={`text-xs font-extrabold rounded-full w-5 h-5 flex items-center justify-center ${t.cartCountBadge}`}>
                {totalItems}
              </span>
              <span>Item</span>
            </div>
            <div className="h-4 w-px bg-current opacity-30"></div>
            <span className="font-bold">Rp {totalAmount.toLocaleString("id-ID")}</span>
          </button>
        </div>
      )}

      {/* ── CHECKOUT MODAL ── */}
      {isCheckoutOpen && (
        <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm ${t.modalOverlay}`}>
          <div className={`w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl ${t.modalBg}`}>

            {/* Modal Header */}
            <div className={`p-5 flex justify-between items-center ${t.modalHeader}`}>
              <div>
                <h2 className="font-bold text-lg">Keranjang Belanja</h2>
                <p className={`text-xs ${t.headerSub}`}>
                  {totalItems} item &bull; Rp {totalAmount.toLocaleString("id-ID")}
                </p>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className={`rounded-full p-1.5 transition ${t.closeBtn}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.map((item) => (
                <div key={item.id} className={`flex items-center justify-between gap-3 rounded-xl p-3 ${t.modalItemBg}`}>
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold text-sm truncate ${t.cardTitle}`}>{item.title}</div>
                    <div className={`text-xs ${t.headerSub}`}>@ Rp {item.price.toLocaleString("id-ID")}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => updateQty(item.id, -1, item.stock)} className={`p-1 rounded-lg ${t.btnQtyCtrl}`}>
                      <Minus size={12} />
                    </button>
                    <span className={`font-mono text-sm w-5 text-center font-bold ${t.btnQtyText}`}>{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, 1, item.stock)} className={`p-1 rounded-lg ${t.btnQtyCtrl}`}>
                      <Plus size={12} />
                    </button>
                    <button onClick={() => removeFromCart(item.id)} className="ml-1 text-red-400 hover:text-red-500 p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout Form */}
            <div className={`p-4 space-y-4 rounded-b-2xl sm:rounded-b-xl ${t.modalFooterBg}`}>
              <div className="flex justify-between font-bold text-base">
                <span className={t.cardTitle}>Total Pembayaran</span>
                <span className={t.modalTotal}>Rp {totalAmount.toLocaleString("id-ID")}</span>
              </div>

              <form onSubmit={handleCheckout} className="space-y-3">
                <input
                  required
                  placeholder="Nama Lengkap"
                  className={`w-full rounded-xl px-4 py-2.5 text-sm focus:ring-2 outline-none ${t.modalInput}`}
                  value={buyerName}
                  onChange={e => setBuyerName(e.target.value)}
                />
                <input
                  required
                  type="email"
                  placeholder="Alamat Email"
                  className={`w-full rounded-xl px-4 py-2.5 text-sm focus:ring-2 outline-none ${t.modalInput}`}
                  value={buyerEmail}
                  onChange={e => setBuyerEmail(e.target.value)}
                />
                <input
                  required
                  type="tel"
                  placeholder="No. WhatsApp (08xxx)"
                  className={`w-full rounded-xl px-4 py-2.5 text-sm focus:ring-2 outline-none ${t.modalInput}`}
                  value={buyerPhone}
                  onChange={e => setBuyerPhone(e.target.value)}
                />
                <button
                  disabled={isLoading}
                  className={`w-full py-3.5 rounded-xl font-bold disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg transition active:scale-95 ${t.modalBtn}`}
                >
                  {isLoading
                    ? <Loader2 className="animate-spin" />
                    : <><ShoppingCart size={18} /> Bayar Sekarang</>
                  }
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
