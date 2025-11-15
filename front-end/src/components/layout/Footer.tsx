"use client";

import React from "react";
import Link from "next/link";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaGithub,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#111] text-gray-400 py-12 md:py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* Cột 1: Movix*/}
          <div>
            <h3 className="text-white font-semibold mb-4">Movix</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition">
                  Đăng ký
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition">
                  Đăng nhập
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 2: Khám Phá  */}
          <div>
            <h3 className="text-white font-semibold mb-4">Khám Phá</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/filter" className="hover:text-white transition">
                  Tất cả phim
                </Link>
              </li>
              <li>
                <Link href="/filter?type=movie" className="hover:text-white transition">
                  Phim lẻ
                </Link>
              </li>
              <li>
                <Link href="/filter?type=tv" className="hover:text-white transition">
                  Phim bộ
                </Link>
              </li>
              <li>
                <Link href="/#genres" className="hover:text-white transition">
                  Theo thể loại
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Tính Năng  */}
          <div>
            <h3 className="text-white font-semibold mb-4">Tính Năng</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/party" className="hover:text-white transition">
                  Xem Chung (Party)
                </Link>
              </li>
              <li>
                <button className="hover:text-white transition text-left">
                  Chatbot AI
                </button>
              </li>
              <li>
                <Link href="/favorites" className="hover:text-white transition">
                  Yêu thích của tôi
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: Kết Nối */}
          <div>
            <h3 className="text-white font-semibold mb-4">Kết Nối</h3>
            <div className="flex gap-4">
              <a
                href="#"
                aria-label="Facebook"
                className="bg-[#222] p-3 rounded-full hover:bg-red-600 transition text-white"
              >
                <FaFacebookF />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="bg-[#222] p-3 rounded-full hover:bg-red-600 transition text-white"
              >
                <FaInstagram />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="bg-[#222] p-3 rounded-full hover:bg-red-600 transition text-white"
              >
                <FaTwitter />
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="bg-[#222] p-3 rounded-full hover:bg-red-600 transition text-white"
              >
                <FaYoutube />
              </a>
            </div>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="border-t border-gray-700 mt-10 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
            <p className="text-center sm:text-left mb-2 sm:mb-0">
              © {new Date().getFullYear()} Movix. Đồ án 1 - UIT.
            </p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition">
                Terms of Use
              </a>
              <a href="#" className="hover:text-white transition">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}