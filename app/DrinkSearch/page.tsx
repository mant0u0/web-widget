"use client";

import React, { useState, useEffect } from "react";
import shopsData, { DrinkShop } from "./dataShops";

export default function DrinkSearchPage() {
  // 狀態管理
  const [searchInput, setSearchInput] = useState("");
  const [filteredShops, setFilteredShops] = useState<DrinkShop[]>(shopsData);
  const [selectedShop, setSelectedShop] = useState<DrinkShop | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // 添加淡入淡出的動畫樣式
  const fadeAnimationStyles = `
    @keyframes contentFadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes contentFadeOut {
      from { opacity: 1; transform: scale(1); }
      to { opacity: 0; transform: scale(0.95); }
    }
    @keyframes overlayFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes overlayFadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    .animate-content-fadeIn {
      animation: contentFadeIn 0.3s ease-out forwards;
    }
    .animate-content-fadeOut {
      animation: contentFadeOut 0.2s ease-in forwards;
    }
    .modal-overlay {
      animation: overlayFadeIn 0.2s ease-out;
    }
    .modal-overlay.closing {
      animation: overlayFadeOut 0.2s ease-in forwards;
    }
    
    /* 修復卷軸問題 */
    html, body {
      height: 100%;
      overflow: auto;
    }
    #root {
      min-height: 100%;
    }
  `;

  // 即時搜尋：當搜尋輸入變化時，自動過濾結果
  useEffect(() => {
    if (!searchInput.trim()) {
      setFilteredShops(shopsData);
    } else {
      const filtered = shopsData.filter((shop) =>
        shop.name.toLowerCase().includes(searchInput.toLowerCase()),
      );
      setFilteredShops(filtered);
    }
  }, [searchInput]);

  // 顯示店家詳細資料
  const handleShopClick = (shopName: string) => {
    const shop = shopsData.find((s) => s.name === shopName);
    if (shop) {
      setSelectedShop(shop);
      setIsModalOpen(true);
    }
  };

  // 關閉模態視窗
  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsClosing(false);
    }, 200);
  };

  // 清除搜尋輸入
  const clearSearch = () => {
    setSearchInput("");
  };

  return (
    <div className="min-h-screen bg-stone-200">
      {/* 注入自定義動畫樣式 */}
      <style dangerouslySetInnerHTML={{ __html: fadeAnimationStyles }} />

      {/* 頁頭 */}
      <header className="border-b border-stone-600 bg-stone-500 bg-gradient-to-r py-8 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-2 text-4xl font-bold">飲料店查詢系統</h1>
          <p className="text-lg opacity-90">尋找您喜愛的飲料店</p>
        </div>
      </header>

      {/* 主要內容 */}
      <main className="container mx-auto px-4 py-8">
        {/* 搜尋欄 */}
        <div className="mb-10 flex justify-center">
          <div className="relative w-full max-w-md">
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-stone-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="輸入飲料店名稱..."
                className="w-full rounded-xl border border-stone-400 bg-white py-3 pl-12 pr-10 focus:border-stone-500 focus:outline-none focus:ring-4 focus:ring-stone-300"
              />
              {searchInput && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transform text-stone-400 hover:text-gray-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 搜尋結果 */}
        {filteredShops.length === 0 ? (
          <div className="py-12 text-center text-lg text-gray-500">
            找不到符合「{searchInput}」的飲料店，請嘗試其他關鍵字
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredShops.map((shop, index) => (
              <div
                key={index}
                onClick={() => handleShopClick(shop.name)}
                className="group transform cursor-pointer overflow-hidden rounded-xl border-4 border-[#ffffff] bg-white shadow-[0_0_0_1px_rgb(0,0,0,0.3)] transition-all duration-300"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={"/images/" + shop.image}
                    alt={shop.name}
                    className="pointer-events-none z-[-1] h-full w-full rounded-sm object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-md font-semibold text-stone-700">
                    {shop.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 店家詳細資料模態視窗 */}
      {isModalOpen && (
        <div
          className={`modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm ${isClosing ? "closing" : ""}`}
          onClick={closeModal}
        >
          <div
            className={`animate-content-fadeIn w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            {selectedShop && (
              <>
                <div className="relative h-[240px]">
                  <div
                    className="h-[80%] w-full"
                    style={{ background: selectedShop.color }}
                  ></div>
                  {/* 絕對定位 */}
                  <div className="absolute bottom-0 left-1/2 aspect-square w-[160px] -translate-x-1/2 overflow-hidden rounded-xl border-4 border-[#ffffff] shadow-[0_0_0_1px_rgb(0,0,0,0.3)]">
                    <img
                      src={"/images/" + selectedShop.image}
                      alt={selectedShop.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                <div className="p-4">
                  <h2 className="mb-6 text-center text-2xl font-bold text-stone-600">
                    {selectedShop.name}
                  </h2>

                  <div className="mb-6 space-y-2">
                    {selectedShop.website && (
                      <a
                        href={selectedShop.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 p-3 font-medium text-white transition-all hover:opacity-90"
                      >
                        <svg
                          className="mr-3 h-6 w-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                          />
                        </svg>
                        官方網站
                      </a>
                    )}
                    {selectedShop.facebook && (
                      <a
                        href={selectedShop.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 p-3 font-medium text-white transition-all hover:opacity-90"
                      >
                        <svg
                          className="mr-3 h-6 w-6"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                        </svg>
                        Facebook
                      </a>
                    )}
                    {selectedShop.instagram && (
                      <a
                        href={selectedShop.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-3 font-medium text-white transition-all hover:opacity-90"
                      >
                        <svg
                          className="mr-3 h-6 w-6"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                        Instagram
                      </a>
                    )}
                    <a
                      href={
                        "https://www.google.com/maps?q=" + selectedShop.name
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center rounded-lg bg-black bg-gradient-to-r p-3 font-medium text-white transition-all hover:opacity-90"
                    >
                      查看地圖
                    </a>
                  </div>

                  <div className="text-center">
                    <button
                      onClick={closeModal}
                      className="rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-800 transition-colors hover:bg-gray-300"
                    >
                      關閉
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
