"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, ShoppingCart } from "lucide-react";

export default function OrdersPage() {
  const orders = useQuery(api.shop.getMyOrders);

  if (orders === undefined) return <div className="p-8"><Loader2 className="animate-spin"/></div>;

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      {orders.length === 0 ? (
        <div className="p-10 text-center flex flex-col items-center text-muted-foreground gap-2">
            <ShoppingCart className="opacity-20 w-12 h-12"/>
            Belum ada penjualan. Bagikan link produk Anda!
        </div>
      ) : (
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Pembeli</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Total</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Tanggal</th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-muted">
                <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                    {order.midtransOrderId}
                </td>
                <td className="px-6 py-4">
                    <div className="text-sm font-bold text-foreground">{order.buyerName}</div>
                    <div className="text-xs text-muted-foreground">{order.buyerEmail}</div>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-foreground">
                    Rp {order.amount.toLocaleString("id-ID")}
                </td>
                <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase
                        ${order.status === 'paid' || order.status === 'settlement' ? 'bg-success-soft text-success' : 
                          order.status === 'pending' ? 'bg-warning-soft text-warning' : 'bg-danger-soft text-danger'}
                    `}>
                        {order.status === 'settlement' ? 'PAID' : order.status}
                    </span>
                </td>
                <td className="px-6 py-4 text-right text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}