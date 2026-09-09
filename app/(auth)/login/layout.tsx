'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';

// ✅ Use this layout to wrap login & register pages
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-yellow-50 to-white relative overflow-hidden p-16">
      {/* Floating glow background */}
      <motion.div
        className="absolute -top-20 -left-20 w-96 h-96 bg-orange-300/30 rounded-full blur-3xl"
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-yellow-200/30 rounded-full blur-3xl"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      {/* CARD CONTAINER */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col sm:flex-row w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-orange-100"
      >
        {/* LEFT SIDE — DECORATION */}
        <div className="relative hidden sm:flex sm:w-2/5 lg:w-1/2 w-full bg-gradient-to-br from-orange-500 via-orange-400 to-yellow-300 text-white flex-col justify-between items-center p-10">
          {/* Logo & tagline */}
          <div className="text-center space-y-3">
            {/* <Image
              src="/img/prepster-logo.png"
              alt="Prepster Logo"
              width={70}
              height={70}
              className="mx-auto"
            /> */}
            <h1 className="text-4xl font-extrabold italic drop-shadow-md">AR Projects</h1>
            <p className="text-white/90 leading-relaxed text-sm sm:text-base">
              AR Management <br />
              lebih seru dan terarah 🎯
            </p>
          </div>

          {/* Illustration */}
          <div className="w-full flex justify-center mt-8 lg:mt-0">
            <Image
              src="/img/student-study.png"
              alt="AR Illustration"
              width={280}
              height={280}
              className="object-contain drop-shadow-xl"
            />
          </div>

          {/* Footer */}
          <p className="text-xs text-white/70 mt-6 text-center">
            © 2026 AR Management — AR Sukses!
          </p>
        </div>

        {/* RIGHT SIDE — CONTENT SLOT */}
        <main className="flex justify-center items-center w-full lg:w-1/2 bg-white p-6">
          {children}
        </main>
      </motion.div>
    </section>
  );
}
