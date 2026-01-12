/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ShoppingCart, Plus, Minus, Trash2, Loader2, Store } from "lucide-react";

// --- HOOK SCRIPT MIDTRANS (Sama seperti sebelumnya) ---
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

// --- TYPE CART ITEM ---
interface CartItem {
    id: string; // Product ID
    title: string;
    price: number;
    quantity: number;
}

// --- TYPE PRODUCT ---
interface Product {
    _id: string;
    title: string;
    price: number;
    description: string;
}

// --- TYPE SNAP CONFIG ---
interface SnapConfig {
    isProduction: boolean;
    clientKey: string;
    token: string;
}

export default function PublicStorePage() {
  const params = useParams();
  const shopSlug = params.slug as string;

  // 1. Fetch Data Toko
  const shop = useQuery(api.shop.getShopBySlug, { slug: shopSlug });
  
  // 2. Fetch Produk (Hanya jalan jika shop ketemu)
  const products = useQuery(api.shop.getProductsBySeller, 
    shop ? { userId: shop.userId } : "skip"
  );

  const createTransaction = useAction(api.shopActions.createTransaction);

  // --- CART STATE ---
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // Checkout Form State
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [snapConfig, setSnapConfig] = useState<SnapConfig | null>(null);

  useSnapScript(snapConfig?.isProduction ?? false, snapConfig?.clientKey ?? "");

  // --- CART FUNCTIONS ---
  const addToCart = (product: Product) => {
    setCart(prev => {
        const existing = prev.find(item => item.id === product._id);
        if (existing) {
            return prev.map(item => item.id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
        }
        return [...prev, { id: product._id, title: product.title, price: product.price, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
        if (item.id === id) {
            const newQty = Math.max(1, item.quantity + delta);
            return { ...item, quantity: newQty };
        }
        return item;
    }));
  };

  const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // --- CHECKOUT PROCESS ---
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;
    setIsLoading(true);

    try {
        // Format cart untuk backend
        const itemsPayload = cart.map(item => ({
            productId: item.id as Id<"products">,
            quantity: item.quantity
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
                onClose: () => alert("Popup ditutup")
            });
        }, 1000);

    } catch (err: Error | unknown) {
        const message = err instanceof Error ? err.message : "Kesalahan tidak diketahui";
        alert("Checkout Gagal: " + message);
    } finally {
        setIsLoading(false);
    }
  };

  // --- UI RENDER ---

  if (shop === undefined || products === undefined) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin"/></div>;
  if (shop === null) return <div className="h-screen flex items-center justify-center">Toko tidak ditemukan.</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
        
        {/* HEADER TOKO */}
        <div className="bg-white shadow-sm border-b pb-8 pt-10 px-4 text-center">
            {shop.logoUrl ? (
                <img src={shop.logoUrl} alt="Logo" className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border" />
            ) : (
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Store size={32} />
                </div>
            )}
            <h1 className="text-2xl font-bold text-gray-900">{shop.shopName || "Toko Tanpa Nama"}</h1>
            <p className="text-gray-500 text-sm mt-1">Selamat datang di toko resmi kami.</p>
        </div>

        {/* LIST PRODUK */}
        <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.length === 0 && <div className="col-span-3 text-center text-gray-400">Belum ada produk.</div>}
            
            {products.map((product) => (
                <div key={product._id} className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col">
                    <div className="p-4 flex-1">
                        <h3 className="font-bold text-gray-900">{product.title}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                        <div className="mt-4 text-lg font-bold text-blue-600">Rp {product.price.toLocaleString("id-ID")}</div>
                    </div>
                    <div className="p-4 bg-gray-50 border-t">
                        <button 
                            onClick={() => addToCart(product)}
                            className="w-full bg-black text-white py-2 rounded-lg font-bold text-sm hover:bg-gray-800 transition active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Plus size={16} /> Tambah
                        </button>
                    </div>
                </div>
            ))}
        </div>

        {/* FLOATING CART BUTTON */}
        {cart.length > 0 && (
            <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4 z-50">
                <button 
                    onClick={() => setIsCheckoutOpen(true)}
                    className="bg-blue-600 text-white shadow-xl rounded-full px-6 py-3 flex items-center gap-4 hover:bg-blue-700 transition transform hover:-translate-y-1"
                >
                    <div className="flex items-center gap-2 font-bold">
                        <ShoppingCart size={20} />
                        <span>{totalItems} Item</span>
                    </div>
                    <div className="h-4 w-px bg-blue-400"></div>
                    <span className="font-bold">Rp {totalAmount.toLocaleString("id-ID")}</span>
                </button>
            </div>
        )}

        {/* CHECKOUT MODAL */}
        {isCheckoutOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl">
                    
                    <div className="p-4 border-b flex justify-between items-center">
                        <h2 className="font-bold text-lg">Keranjang Belanja</h2>
                        <button onClick={() => setIsCheckoutOpen(false)} className="text-gray-400 hover:text-gray-600">Tutup</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {cart.map((item) => (
                            <div key={item.id} className="flex items-center justify-between border-b pb-4">
                                <div>
                                    <div className="font-bold text-sm">{item.title}</div>
                                    <div className="text-xs text-gray-500">@ Rp {item.price.toLocaleString("id-ID")}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => updateQty(item.id, -1)} className="p-1 bg-gray-100 rounded hover:bg-gray-200"><Minus size={14}/></button>
                                    <span className="font-mono text-sm w-4 text-center">{item.quantity}</span>
                                    <button onClick={() => updateQty(item.id, 1)} className="p-1 bg-gray-100 rounded hover:bg-gray-200"><Plus size={14}/></button>
                                    <button onClick={() => removeFromCart(item.id)} className="ml-2 text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 bg-gray-50 border-t space-y-4">
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>Rp {totalAmount.toLocaleString("id-ID")}</span>
                        </div>

                        <form onSubmit={handleCheckout} className="space-y-3">
                            <input 
                                required placeholder="Nama Lengkap" 
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                value={buyerName} onChange={e => setBuyerName(e.target.value)}
                            />
                            <input 
                                required type="email" placeholder="Email" 
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)}
                            />
                            <input 
                                required type="tel" placeholder="No. WhatsApp (08xxx)" 
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)}
                            />
                            <button 
                                disabled={isLoading}
                                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 flex justify-center"
                            >
                                {isLoading ? <Loader2 className="animate-spin"/> : "Bayar Sekarang"}
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        )}

    </div>
  );
}