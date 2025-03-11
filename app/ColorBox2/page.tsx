"use client";

import React, { useState, useEffect, ChangeEvent } from "react";

// 定義類型
interface RGB {
  r: number;
  g: number;
  b: number;
}

// HSL 類型定義
interface HSL {
  h: number;
  s: number;
  l: number;
}

// OKLCH 類型定義
interface OKLCH {
  l: number; // 亮度 (0-1)
  c: number; // 色度 (0-0.4 通常)
  h: number; // 色相 (0-360)
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

  // 新增狀態設定，加在現有 useState 宣告區塊中
  const [colorSpace, setColorSpace] = useState<"hsl" | "oklch">("hsl"); // 預設使用 HSL
  const [oklchGradientCShift, setOklchGradientCShift] = useState<number>(0); // OKLCH 漸層彩度偏移值

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
  // ===============================================================

  // sRGB 轉線性 RGB
  const sRGBToLinear = (value: number): number => {
    if (value <= 0.04045) {
      return value / 12.92;
    }
    return Math.pow((value + 0.055) / 1.055, 2.4);
  };

  // 線性 RGB 轉 sRGB
  const linearToSRGB = (value: number): number => {
    if (value <= 0.0031308) {
      return value * 12.92;
    }
    return 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
  };

  // RGB 轉 XYZ
  const rgbToXYZ = (
    r: number,
    g: number,
    b: number,
  ): { x: number; y: number; z: number } => {
    // 將 sRGB 轉為線性 RGB
    const rL = sRGBToLinear(r / 255);
    const gL = sRGBToLinear(g / 255);
    const bL = sRGBToLinear(b / 255);

    // 轉換矩陣
    const x = 0.4124564 * rL + 0.3575761 * gL + 0.1804375 * bL;
    const y = 0.2126729 * rL + 0.7151522 * gL + 0.072175 * bL;
    const z = 0.0193339 * rL + 0.119192 * gL + 0.9503041 * bL;

    return { x, y, z };
  };

  // XYZ 轉 RGB
  const xyzToRGB = (x: number, y: number, z: number): RGB => {
    // 轉換矩陣
    const rL = 3.2404542 * x - 1.5371385 * y - 0.4985314 * z;
    const gL = -0.969266 * x + 1.8760108 * y + 0.041556 * z;
    const bL = 0.0556434 * x - 0.2040259 * y + 1.0572252 * z;

    // 線性 RGB 轉 sRGB
    const r = Math.round(255 * linearToSRGB(rL));
    const g = Math.round(255 * linearToSRGB(gL));
    const b = Math.round(255 * linearToSRGB(bL));

    // 確保值在 0-255 範圍內
    return {
      r: Math.max(0, Math.min(255, r)),
      g: Math.max(0, Math.min(255, g)),
      b: Math.max(0, Math.min(255, b)),
    };
  };

  // XYZ 轉 LMS
  const xyzToLMS = (
    x: number,
    y: number,
    z: number,
  ): { l: number; m: number; s: number } => {
    // 轉換矩陣
    const l = 0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z;
    const m = 0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z;
    const s = 0.0482003018 * x + 0.2643662691 * y + 0.633851707 * z;

    return { l, m, s };
  };

  // LMS 轉 XYZ
  const lmsToXYZ = (
    l: number,
    m: number,
    s: number,
  ): { x: number; y: number; z: number } => {
    // 轉換矩陣
    const x = 1.2268798733 * l - 0.5578149965 * m + 0.2813910503 * s;
    const y = -0.0405757684 * l + 1.1122868293 * m - 0.0717110608 * s;
    const z = -0.0763729198 * l - 0.42149334 * m + 1.5869240244 * s;

    return { x, y, z };
  };

  // LMS 轉 OKLab
  const lmsToOKLab = (
    l: number,
    m: number,
    s: number,
  ): { L: number; a: number; b: number } => {
    // LMS 非線性轉換
    const lNL = Math.cbrt(l);
    const mNL = Math.cbrt(m);
    const sNL = Math.cbrt(s);

    // 轉換矩陣
    const L = 0.2104542553 * lNL + 0.793617785 * mNL - 0.0040720468 * sNL;
    const a = 1.9779984951 * lNL - 2.428592205 * mNL + 0.4505937099 * sNL;
    const b = 0.0259040371 * lNL + 0.7827717662 * mNL - 0.808675766 * sNL;

    return { L, a, b };
  };

  // OKLab 轉 LMS
  const okLabToLMS = (
    L: number,
    a: number,
    b: number,
  ): { l: number; m: number; s: number } => {
    // 轉換矩陣
    const lNL = L + 0.3963377774 * a + 0.2158037573 * b;
    const mNL = L - 0.1055613458 * a - 0.0638541728 * b;
    const sNL = L - 0.0894841775 * a - 1.291485548 * b;

    // 立方運算轉回線性 LMS
    const l = Math.pow(lNL, 3);
    const m = Math.pow(mNL, 3);
    const s = Math.pow(sNL, 3);

    return { l, m, s };
  };

  // OKLab 轉 OKLCH
  const okLabToOKLCH = (L: number, a: number, b: number): OKLCH => {
    const c = Math.sqrt(a * a + b * b);
    let h = Math.atan2(b, a) * (180 / Math.PI);

    if (h < 0) {
      h += 360;
    }

    return { l: L, c, h };
  };

  // OKLCH 轉 OKLab
  const oklchToOKLab = (
    l: number,
    c: number,
    h: number,
  ): { L: number; a: number; b: number } => {
    const hRadians = h * (Math.PI / 180);
    const a = c * Math.cos(hRadians);
    const b = c * Math.sin(hRadians);

    return { L: l, a, b };
  };

  // RGB 轉 OKLCH
  const rgbToOKLCH = (r: number, g: number, b: number): OKLCH => {
    const xyz = rgbToXYZ(r, g, b);
    const lms = xyzToLMS(xyz.x, xyz.y, xyz.z);
    const lab = lmsToOKLab(lms.l, lms.m, lms.s);
    return okLabToOKLCH(lab.L, lab.a, lab.b);
  };

  // OKLCH 轉 RGB
  const oklchToRGB = (l: number, c: number, h: number): RGB => {
    const lab = oklchToOKLab(l, c, h);
    const lms = okLabToLMS(lab.L, lab.a, lab.b);
    const xyz = lmsToXYZ(lms.l, lms.m, lms.s);
    return xyzToRGB(xyz.x, xyz.y, xyz.z);
  };

  // 十六進制轉 OKLCH
  const hexToOKLCH = (hex: string): OKLCH | null => {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;
    return rgbToOKLCH(rgb.r, rgb.g, rgb.b);
  };

  // OKLCH 轉十六進制
  const oklchToHex = (l: number, c: number, h: number): string => {
    const rgb = oklchToRGB(l, c, h);
    return `#${rgb.r.toString(16).padStart(2, "0")}${rgb.g.toString(16).padStart(2, "0")}${rgb.b.toString(16).padStart(2, "0")}`;
  };

  // ===============================================================
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

    // 根據選擇的顏色空間進行處理
    if (colorSpace === "hsl") {
      // 獲取基本顏色的 HSL 值
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

      // 應用整體色相偏移
      hsl.h = (hsl.h + hueShift) % 360;
      if (hsl.h < 0) hsl.h += 360; // 處理負數的情況

      // 保存原始 HSL 用於漸變色相計算
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
          Math.abs(curr - idealLevel) < Math.abs(prev - idealLevel)
            ? curr
            : prev,
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

        newShades[level] = calculateHSLColorForLevel(
          level,
          baseHsl,
          baseLevel,
          validLevels,
        );
      });

      setShades(newShades);
      setBaseColorLevel(baseLevel);
    } else {
      // 使用 OKLCH 處理邏輯
      generateOKLCHShades(rgb);
    }
  };

  const calculateHSLColorForLevel = (
    level: number,
    baseHsl: HSL,
    baseLevel: number,
    validLevels: number[],
  ): string => {
    let lightness: number;
    let levelHueShift = 0;

    // 找出最大的有效層級（用於計算漸變）
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

  // 新增 OKLCH 色彩生成函數
  const generateOKLCHShades = (rgb: RGB): void => {
    // 轉換為 OKLCH
    const oklch = rgbToOKLCH(rgb.r, rgb.g, rgb.b);

    // 應用整體色相偏移 (OKLCH 的色相也是 0-360 度)
    const shiftedHue = (((oklch.h + hueShift) % 360) + 360) % 360;

    // 保存原始 OKLCH 用於漸變計算
    const baseOklch: OKLCH = {
      l: oklch.l,
      c: oklch.c,
      h: shiftedHue,
    };

    // 檢查是否是極端顏色（極高/極低亮度）
    const isNearWhite = oklch.l > 0.95;
    const isNearBlack = oklch.l < 0.05;
    const isLowChroma = oklch.c < 0.03;

    // 對於極端顏色，調整色相和彩度
    const adjustedBaseOklch: OKLCH =
      (isNearWhite || isNearBlack) && isLowChroma
        ? { ...baseOklch, h: 250, c: 0.05 } // 使用藍色系，增加彩度
        : baseOklch;

    // 獲取要顯示的層級
    const displayLevels = getLevels();

    // 有效層級 (不包括 0 和 1000)
    const validLevels = displayLevels.filter((l) => l > 0 && l < 1000);

    // 確定基準顏色應該對應的層級
    const baseLevel = (() => {
      if (validLevels.length === 0) {
        return 500; // 預設值
      }

      if (isNearWhite) {
        return Math.min(...validLevels); // 接近白色時，使用最小層級
      }

      if (isNearBlack) {
        return Math.max(...validLevels); // 接近黑色時，使用最大層級
      }

      // 計算感知亮度和調整
      const perceivedLightness = adjustedBaseOklch.l;
      const chromaFactor = Math.min(1, adjustedBaseOklch.c * 2.5); // 增強彩度影響
      const adjustedLightness = perceivedLightness * (1 + chromaFactor * 0.15);

      // 改進的層級映射邏輯
      const idealLevel = (() => {
        // 高彩度顏色層級分配調整
        if (adjustedBaseOklch.c > 0.1) {
          // 青色等高彩度亮色應對應到更合理的層級 (200-400)
          if (adjustedLightness > 0.6) {
            return 300 + (1 - adjustedLightness) * 300; // 亮且高彩度約 300-400
          }

          // 中等亮度高彩度顏色
          if (adjustedLightness > 0.3) {
            return 500 + (0.6 - adjustedLightness) * 300; // 約 500-600
          }
        }

        // 一般映射邏輯 (低彩度或其他顏色)
        if (adjustedLightness > 0.8) {
          return 100; // 非常亮
        }

        if (adjustedLightness < 0.2) {
          return 800; // 非常暗
        }

        // 中間範圍 (0.2-0.8) 映射到 (800-100)
        return Math.round(800 - (adjustedLightness - 0.2) * (700 / 0.6));
      })();

      // 找出自定義層級中最接近的值
      return validLevels.reduce((prev, curr) =>
        Math.abs(curr - idealLevel) < Math.abs(prev - idealLevel) ? curr : prev,
      );
    })();

    // 生成所有層級的顏色
    const newShades = displayLevels.reduce((acc, level) => {
      // 處理極端情況
      if (level === 0) {
        return { ...acc, [level]: "#FFFFFF" };
      }

      if (level === 1000) {
        return { ...acc, [level]: "#000000" };
      }

      // 計算其他層級顏色
      const color = calculateOKLCHColorForLevel(
        level,
        adjustedBaseOklch,
        baseLevel,
        validLevels,
      );

      return { ...acc, [level]: color };
    }, {} as Shades);

    // 更新狀態
    setShades(newShades);
    setBaseColorLevel(baseLevel);
  };

  // 計算特定層級的 OKLCH 顏色
  const calculateOKLCHColorForLevel = (
    level: number,
    baseOklch: OKLCH,
    baseLevel: number,
    validLevels: number[],
  ): string => {
    // 處理極端情況
    if (level === 0) return "#FFFFFF";
    if (level === 1000) return "#000000";

    let lightness: number;
    let chroma: number = baseOklch.c;
    let hue: number = baseOklch.h;

    // 找出有效層級的範圍
    const minLevel = Math.min(...validLevels);
    const maxLevel = Math.max(...validLevels);

    // 計算層級的相對位置 (0-1)
    const relativePosition = (level - minLevel) / (maxLevel - minLevel);

    if (level === baseLevel) {
      // 基準色，直接使用原始值
      lightness = baseOklch.l;
      chroma = baseOklch.c;
      hue = baseOklch.h;
    } else if (level < baseLevel) {
      // 淺色方向 (比基準色更淺)
      const factor = (baseLevel - level) / (baseLevel - minLevel);

      // 亮度從基準色向白色過渡 (最高亮度0.98)
      lightness = baseOklch.l + (0.98 - baseOklch.l) * factor;

      // 較淺色彩的彩度適度降低
      chroma = Math.max(
        0,
        baseOklch.c * (1 - factor * 0.3) + oklchGradientCShift * factor,
      );

      // 色相偏移 (越淺色向負方向偏移)
      if (gradientHueShift !== 0) {
        hue = (baseOklch.h - gradientHueShift * factor) % 360;
        if (hue < 0) hue += 360;
      }
    } else {
      // 深色方向 (比基準色更深)
      const factor = (level - baseLevel) / (maxLevel - baseLevel);

      // 亮度從基準色向黑色過渡 (最低亮度0.05)
      lightness = baseOklch.l - baseOklch.l * factor * 0.95;

      // 深色彩度變化
      // 對於深色，彩度先增加再降低，形成更豐富的過渡
      if (factor < 0.5) {
        // 前半段，彩度稍微增加
        chroma =
          baseOklch.c * (1 + factor * 0.2) - oklchGradientCShift * factor;
      } else {
        // 後半段，彩度逐漸降低到接近零
        const deepFactor = (factor - 0.5) * 2;
        chroma =
          baseOklch.c * (1.1 - deepFactor * 0.9) - oklchGradientCShift * factor;
      }

      // 色相偏移 (越深色向正方向偏移)
      if (gradientHueShift !== 0) {
        hue = (baseOklch.h + gradientHueShift * factor) % 360;
      }
    }

    // 限制值範圍
    lightness = Math.max(0.05, Math.min(0.98, lightness));
    chroma = Math.max(0, Math.min(0.4, chroma));
    hue = (hue + 360) % 360;

    // 生成十六進制色碼
    return oklchToHex(lightness, chroma, hue);
  };

  // 顏色空間切換功能
  const toggleColorSpace = (space: "hsl" | "oklch"): void => {
    // 先保存當前的 RGB 值
    const rgb = hexToRgb(baseColor);
    if (!rgb) return;

    // 切換色彩空間
    setColorSpace(space);

    // 重要：在函數執行開始時清除舊的色階
    // 這可以防止在切換時顯示錯誤的舊數據
    setShades({});

    // 根據新的色彩空間，保持相同的 RGB 值但調整色彩表示
    if (space === "hsl") {
      // 不需要特別處理，因為原始 baseColor 已經是 hex 格式
      generateShades(); // 直接重新生成色階
    } else {
      // 切換到 OKLCH，明確地觸發色階重新生成
      const oklch = rgbToOKLCH(rgb.r, rgb.g, rgb.b);
      generateOKLCHShades(rgb); // 直接調用 OKLCH 處理函數
    }
  };

  // 顏色改變時重新生成色調
  useEffect(() => {
    generateShades();
  }, [
    colorSpace,
    baseColor,
    hueShift,
    gradientHueShift,
    customLevels,
    oklchGradientCShift,
  ]);

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
    <div className="flex h-[100vh] w-full flex-col overflow-hidden">
      <h1 className="flex h-[60px] items-center justify-center border-b border-input bg-white text-lg font-bold">
        色碼生成器
      </h1>
      <div className="flex h-full w-full gap-3 overflow-hidden border p-3">
        {/* 調整區域 */}
        <div className="no-scrollbar flex h-full w-full max-w-[400px] flex-col gap-3 overflow-auto">
          {/* 顏色選擇區域 */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="mb-3 text-lg font-medium">基本顏色</p>
            <div className="mb-4">
              <div className="flex items-center gap-4">
                <label
                  style={{ backgroundColor: baseColor }}
                  className="flex h-[120px] w-[120px] items-center gap-2 rounded-lg border border-gray-300"
                >
                  <input
                    type="color"
                    value={baseColor}
                    onChange={(e) => setBaseColor(e.target.value)}
                    className="h-full w-full cursor-pointer rounded-md border border-gray-300 opacity-0"
                  />
                </label>
                <div className="flex flex-1 flex-col space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="min-w-12 text-center text-[12px] text-gray-800">
                      LEVEL
                    </p>
                    <input
                      type="text"
                      value={baseColorLevel}
                      disabled
                      className="w-full rounded-md border px-3 py-1 font-mono text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <p className="min-w-12 text-center text-[12px] text-gray-800">
                      HEX
                    </p>
                    <input
                      type="text"
                      value={baseColor}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(value)) {
                          setBaseColor(value);
                        }
                      }}
                      className="w-full rounded-md border px-3 py-1 font-mono text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <p className="min-w-12 text-center text-[12px] text-gray-800">
                      RGB
                    </p>
                    <div className="flex w-full gap-1">
                      {(() => {
                        const rgb = hexToRgb(baseColor) || { r: 0, g: 0, b: 0 };
                        return (
                          <>
                            <input
                              type="number"
                              min="0"
                              max="255"
                              value={rgb.r}
                              onChange={(e) => {
                                const val = Math.max(
                                  0,
                                  Math.min(255, parseInt(e.target.value) || 0),
                                );
                                const newRgb = { ...rgb, r: val };
                                setBaseColor(
                                  `#${newRgb.r.toString(16).padStart(2, "0")}${newRgb.g.toString(16).padStart(2, "0")}${newRgb.b.toString(16).padStart(2, "0")}`,
                                );
                              }}
                              className="w-full rounded-md border px-3 py-1 font-mono text-sm"
                            />
                            <input
                              type="number"
                              min="0"
                              max="255"
                              value={rgb.g}
                              onChange={(e) => {
                                const val = Math.max(
                                  0,
                                  Math.min(255, parseInt(e.target.value) || 0),
                                );
                                const newRgb = { ...rgb, g: val };
                                setBaseColor(
                                  `#${newRgb.r.toString(16).padStart(2, "0")}${newRgb.g.toString(16).padStart(2, "0")}${newRgb.b.toString(16).padStart(2, "0")}`,
                                );
                              }}
                              className="w-full rounded-md border px-3 py-1 font-mono text-sm"
                            />
                            <input
                              type="number"
                              min="0"
                              max="255"
                              value={rgb.b}
                              onChange={(e) => {
                                const val = Math.max(
                                  0,
                                  Math.min(255, parseInt(e.target.value) || 0),
                                );
                                const newRgb = { ...rgb, b: val };
                                setBaseColor(
                                  `#${newRgb.r.toString(16).padStart(2, "0")}${newRgb.g.toString(16).padStart(2, "0")}${newRgb.b.toString(16).padStart(2, "0")}`,
                                );
                              }}
                              className="w-full rounded-md border px-3 py-1 font-mono text-sm"
                            />
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 顏色空間選擇與參數調整 */}
            <div className="rounded-md border border-gray-200 bg-white p-3">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm text-gray-600">色彩空間</p>
                <div className="flex items-center gap-2">
                  <button
                    className={`rounded-md border px-3 py-1 text-sm transition ${
                      colorSpace === "hsl"
                        ? "border-blue-600 bg-blue-500 text-white"
                        : "border-gray-300 bg-gray-100 hover:bg-gray-200"
                    }`}
                    onClick={() => toggleColorSpace("hsl")}
                  >
                    HSL
                  </button>
                  <button
                    className={`rounded-md border px-3 py-1 text-sm transition ${
                      colorSpace === "oklch"
                        ? "border-blue-600 bg-blue-500 text-white"
                        : "border-gray-300 bg-gray-100 hover:bg-gray-200"
                    }`}
                    onClick={() => toggleColorSpace("oklch")}
                  >
                    OKLCH
                  </button>
                </div>
              </div>

              {colorSpace === "hsl" ? (
                <div className="space-y-2">
                  {(() => {
                    const rgb = hexToRgb(baseColor) || { r: 0, g: 0, b: 0 };
                    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

                    const updateHSL = (key: keyof HSL, value: number) => {
                      const newHsl = { ...hsl, [key]: value };
                      const hex = hslToHex(newHsl.h, newHsl.s, newHsl.l);
                      setBaseColor(hex);
                    };
                    return (
                      <>
                        <div className="flex items-center">
                          <span className="min-w-24 text-sm font-medium">
                            色相 (H)
                          </span>
                          <div className="flex-1 px-2">
                            <input
                              type="range"
                              min="0"
                              max="360"
                              value={Math.round(hsl.h)}
                              onChange={(e) =>
                                updateHSL("h", parseInt(e.target.value))
                              }
                              className="h-6 w-full"
                              style={{
                                background: `linear-gradient(to right, 
                        hsl(0, ${hsl.s}%, ${hsl.l}%), 
                        hsl(60, ${hsl.s}%, ${hsl.l}%), 
                        hsl(120, ${hsl.s}%, ${hsl.l}%), 
                        hsl(180, ${hsl.s}%, ${hsl.l}%), 
                        hsl(240, ${hsl.s}%, ${hsl.l}%), 
                        hsl(300, ${hsl.s}%, ${hsl.l}%), 
                        hsl(360, ${hsl.s}%, ${hsl.l}%))`,
                              }}
                            />
                          </div>
                          <div className="ml-2 min-w-14">
                            <input
                              type="number"
                              min="0"
                              max="360"
                              value={Math.round(hsl.h)}
                              onChange={(e) => {
                                const val = Math.max(
                                  0,
                                  Math.min(360, parseInt(e.target.value) || 0),
                                );
                                updateHSL("h", val);
                              }}
                              className="w-[80px] rounded-md border px-2 py-1 text-center font-mono text-sm"
                            />
                          </div>
                        </div>

                        <div className="flex items-center">
                          <span className="min-w-24 text-sm font-medium">
                            飽和度 (S)
                          </span>
                          <div className="flex-1 px-2">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={Math.round(hsl.s)}
                              onChange={(e) =>
                                updateHSL("s", parseInt(e.target.value))
                              }
                              className="h-6 w-full"
                              style={{
                                background: `linear-gradient(to right, 
                        hsl(${hsl.h}, 0%, ${hsl.l}%), 
                        hsl(${hsl.h}, 100%, ${hsl.l}%))`,
                              }}
                            />
                          </div>
                          <div className="ml-2 min-w-14">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={Math.round(hsl.s)}
                              onChange={(e) => {
                                const val = Math.max(
                                  0,
                                  Math.min(100, parseInt(e.target.value) || 0),
                                );
                                updateHSL("s", val);
                              }}
                              className="w-[80px] rounded-md border px-2 py-1 text-center font-mono text-sm"
                            />
                          </div>
                        </div>

                        <div className="flex items-center">
                          <span className="min-w-24 text-sm font-medium">
                            亮度 (L)
                          </span>
                          <div className="flex-1 px-2">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={Math.round(hsl.l)}
                              onChange={(e) =>
                                updateHSL("l", parseInt(e.target.value))
                              }
                              className="h-6 w-full"
                              style={{
                                background: `linear-gradient(to right, 
                        hsl(${hsl.h}, ${hsl.s}%, 0%), 
                        hsl(${hsl.h}, ${hsl.s}%, 50%), 
                        hsl(${hsl.h}, ${hsl.s}%, 100%))`,
                              }}
                            />
                          </div>
                          <div className="ml-2 min-w-14">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={Math.round(hsl.l)}
                              onChange={(e) => {
                                const val = Math.max(
                                  0,
                                  Math.min(100, parseInt(e.target.value) || 0),
                                );
                                updateHSL("l", val);
                              }}
                              className="w-[80px] rounded-md border px-2 py-1 text-center font-mono text-sm"
                            />
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="space-y-2">
                  {(() => {
                    const rgb = hexToRgb(baseColor) || { r: 0, g: 0, b: 0 };
                    const oklch = rgbToOKLCH(rgb.r, rgb.g, rgb.b);

                    const updateOKLCH = (key: keyof OKLCH, value: number) => {
                      const newOklch = { ...oklch, [key]: value };
                      const hex = oklchToHex(
                        newOklch.l,
                        newOklch.c,
                        newOklch.h,
                      );
                      setBaseColor(hex);
                    };

                    return (
                      <>
                        <div className="flex items-center">
                          <span className="min-w-24 text-sm font-medium">
                            明度 (L)
                          </span>
                          <div className="flex-1 px-2">
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={oklch.l}
                              onChange={(e) =>
                                updateOKLCH("l", parseFloat(e.target.value))
                              }
                              className="h-6 w-full"
                              style={{
                                background: `linear-gradient(to right, #000000, #888888, #ffffff)`,
                              }}
                            />
                          </div>
                          <div className="ml-2 min-w-14">
                            <input
                              type="number"
                              min="0"
                              max="1"
                              step="0.01"
                              value={oklch.l.toFixed(2)}
                              onChange={(e) => {
                                const val = Math.max(
                                  0,
                                  Math.min(1, parseFloat(e.target.value) || 0),
                                );
                                updateOKLCH("l", val);
                              }}
                              className="w-[80px] rounded-md border px-2 py-1 text-center font-mono text-sm"
                            />
                          </div>
                        </div>

                        <div className="flex items-center">
                          <span className="min-w-24 text-sm font-medium">
                            彩度 (C)
                          </span>
                          <div className="flex-1 px-2">
                            <input
                              type="range"
                              min="0"
                              max="0.4"
                              step="0.001"
                              value={oklch.c}
                              onChange={(e) =>
                                updateOKLCH("c", parseFloat(e.target.value))
                              }
                              className="h-6 w-full"
                            />
                          </div>
                          <div className="ml-2 min-w-14">
                            <input
                              type="number"
                              min="0"
                              max="0.4"
                              step="0.001"
                              value={oklch.c.toFixed(3)}
                              onChange={(e) => {
                                const val = Math.max(
                                  0,
                                  Math.min(
                                    0.4,
                                    parseFloat(e.target.value) || 0,
                                  ),
                                );
                                updateOKLCH("c", val);
                              }}
                              className="w-[80px] rounded-md border px-2 py-1 text-center font-mono text-sm"
                            />
                          </div>
                        </div>

                        <div className="flex items-center">
                          <span className="min-w-24 text-sm font-medium">
                            色相 (H)
                          </span>
                          <div className="flex-1 px-2">
                            <input
                              type="range"
                              min="0"
                              max="360"
                              value={Math.round(oklch.h)}
                              onChange={(e) =>
                                updateOKLCH("h", parseInt(e.target.value))
                              }
                              className="h-6 w-full"
                            />
                          </div>
                          <div className="ml-2 min-w-14">
                            <input
                              type="number"
                              min="0"
                              max="360"
                              value={Math.round(oklch.h)}
                              onChange={(e) => {
                                const val = Math.max(
                                  0,
                                  Math.min(360, parseInt(e.target.value) || 0),
                                );
                                updateOKLCH("h", val);
                              }}
                              className="w-[80px] rounded-md border px-2 py-1 text-center font-mono text-sm"
                            />
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* 色彩格式互轉 */}
              <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-2">
                <details>
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    顯示色彩格式
                  </summary>
                  <div className="mt-2 space-y-2 p-2 text-sm">
                    {(() => {
                      const rgb = hexToRgb(baseColor) || { r: 0, g: 0, b: 0 };
                      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                      const oklch = rgbToOKLCH(rgb.r, rgb.g, rgb.b);

                      const copyToClipboard = (text: string) => {
                        navigator.clipboard.writeText(text);
                      };

                      return (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">HEX:</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono">{baseColor}</span>
                              <button
                                className="ml-1 rounded-md bg-gray-200 p-1 text-xs hover:bg-gray-300"
                                onClick={() => copyToClipboard(baseColor)}
                              >
                                複製
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="font-medium">RGB:</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono">
                                rgb({rgb.r}, {rgb.g}, {rgb.b})
                              </span>
                              <button
                                className="ml-1 rounded-md bg-gray-200 p-1 text-xs hover:bg-gray-300"
                                onClick={() =>
                                  copyToClipboard(
                                    `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
                                  )
                                }
                              >
                                複製
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="font-medium">HSL:</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono">
                                hsl({Math.round(hsl.h)}, {Math.round(hsl.s)}%,{" "}
                                {Math.round(hsl.l)}%)
                              </span>
                              <button
                                className="ml-1 rounded-md bg-gray-200 p-1 text-xs hover:bg-gray-300"
                                onClick={() =>
                                  copyToClipboard(
                                    `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`,
                                  )
                                }
                              >
                                複製
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="font-medium">OKLCH:</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono">
                                oklch({oklch.l.toFixed(2)} {oklch.c.toFixed(3)}{" "}
                                {Math.round(oklch.h)})
                              </span>
                              <button
                                className="ml-1 rounded-md bg-gray-200 p-1 text-xs hover:bg-gray-300"
                                onClick={() =>
                                  copyToClipboard(
                                    `oklch(${oklch.l.toFixed(2)} ${oklch.c.toFixed(3)} ${Math.round(oklch.h)})`,
                                  )
                                }
                              >
                                複製
                              </button>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </details>
              </div>
            </div>
          </div>

          {/* 調整參數區域 */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h2 className="mb-4 text-lg font-medium">色彩調整</h2>

            <div className="space-y-4">
              {/* 色相偏移控制 */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="font-medium">整體色相偏移</label>
                  <button
                    className="rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300"
                    onClick={() => setHueShift(0)}
                  >
                    重置
                  </button>
                </div>

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
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="font-medium">漸層色相偏移</label>
                  <button
                    className="rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300"
                    onClick={() => setGradientHueShift(0)}
                  >
                    重置
                  </button>
                </div>

                <div className="flex">
                  <div className="flex-1">
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={gradientHueShift}
                      onChange={(e) =>
                        handleRangeChange(e, setGradientHueShift)
                      }
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

              {/* OKLCH特有控制項，只在 OKLCH 模式下顯示 */}
              {colorSpace === "oklch" && (
                <div>
                  <div className="mb-2">
                    <div className="mb-2 flex items-center justify-between">
                      <label
                        htmlFor="oklchGradientCShift"
                        className="font-medium"
                      >
                        OKLCH 彩度漸變
                      </label>
                      <button
                        className="rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300"
                        onClick={() => setOklchGradientCShift(0)}
                      >
                        重置
                      </button>
                    </div>
                    <div className="flex">
                      <div className="flex-1">
                        <input
                          type="range"
                          id="oklchGradientCShift"
                          min="-0.2"
                          max="0.2"
                          step="0.01"
                          value={oklchGradientCShift}
                          onChange={(e) =>
                            setOklchGradientCShift(parseFloat(e.target.value))
                          }
                          className="mt-1 w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>-0.2</span>
                          <span>-0.1</span>
                          <span>0</span>
                          <span>+0.1</span>
                          <span>+0.2</span>
                        </div>
                      </div>
                      <div className="w-16 text-center font-mono">
                        {oklchGradientCShift.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 層級設定區域 */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-medium">顏色層級設定</h2>
              <button
                className="text-sm text-blue-500 hover:text-blue-600"
                onClick={() => setShowLevelSettings(!showLevelSettings)}
              >
                {showLevelSettings ? "收起" : "展開"}
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
                <div className="mb-2 flex flex-wrap gap-2">
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
        </div>
        {/* 色調預覽區域 */}
        <div className="h-full w-full">
          <div className="h-full w-full rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="mb-4 flex flex-col items-start justify-between md:flex-row md:items-center">
              <div className="mb-2 md:mb-0">
                <h2 className="text-lg font-medium">顏色變體 (0-1000)</h2>
                <p className="text-sm text-gray-600">
                  原始顏色對應層級：{" "}
                  <span className="font-medium">{baseColorLevel}</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={copyAllAsCSSVariables}
                  className="rounded-md border border-blue-600 bg-blue-500 px-3 py-2 text-sm text-white hover:bg-blue-600"
                >
                  {copied && copiedIndex === "all"
                    ? "已複製 CSS 變數!"
                    : "複製為 CSS 變數"}
                </button>
                <button
                  onClick={copyAsTailwindConfig}
                  className="rounded-md border border-blue-600 bg-blue-500 px-3 py-2 text-sm text-white hover:bg-blue-600"
                >
                  {copied && copiedIndex === "tailwind"
                    ? "已複製 Tailwind 格式!"
                    : "複製為 Tailwind 格式"}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="flex min-w-max">
                {Object.entries(shades).map(([level, hex]) => (
                  <div
                    key={level}
                    className="mr-1 w-full cursor-pointer overflow-hidden rounded-lg border border-input shadow-sm transition-shadow hover:shadow-md"
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
                    <div className="border-t border-input bg-white p-1 text-center">
                      <div className="font-mono text-sm font-bold text-gray-700">
                        {level}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorShadeGenerator;
