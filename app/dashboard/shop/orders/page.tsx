"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, ShoppingCart } from "lucide-react";

export default function OrdersPage() {
  const orders = useQuery(api.shop.getMyOrders);

  if (orders === undefined) return <div className="p-8"><Loader2 className="animate-spin"/></div>;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {orders.length === 0 ? (
        <div className="p-10 text-center flex flex-col items-center text-gray-500 gap-2">
            <ShoppingCart className="opacity-20 w-12 h-12"/>
            Belum ada penjualan. Bagikan link produk Anda!
        </div>
      ) : (
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pembeli</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tanggal</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-xs font-mono text-gray-500">
                    {order.midtransOrderId}
                </td>
                <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">{order.buyerName}</div>
                    <div className="text-xs text-gray-500">{order.buyerEmail}</div>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    Rp {order.amount.toLocaleString("id-ID")}
                </td>
                <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase
                        ${order.status === 'paid' || order.status === 'settlement' ? 'bg-green-100 text-green-700' : 
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}
                    `}>
                        {order.status === 'settlement' ? 'PAID' : order.status}
                    </span>
                </td>
                <td className="px-6 py-4 text-right text-xs text-gray-500">
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