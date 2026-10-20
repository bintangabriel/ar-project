'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';

const highlights = [
  'Pengelolaan data AR yang terpusat',
  'Monitoring progres yang jelas dan terukur',
  'Akses aman untuk setiap pengguna',
];

// ✅ Use this layout to wrap login & register pages
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#EEF3F7] to-white p-6 sm:p-10">
      {/* CARD CONTAINER */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-2xl shadow-xl shadow-slate-900/10 overflow-hidden border border-slate-200"
      >
        {/* LEFT SIDE — BRAND PANEL */}
        <div className="relative hidden md:flex md:w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0F2D6B] via-[#123577] to-[#1B4A94] text-white p-12">
          {/* Subtle decorative circles */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#AEC4D4]/10" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[#AEC4D4]/10" />

          {/* Logo */}
          <div className="relative inline-flex self-start rounded-xl bg-white p-3 shadow-lg shadow-black/20">
            <Image
              src="/img/arise.jpeg"
              alt="ARISE"
              width={150}
              height={50}
              priority
              className="object-contain"
            />
          </div>

          {/* Headline */}
          <div className="relative space-y-6">
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight leading-tight">
                Selamat datang di
                <br />
                 <span className="text-[#AEC4D4]">ARISE</span><br />
              </h1>
              <p className="text-[#D6E2EB] text-sm leading-relaxed max-w-xs">
                Kelola proyek AR Anda dengan lebih terstruktur, transparan, dan efisien dalam satu platform.
              </p>
            </div>

            <ul className="space-y-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-white/90">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#AEC4D4]">
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="#0F2D6B"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3 w-3"
                    >
                      <path d="M4 10.5l4 4 8-9" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <p className="relative text-xs text-[#AEC4D4]">
            © 2026 AR Management. All rights reserved.
          </p>
        </div>

        {/* RIGHT SIDE — CONTENT SLOT */}
        <main className="flex justify-center items-center w-full md:w-1/2 bg-white px-6 py-12 sm:px-10">
          {children}
        </main>
      </motion.div>
    </section>
  );
}