"use client";

import React, { useState, useEffect, ChangeEvent } from "react";

// 定義類型
interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

interface Shades {
  [level: string]: string;
}

const ColorShadeGenerator: React.FC = () => {
  const [baseColor, setBaseColor] = useState<string>("#3b82f6"); // 預設藍色
  const [shades, setShades] = useState<Shades>({});
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<string | number | null>(null);
  const [baseColorLevel, setBaseColorLevel] = useState<number>(500); // 預設層級
  const [hueShift, setHueShift] = useState<number>(0); // 整體色相偏移值
  const [gradientHueShift, setGradientHueShift] = useState<number>(0); // 漸層色相偏移值
  const [customLevels, setCustomLevels] = useState<string>(
    "50,100,200,300,400,500,600,700,800,900,950",
  );
  const [showLevelSettings, setShowLevelSettings] = useState<boolean>(false);

  // 十六進制轉 RGB
  const hexToRgb = (hex: string): RGB | null => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  // RGB 轉 HSL
  const rgbToHsl = (r: number, g: number, b: number): HSL => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }

      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  // HSL 轉十六進制
  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;

    const f = (n: number): string => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0");
    };

    return `#${f(0)}${f(8)}${f(4)}`;
  };

  // 獲取自定義層級
  const getLevels = (): number[] => {
    try {
      // 解析自定義層級字符串
      const levels = customLevels
        .split(",")
        .map((level) => level.trim())
        .filter((level) => level !== "")
        .map((level) => parseInt(level, 10))
        .filter((level) => !isNaN(level) && level >= 0 && level <= 1000)
        .sort((a, b) => a - b);

      // 確保至少有一些層級，如果解析失敗，使用默認層級
      return levels.length > 0
        ? levels
        : [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 1000];
    } catch {
      // 出錯時使用默認層級
      return [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 1000];
    }
  };

  // 生成顏色深淺變體
  const generateShades = (): void => {
    const rgb = hexToRgb(baseColor);
    if (!rgb) return;

    // 獲取基本顏色的HSL值
    // let hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    // 應用整體色相偏移
    hsl.h = (hsl.h + hueShift) % 360;
    if (hsl.h < 0) hsl.h += 360; // 處理負數的情況

    // 保存原始HSL用於漸變色相計算
    const baseHsl: HSL = { ...hsl };

    // 檢查是否是極端顏色（接近純白或純黑）
    const isNearWhite = hsl.l > 95;
    const isNearBlack = hsl.l < 5;
    const isLowSaturation = hsl.s < 10;

    // 對於極端顏色，保存原始亮度但調整色相和飽和度
    if ((isNearWhite || isNearBlack) && isLowSaturation) {
      // 使用藍色系作為默認色相，並增加飽和度以確保色彩變化
      baseHsl.h = 210; // 藍色系
      baseHsl.s = 15; // 低飽和度但足以產生色彩變化
    }

    // 獲取要顯示的層級
    const displayLevels = getLevels();

    // 有效層級 (不包括 0 和 1000)
    const validLevels = displayLevels.filter((l) => l > 0 && l < 1000);

    // 確定基準顏色應該對應的層級
    let baseLevel: number;

    if (validLevels.length === 0) {
      // 如果沒有有效層級，使用預設值
      baseLevel = 500;
    } else if (isNearWhite) {
      // 接近白色時，使用最小的有效層級
      baseLevel = Math.min(...validLevels);
    } else if (isNearBlack) {
      // 接近黑色時，使用最大的有效層級
      baseLevel = Math.max(...validLevels);
    } else {
      // 正常顏色，根據亮度找出最接近的層級
      // 先計算在完整 0-1000 範圍內的理想層級
      const idealLevel = 50 + (900 - 50) * (1 - (hsl.l - 10) / 80);

      // 找出自定義層級中最接近的值
      baseLevel = validLevels.reduce((prev, curr) =>
        Math.abs(curr - idealLevel) < Math.abs(prev - idealLevel) ? curr : prev,
      );
    }

    // 計算並存儲所有需要顯示的層級的顏色
    const newShades: Shades = {};

    displayLevels.forEach((level) => {
      if (level === 0) {
        newShades[level] = "#FFFFFF"; // 純白色
        return;
      }

      if (level === 1000) {
        newShades[level] = "#000000"; // 純黑色
        return;
      }

      if (!validLevels.includes(level)) {
        newShades[level] = calculateColorForLevel(
          level,
          baseHsl,
          baseLevel,
          validLevels,
        );
        return;
      }

      newShades[level] = calculateColorForLevel(
        level,
        baseHsl,
        baseLevel,
        validLevels,
      );
    });

    setShades(newShades);
    setBaseColorLevel(baseLevel);
  };

  // 計算特定層級的顏色
  const calculateColorForLevel = (
    level: number,
    baseHsl: HSL,
    baseLevel: number,
    validLevels: number[],
  ): string => {
    let lightness: number;
    let levelHueShift = 0;

    // 找出最小和最大的有效層級（用於計算漸變）
    // const minLevel = Math.min(...validLevels);
    const maxLevel = Math.max(...validLevels);

    const isNearWhite = baseHsl.l > 95;
    const isNearBlack = baseHsl.l < 5;

    if (isNearWhite) {
      // 對於近乎白色的基本顏色，在有效層級內使用線性分佈
      const percentage = level / maxLevel;
      // 從非常接近白色(但不是純白)到較深的顏色
      lightness = 98 - percentage * (98 - 30);
    } else if (isNearBlack) {
      // 對於近乎黑色的基本顏色，在有效層級內使用線性分佈
      const percentage = level / maxLevel;
      // 從較淺的顏色到非常接近黑色(但不是純黑)
      lightness = 70 - percentage * (70 - 2);
    } else if (level === baseLevel) {
      // 基準色使用原始亮度
      lightness = baseHsl.l;
    } else {
      // 查找層級在有效層級中的位置
      const levelIndex = validLevels.indexOf(level);
      const baseIndex = validLevels.indexOf(baseLevel);

      // 層級在基準色之前（淺色方向）
      if (levelIndex < baseIndex) {
        const totalLevels = baseIndex;
        if (totalLevels === 0) return hslToHex(baseHsl.h, baseHsl.s, baseHsl.l);

        const levelPosition = totalLevels - levelIndex;

        // 漸變係數
        const percentage = levelPosition / totalLevels;
        const maxLightness = 93; // 最淺級別最大亮度

        lightness = baseHsl.l + (maxLightness - baseHsl.l) * percentage;

        // 計算淺色方向的色相偏移
        if (gradientHueShift !== 0) {
          levelHueShift = -gradientHueShift * percentage;
        }
      }
      // 層級在基準色之後（深色方向）
      else if (levelIndex > baseIndex) {
        const totalLevels = validLevels.length - 1 - baseIndex;
        if (totalLevels === 0) return hslToHex(baseHsl.h, baseHsl.s, baseHsl.l);

        const levelPosition = levelIndex - baseIndex;

        // 漸變係數
        const percentage = levelPosition / totalLevels;
        const minLightness = 7; // 最深級別最小亮度

        lightness = baseHsl.l - (baseHsl.l - minLightness) * percentage;

        // 計算深色方向的色相偏移
        if (gradientHueShift !== 0) {
          levelHueShift = gradientHueShift * percentage;
        }
      } else {
        // 相等的情況，直接使用基準色亮度
        lightness = baseHsl.l;
      }
    }

    // 應用色相偏移
    const finalHue = (baseHsl.h + levelHueShift) % 360;
    const finalHue360 = finalHue < 0 ? finalHue + 360 : finalHue;

    // 生成十六進制色碼
    return hslToHex(finalHue360, baseHsl.s, lightness);
  };

  // 顏色改變時重新生成色調
  useEffect(() => {
    generateShades();
  }, [baseColor, hueShift, gradientHueShift, customLevels]);

  // 複製色碼到剪貼板
  const copyToClipboard = (text: string, index: string | number): void => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setCopiedIndex(index);
      setTimeout(() => {
        setCopied(false);
        setCopiedIndex(null);
      }, 1500);
    });
  };

  // 複製所有色碼為 CSS 變數
  const copyAllAsCSSVariables = (): void => {
    const prefix = "color";
    const cssVars = Object.entries(shades)
      .map(([level, hex]) => `  --${prefix}-${level}: ${hex};`)
      .join("\n");

    const cssCode = `:root {\n${cssVars}\n}`;
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setCopiedIndex("all");
    setTimeout(() => {
      setCopied(false);
      setCopiedIndex(null);
    }, 1500);
  };

  // 複製所有色碼為 Tailwind 格式
  const copyAsTailwindConfig = (): void => {
    const colorName = "primary";
    const tailwindConfig = JSON.stringify(
      {
        [colorName]: shades,
      },
      null,
      2,
    );

    navigator.clipboard.writeText(tailwindConfig);
    setCopied(true);
    setCopiedIndex("tailwind");
    setTimeout(() => {
      setCopied(false);
      setCopiedIndex(null);
    }, 1500);
  };

  // 計算文字顏色（深色背景用白色文字，淺色背景用黑色文字）
  const getTextColor = (hexColor: string): string => {
    const rgb = hexToRgb(hexColor);
    if (!rgb) return "#000000";

    // 計算亮度 (根據 W3C 標準)
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness >= 128 ? "#000000" : "#ffffff";
  };

  // 處理範圍滑桿變化
  const handleRangeChange = (
    e: ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<number>>,
  ): void => {
    setter(parseInt(e.target.value, 10));
  };

  return (
    <div className="h-full w-full overflow-auto p-8">
      <div className="mx-auto max-w-5xl rounded-lg border bg-white p-6">
        <h1 className="mb-6 text-center text-2xl font-bold">顏色梯度生成器</h1>

        <div className="mb-8">
          <label className="mb-2 block font-medium">選擇基本顏色</label>
          <div className="flex items-center">
            <input
              type="color"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              className="mr-3 h-12 w-20 cursor-pointer"
            />
            <input
              type="text"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              className="w-full rounded border px-3 py-2 md:w-64"
            />
            <div className="ml-4 hidden items-center rounded bg-gray-100 px-3 py-2 md:flex">
              <span className="mr-2 text-gray-600">目前顏色層級:</span>
              <span className="font-medium">{baseColorLevel}</span>
            </div>
          </div>
          <div className="mt-2 rounded bg-gray-100 px-3 py-2 md:hidden">
            <span className="mr-2 text-gray-600">目前顏色層級:</span>
            <span className="font-medium">{baseColorLevel}</span>
          </div>
        </div>

        {/* 層級設定 */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <label className="font-medium">顏色層級設定</label>
            <button
              className="text-sm text-blue-500 hover:text-blue-600"
              onClick={() => setShowLevelSettings(!showLevelSettings)}
            >
              {showLevelSettings ? "收起" : "展開"} ▾
            </button>
          </div>

          {showLevelSettings && (
            <>
              <div className="mb-3">
                <textarea
                  value={customLevels}
                  onChange={(e) => setCustomLevels(e.target.value)}
                  className="h-20 w-full rounded-lg border p-2 font-mono text-sm"
                  placeholder="輸入以逗號分隔的層級數值，例如：0,50,100,200,300,400,500,600,700,800,900,950,1000"
                />
              </div>
              <div className="mb-2 flex space-x-2">
                <button
                  onClick={() =>
                    setCustomLevels(
                      "50,100,200,300,400,500,600,700,800,900,950",
                    )
                  }
                  className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
                >
                  Tailwind 預設
                </button>
                <button
                  onClick={() =>
                    setCustomLevels("100,200,300,400,500,600,700,800,900")
                  }
                  className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
                >
                  簡化版
                </button>
                <button
                  onClick={() =>
                    setCustomLevels(
                      "0,100,200,300,400,500,600,700,800,900,1000",
                    )
                  }
                  className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
                >
                  僅百位數
                </button>
              </div>
              <p className="text-sm text-gray-600">
                顯示層級: {getLevels().join(", ")}
              </p>
            </>
          )}
        </div>

        {/* 色相偏移控制 */}
        <div className="mb-6">
          <label className="mb-2 block font-medium">整體色相偏移</label>
          <div className="flex">
            <div className="flex-1">
              <input
                type="range"
                min="-180"
                max="180"
                value={hueShift}
                onChange={(e) => handleRangeChange(e, setHueShift)}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>-180°</span>
                <span>-90°</span>
                <span>0°</span>
                <span>+90°</span>
                <span>+180°</span>
              </div>
            </div>
            <div className="w-16 text-center font-mono">{hueShift}°</div>
          </div>
        </div>

        {/* 漸層色相偏移控制 */}
        <div className="mb-8">
          <label className="mb-2 block font-medium">漸層色相偏移</label>
          <div className="flex">
            <div className="flex-1">
              <input
                type="range"
                min="-180"
                max="180"
                value={gradientHueShift}
                onChange={(e) => handleRangeChange(e, setGradientHueShift)}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>-180°</span>
                <span>-90°</span>
                <span>0°</span>
                <span>+90°</span>
                <span>+180°</span>
              </div>
            </div>
            <div className="w-16 text-center font-mono">
              {gradientHueShift}°
            </div>
          </div>
        </div>

        {/* 色調預覽 */}
        <div className="mb-8">
          <div className="mb-4 flex flex-col items-start justify-between md:flex-row md:items-center">
            <div className="mb-2 md:mb-0">
              <h2 className="text-lg font-medium">顏色變體 (0-1000)</h2>
              <p className="text-sm text-gray-600">
                原始顏色對應層級：{" "}
                <span className="font-medium">{baseColorLevel}</span>
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={copyAllAsCSSVariables}
                className="rounded bg-blue-500 px-3 py-2 text-sm text-white hover:bg-blue-600"
              >
                {copied && copiedIndex === "all"
                  ? "已複製 CSS 變數!"
                  : "複製為 CSS 變數"}
              </button>
              <button
                onClick={copyAsTailwindConfig}
                className="rounded bg-blue-500 px-3 py-2 text-sm text-white hover:bg-blue-600"
              >
                {copied && copiedIndex === "tailwind"
                  ? "已複製 Tailwind 格式!"
                  : "複製為 Tailwind 格式"}
              </button>
            </div>
          </div>

          <div className="mb-4 overflow-x-auto">
            <div className="flex min-w-max">
              {Object.entries(shades).map(([level, hex]) => (
                <div
                  key={level}
                  className="mr-1 w-full cursor-pointer overflow-hidden rounded-lg shadow-sm transition-shadow hover:shadow-md"
                  onClick={() => copyToClipboard(hex, level)}
                >
                  <div
                    className="flex h-16 items-center justify-center"
                    style={{ backgroundColor: hex, color: getTextColor(hex) }}
                  >
                    {copied && copiedIndex === level ? (
                      <span className="text-[12px] font-bold">已複製!</span>
                    ) : (
                      <span className="font-mono text-[12px]">{hex}</span>
                    )}
                  </div>
                  <div className="bg-gray-100 p-1 text-center">
                    <div className="font-mono text-sm font-bold">{level}</div>
                    <div className="truncate font-mono text-xs text-gray-500">
                      {hex}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-gray-100 p-4">
          <h3 className="mb-2 font-medium">使用說明:</h3>
          <ul className="list-disc pl-5 text-sm">
            <li>使用顏色選擇器或直接輸入十六進制顏色碼</li>
            <li>系統會自動判斷您選擇的顏色應該對應哪個層級（基於顏色亮度）</li>
            <li>即使選擇純白或純黑，系統也會生成有明顯差異的顏色變體</li>
            <li>點擊任意顏色方塊可複製對應的色碼</li>
            <li>可複製為 CSS 變數或 Tailwind 格式</li>
            <li>使用整體色相偏移來整體調整所有顏色變體的色相</li>
            <li>
              漸層色相偏移以基準色為中心點，淺色調和深色調分別向相反方向偏移
            </li>
            <li>基本顏色會對應到您顯示的層級中最接近的值</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ColorShadeGenerator;
