import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  UnfoldHorizontal,
  CaseUpper,
  CaseLower,
  ArrowBigUpDash,
  ArrowBigDownDash,
  CaseSensitive,
  Languages,
  ChartNoAxesGantt,
  Link,
  Asterisk,
  Binary,
} from "lucide-react";
import pangu from "pangu";
import * as OpenCC from "opencc-js";

// 定義類型
type TransformFunction = (text: string) => string | Promise<string>;

// 定義域名處理函數的類型
type DomainHandler = (url: URL) => string;

// 定義特殊域名處理器的類型
interface SpecialDomains {
  [key: string]: DomainHandler;
}

interface FunctionButtonProps {
  icon: ReactNode;
  text: string;
  onClick: () => void | Promise<void>;
}

interface TextFormatterProps {
  transformSelectedText: (
    text: string,
    transformer: TransformFunction,
    updateText: (text: string) => void,
  ) => void;
  text: string;
  updateText: (text: string) => void;
}

// 功能按鈕
const FunctionButton = ({ icon, text, onClick }: FunctionButtonProps) => (
  <Button
    variant="outline"
    onClick={onClick}
    className="flex h-full flex-col justify-start gap-1 border-none bg-transparent p-0 shadow-none hover:bg-transparent"
  >
    <div className="flex h-16 w-full items-center justify-center rounded-md border border-input bg-white">
      {icon}
    </div>
    <p className="whitespace-normal text-sm">{text}</p>
  </Button>
);

// 文字處理
export const TextFormatter: React.FC<TextFormatterProps> = ({
  transformSelectedText,
  text,
  updateText,
}) => {
  // 中英文間距
  const panguSpacing = (text: string): string => {
    return pangu.spacing(text);
  };

  // 轉大寫
  const toUpperCase = (text: string): string => {
    return text.toUpperCase();
  };

  // 轉小寫
  const toLowerCase = (text: string): string => {
    return text.toLowerCase();
  };

  // 轉全形
  const toFullWidth = (text: string): string => {
    return text.replace(/[!-~]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) + 0xfee0),
    );
  };

  // 轉半形
  const toHalfWidth = (text: string): string => {
    return (
      text
        .replace(/[\uff01-\uff5e]/g, (char) =>
          String.fromCharCode(char.charCodeAt(0) - 0xfee0),
        )
        // 特殊處理全形空格
        .replace(/\u3000/g, " ")
    );
  };

  // 轉句首大寫
  const toSentenceCase = (text: string): string => {
    // 將文字分割成句子
    // 考慮 .!? 後面可能有 """''') 等結束符號，以及可能有多個空格
    return text.replace(
      /(^|[.!?][\]'")}]* +)([a-z])/gi,
      (match, separator, letter) => separator + letter.toUpperCase(),
    );
  };

  // 轉單字首字大寫
  const toTitleCase = (text: string): string => {
    // 將每個單字的首字母轉為大寫
    // 考慮單字可能被空格、連字符、底線分隔
    return text.replace(
      /(^|[^a-zA-Z\u4e00-\u9fa5'])([a-z])/g,
      (match, separator, letter) => separator + letter.toUpperCase(),
    );
  };

  // 簡轉繁體
  const convertToTraditional = async (text: string): Promise<string> => {
    const converter = OpenCC.Converter({ from: "cn", to: "tw" });
    return converter(text);
  };

  // 簡轉繁體 (台灣)
  const convertToTraditionalTW = async (text: string): Promise<string> => {
    const converter = OpenCC.Converter({ from: "cn", to: "twp" });
    return converter(text);
  };

  // 繁轉簡體
  const convertToSimplified = async (text: string): Promise<string> => {
    const converter = OpenCC.Converter({ from: "tw", to: "cn" });
    return converter(text);
  };

  // 去除連續換行
  const removeConsecutiveLineBreaks = (text: string): string => {
    // 1. 先將文字以換行符號分割成陣列
    const lines = text.split("\n");

    // 2. 檢查每一行是否為空白行（只包含空白字元或完全空白）
    const nonEmptyLines = lines.filter((line) => line.trim() !== "");

    // 3. 將非空白行重新組合
    return nonEmptyLines.join("\n");
  };

  // 去除連續空白
  const removeConsecutiveSpaces = (text: string): string => {
    // 將文字按換行符分割，分別處理每一行
    return text
      .split("\n")
      .map((line) => {
        // 使用正則表達式替換連續的空格和 tab 為單一空格
        return line.replace(/[ \t]+/g, " ").trim();
      })
      .join("\n");
  };

  // 文字遮蔽
  const maskText = (text: string): string => {
    // 將文字按換行符分割
    return text
      .split("\n")
      .map((line) => {
        // 對每一行的字元進行遮蔽（除了空白字元）
        return line.replace(/\S/g, "*");
      })
      .join("\n");
  };

  // 數字加千分位
  const numAddCommas = (text: string): string => {
    // 用 lookbehind 和 lookahead 來確保更精確的匹配
    return text.replace(/\d+/g, (match, index, original) => {
      // 檢查是否是年份格式（四位數字後面接空白或直接接年）
      if (match.length === 4 && /^(\s+)?年/.test(original.slice(index + 4))) {
        return match;
      }
      // 其他數字加上千分位
      return match.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    });
  };

  // 處理 URL
  const processUrl = (url: string): string => {
    try {
      // 特殊網址處理
      const specialDomains: SpecialDomains = {
        "l.facebook.com": (url: URL) => {
          const originalUrl = url.searchParams.get("u");
          return originalUrl
            ? processUrl(decodeURIComponent(originalUrl))
            : url.toString();
        },
        "lm.facebook.com": (url: URL) => {
          const originalUrl = url.searchParams.get("u");
          return originalUrl
            ? processUrl(decodeURIComponent(originalUrl))
            : url.toString();
        },
        "www.google.com": (url: URL) => {
          // 只保留搜尋關鍵字
          if (url.pathname === "/search") {
            const q = url.searchParams.get("q");
            return `${url.origin}/search${q ? `?q=${q}` : ""}`;
          }
          return url.toString();
        },
      };

      // 解析 URL
      const urlObject = new URL(url);

      // 檢查是否為特殊網域
      const domainHandler = specialDomains[urlObject.hostname];
      if (domainHandler) {
        return domainHandler(urlObject);
      }

      // 追蹤參數列表
      const trackingParams = new Set([
        // Facebook
        "fbclid",
        "fb_action_ids",
        "fb_action_types",
        "fb_source",
        "fb_ref",

        // Twitter/X
        "ref_src",
        "ref_url",
        "s",
        "t",

        // Google Analytics & Ads
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_term",
        "utm_content",
        "gclid",
        "gclsrc",
        "dclid",
        "gbraid",
        "wbraid",

        // Others
        "_ga",
        "_gl",
        "_hsenc",
        "_hsmi",
        "ref",
        "source",
        "campaign",
        "track",
        "from",
        "via",
        "feature",
        "sr_share",
        "share",
        "platform",

        // Google Search 特定參數
        "ved",
        "ei",
        "bih",
        "biw",
        "uact",
        "gs_lcp",
        "sclient",
        "sxsrf",
        "oq",

        // 其他常見追蹤參數
        "mc_cid",
        "mc_eid",
        "zanpid",
        "_hsmi",
        "_openstat",
        "igshid",
        "vero_id",
        "yclid",
      ]);

      // 解碼路徑名稱中的中文
      const decodedPathname = decodeURIComponent(urlObject.pathname);

      // 處理查詢參數
      const newParams = new URLSearchParams();
      for (const [key, value] of urlObject.searchParams.entries()) {
        if (!trackingParams.has(key.toLowerCase())) {
          newParams.append(key, value);
        }
      }

      // 組合新的 URL
      const newSearch = newParams.toString();
      return (
        urlObject.origin + decodedPathname + (newSearch ? `?${newSearch}` : "")
      );
    } catch (error) {
      console.error("無效的 URL:", error);
      return url;
    }
  };
  const processUrlsInText = (text: string): string => {
    const urlRegex = /(https?:\/\/[^\s<>"]+)/g;
    return text.replace(urlRegex, (match) => processUrl(match));
  };

  // 提取 URL
  const extractUrls = (text: string): string[] => {
    // URL 正則表達式：匹配 http/https 開頭的連結
    const urlRegex = /(https?:\/\/[^\s<>"\]\[]+)/g;

    // 使用正則表達式匹配所有連結
    const matches = text.match(urlRegex);

    // 如果沒有找到連結，返回空陣列
    if (!matches) {
      return [];
    }

    // 返回找到的連結陣列
    return matches;
  };
  const extractUrlsAsString = (text: string): string => {
    const urls = extractUrls(text);
    return urls.join("\n");
  };

  // 定義功能按鈕資料，方便格狀排列
  const functionButtons = [
    {
      icon: <Languages className="!h-5 !w-5" />,
      text: "簡體轉繁體",
      onClick: async () => {
        transformSelectedText(text, convertToTraditional, updateText);
      },
    },
    {
      icon: <Languages className="!h-5 !w-5" />,
      text: "簡體轉繁體（台灣用語）",
      onClick: async () => {
        transformSelectedText(text, convertToTraditionalTW, updateText);
      },
    },
    {
      icon: <Languages className="!h-5 !w-5" />,
      text: "繁體轉簡體",
      onClick: async () => {
        transformSelectedText(text, convertToSimplified, updateText);
      },
    },
    {
      icon: <UnfoldHorizontal className="!h-5 !w-5" />,
      text: "中文、英文加空格",
      onClick: () => {
        transformSelectedText(text, panguSpacing, updateText);
      },
    },
    {
      icon: <CaseUpper className="!h-5 !w-5" />,
      text: "英文轉大寫",
      onClick: () => {
        transformSelectedText(text, toUpperCase, updateText);
      },
    },
    {
      icon: <CaseLower className="!h-5 !w-5" />,
      text: "英文轉小寫",
      onClick: () => {
        transformSelectedText(text, toLowerCase, updateText);
      },
    },
    {
      icon: <CaseSensitive className="!h-5 !w-5" />,
      text: "英文句首大寫",
      onClick: () => {
        transformSelectedText(text, toSentenceCase, updateText);
      },
    },
    {
      icon: <CaseSensitive className="!h-5 !w-5" />,
      text: "英文單字字首大寫",
      onClick: () => {
        transformSelectedText(text, toTitleCase, updateText);
      },
    },
    {
      icon: <ArrowBigUpDash className="!h-5 !w-5" />,
      text: "數字、英文轉全形",
      onClick: () => {
        transformSelectedText(text, toFullWidth, updateText);
      },
    },
    {
      icon: <ArrowBigDownDash className="!h-5 !w-5" />,
      text: "數字、英文轉半形",
      onClick: () => {
        transformSelectedText(text, toHalfWidth, updateText);
      },
    },
    {
      icon: <ChartNoAxesGantt className="!h-5 !w-5" />,
      text: "去除連續換行",
      onClick: () => {
        transformSelectedText(text, removeConsecutiveLineBreaks, updateText);
      },
    },
    {
      icon: <ChartNoAxesGantt className="!h-5 !w-5" />,
      text: "去除連續空白",
      onClick: () => {
        transformSelectedText(text, removeConsecutiveSpaces, updateText);
      },
    },
    {
      icon: <Link className="!h-5 !w-5" />,
      text: "精簡網址連結（移除追蹤碼）",
      onClick: () => {
        transformSelectedText(text, processUrlsInText, updateText);
      },
    },
    {
      icon: <Link className="!h-5 !w-5" />,
      text: "僅保留網址連結",
      onClick: () => {
        transformSelectedText(text, extractUrlsAsString, updateText);
      },
    },
    {
      icon: <Asterisk className="!h-5 !w-5" />,
      text: "文字遮蔽",
      onClick: () => {
        transformSelectedText(text, maskText, updateText);
      },
    },
    {
      icon: <Binary className="!h-5 !w-5" />,
      text: "數字千分位",
      onClick: () => {
        transformSelectedText(text, numAddCommas, updateText);
      },
    },
  ];

  return (
    <div className="h-full w-full overflow-hidden pt-0">
      <div className="flex h-full w-full flex-1 flex-col overflow-hidden bg-zinc-50">
        {/* 標題區塊 */}
        <div className="border-b bg-background p-2 md:p-3">
          <p className="text-sm text-zinc-700">⠿ 文字處理</p>
        </div>

        {/* 格狀排列區域 */}
        <ScrollArea className="h-full overflow-y-auto overflow-x-hidden">
          <div className="grid grid-cols-2 gap-2 p-2 md:grid-cols-3 md:p-3">
            {functionButtons.map((button, index) => (
              <FunctionButton
                key={index}
                icon={button.icon}
                text={button.text}
                onClick={button.onClick}
              />
            ))}
          </div>
          <ScrollBar className="z-10" />
        </ScrollArea>
      </div>
    </div>
  );
};
