"use client";

import React, { useState, useEffect } from "react";
import shopsData, { DrinkShop } from "./dataShops";
// Import FontAwesome components
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// Import solid icons
import {
  faSearch,
  faTimesCircle,
  faGlobe,
  faMapMarkerAlt,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
// Import brand icons
import { faFacebookF, faInstagram } from "@fortawesome/free-brands-svg-icons";

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
      {/* <header className="border-b border-stone-600 bg-stone-500 bg-gradient-to-r py-8 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-2 text-3xl font-bold">找飲料？</h1>
          <p className="text-lg opacity-90">尋找您喜愛的飲料店</p>
        </div>
      </header> */}

      {/* 主要內容 */}
      <main className="container mx-auto px-4 py-8">
        {/* 搜尋欄 */}
        <div className="mb-10 flex justify-center">
          <div className="relative w-full max-w-md">
            <div className="relative">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-stone-400"
              />
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
                  <FontAwesomeIcon icon={faTimesCircle} className="h-5 w-5" />
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

                  <div className="mb-8 flex items-center justify-center gap-1">
                    {selectedShop.website && (
                      <a
                        className="flex h-[48px] w-[48px] items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100 hover:text-stone-700"
                        href={selectedShop.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FontAwesomeIcon icon={faGlobe} className="text-2xl" />
                      </a>
                    )}

                    {selectedShop.facebook && (
                      <a
                        className="flex h-[48px] w-[48px] items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100 hover:text-stone-700"
                        href={selectedShop.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FontAwesomeIcon
                          icon={faFacebookF}
                          className="text-2xl"
                        />
                      </a>
                    )}

                    {selectedShop.instagram && (
                      <a
                        className="flex h-[48px] w-[48px] items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100 hover:text-stone-700"
                        href={selectedShop.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FontAwesomeIcon
                          icon={faInstagram}
                          className="text-2xl"
                        />
                      </a>
                    )}

                    <a
                      className="flex h-[48px] w-[48px] items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100 hover:text-stone-700"
                      href={
                        "https://www.google.com/maps?q=" + selectedShop.name
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="text-2xl"
                      />
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
