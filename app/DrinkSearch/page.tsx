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

// 動態導入 BubbleTeaBackground 組件以避免 SSR 錯誤
import dynamic from "next/dynamic";

const BubbleTeaBackground = dynamic(() => import("./BubbleTeaBackground"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "100%",
        width: "100%",
        position: "absolute",
        backgroundColor: "#ebcfb4",
      }}
    ></div>
  ),
});

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
      const filtered = shopsData.filter(
        (shop) =>
          shop.name.toLowerCase().includes(searchInput.toLowerCase()) ||
          (shop.name_en &&
            shop.name_en.toLowerCase().includes(searchInput.toLowerCase())),
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
    <div className="min-h-screen bg-[#f5f2e9]">
      {/* 注入自定義動畫樣式 */}
      <style dangerouslySetInnerHTML={{ __html: fadeAnimationStyles }} />

      {/* 頁頭 */}
      <header className="relative overflow-hidden bg-[#ebcfb4] py-[80px]">
        {/* 珍珠奶茶背景 */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <BubbleTeaBackground />
        </div>

        {/* 標題內容 - 確保在動畫上方 */}
        <div className="container relative z-10 mx-auto px-4 text-center text-white drop-shadow-[0_0_5px_#c59f84]">
          <h1 className="mb-2 text-4xl font-bold">飲料店搜尋器</h1>
          <p className="text-lg opacity-90">尋找喜愛的飲料店</p>
        </div>

        {/* 分隔線 */}
        <img
          src="divider.svg"
          alt="分隔線"
          className="absolute bottom-[-2px] left-0 z-10 mx-auto w-[100%]"
        />
      </header>

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
                className="w-full rounded-xl border-[2px] border-[#33333344] bg-white py-3 pl-12 pr-10 shadow-[0_0_0_4px_#33333309] focus:border-[#33333355] focus:outline-none focus:ring-4 focus:ring-[#33333311]"
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
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {filteredShops.map((shop, index) => (
              <div
                key={index}
                onClick={() => handleShopClick(shop.name)}
                className="group transform cursor-pointer overflow-hidden rounded-3xl border-[2px] border-[#33333333] bg-white p-2 shadow-[0_0_0_4px_#33333309] transition-all duration-300 hover:border-[#33333344] hover:shadow-[0_0_0_4px_#33333322]"
              >
                <div className="relative aspect-square overflow-hidden rounded-b-lg rounded-t-2xl">
                  <img
                    src={"/images/" + shop.image}
                    alt={shop.name}
                    className="pointer-events-none h-full w-full object-cover grayscale-[0] saturate-[1] duration-500 group-hover:grayscale-[0.3] group-hover:saturate-[1.6]"
                  />
                  <div className="z-2 absolute inset-0 h-full w-full rounded-b-lg rounded-t-2xl border-[2px] border-[#33333322] transition-opacity duration-300 group-hover:opacity-80"></div>
                </div>
                <div className="pb-2 pt-4 text-center">
                  <h3 className="text-md font-semibold text-stone-700">
                    {shop.name}
                  </h3>
                  {shop.name_en && (
                    <p className="mt-1 text-sm text-stone-400">
                      {shop.name_en}
                    </p>
                  )}
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
                <button
                  onClick={closeModal}
                  className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-[#00000022] hover:bg-[#00000033]"
                >
                  <FontAwesomeIcon
                    icon={faTimes}
                    className="h-6 w-6 text-white"
                  />
                </button>

                <div className="relative h-[240px]">
                  <div
                    className="h-[80%] w-full"
                    style={{ background: selectedShop.color }}
                  ></div>
                  {/* 絕對定位 */}
                  <div className="absolute bottom-0 left-1/2 aspect-square w-[160px] -translate-x-1/2 overflow-hidden rounded-xl border-4 border-[#ffffff] shadow-[0_0_0_4px_#33333333]">
                    <img
                      src={"/images/" + selectedShop.image}
                      alt={selectedShop.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                <div className="p-4">
                  <div className="mb-4 text-center">
                    <h2 className="text-2xl font-bold text-stone-600">
                      {selectedShop.name}
                    </h2>

                    {selectedShop.name_en && (
                      <p className="mt-2 text-sm text-stone-400">
                        {selectedShop.name_en}
                      </p>
                    )}
                  </div>

                  <div className="mb-6 flex items-center justify-center gap-1">
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

                  {selectedShop.menu && (
                    <div className="-mt-1 flex flex-col gap-3">
                      <a
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-stone-100 p-4 hover:bg-stone-200"
                        href={selectedShop.menu}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <p className="text-stone-700">查看價目表</p>
                      </a>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
