"use client";

import { UserProfile } from "@clerk/nextjs";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Account Settings</h2>
        
        {/* Menggunakan Komponen Bawaan Clerk untuk Manage Akun */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <UserProfile 
                appearance={{
                    elements: {
                        rootBox: "w-full",
                        card: "shadow-none border-none w-full",
                        navbar: "hidden", // Sembunyikan navbar clerk agar lebih simple
                        pageScrollBox: "p-0"
                    }
                }}
            />
        </div>

        {/* Contoh Custom Settings App */}
        <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">App Preferences</h3>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between py-2">
                    <div>
                        <p className="font-medium text-gray-800">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive weekly digest of link performance.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ee6123]"></div>
                    </label>
                </div>
            </div>
        </div>
    </div>
  );
}
