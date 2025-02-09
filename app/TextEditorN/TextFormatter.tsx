import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  UnfoldHorizontal,
  CaseUpper,
  CaseLower,
  ArrowBigUpDash,
  ArrowBigDownDash,
  CaseSensitive,
  Languages,
} from "lucide-react";

import pangu from "pangu";
import * as OpenCC from "opencc-js";

// 定義類型
type TransformFunction = (text: string) => string | Promise<string>;

interface FunctionButtonProps {
  icon: ReactNode;
  text: string;
  onClick: () => void | Promise<void>;
}

interface TextFormatterProps {
  transformSelectedText: (
    text: string,
    transformer: TransformFunction,
    updateText: (text: string) => void
  ) => void;
  text: string;
  updateText: (text: string) => void;
}

const FunctionButton = ({ icon, text, onClick }: FunctionButtonProps) => (
  <Button
    variant="outline"
    onClick={onClick}
    className="h-11  rounded-none border-l-0 border-r-0 border-t-0 text-md animate-fade-in"
  >
    <div className="flex justify-start items-center w-full transition-opacity duration-200">
      {icon}
      <p>{text}</p>
    </div>
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
      String.fromCharCode(char.charCodeAt(0) + 0xfee0)
    );
  };

  // 轉半形
  const toHalfWidth = (text: string): string => {
    return (
      text
        .replace(/[\uff01-\uff5e]/g, (char) =>
          String.fromCharCode(char.charCodeAt(0) - 0xfee0)
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
      (match, separator, letter) => separator + letter.toUpperCase()
    );
  };

  // 轉單字首字大寫
  const toTitleCase = (text: string): string => {
    // 將每個單字的首字母轉為大寫
    // 考慮單字可能被空格、連字符、底線分隔
    return text.replace(
      /(^|[^a-zA-Z\u4e00-\u9fa5'])([a-z])/g,
      (match, separator, letter) => separator + letter.toUpperCase()
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

  return (
    <div className="w-full h-[600px] p-0 overflow-hidden rounded-md border border-input bg-zinc-50 flex flex-col">
      {/* 簡體轉繁體 */}
      <FunctionButton
        icon={<Languages className="h-5 w-5 mr-2" />}
        text="簡體轉繁體"
        onClick={async () => {
          transformSelectedText(text, convertToTraditional, updateText);
        }}
      />

      {/* 簡體轉繁體 (台灣用語) */}
      <FunctionButton
        icon={<Languages className="h-5 w-5 mr-2" />}
        text="簡體轉繁體（台灣用語）"
        onClick={async () => {
          transformSelectedText(text, convertToTraditionalTW, updateText);
        }}
      />

      {/* 繁體轉簡體 */}
      <FunctionButton
        icon={<Languages className="h-5 w-5 mr-2" />}
        text="繁體轉簡體"
        onClick={async () => {
          transformSelectedText(text, convertToSimplified, updateText);
        }}
      />

      {/* 中文、英文加空格 */}
      <FunctionButton
        icon={<UnfoldHorizontal className="h-5 w-5 mr-2" />}
        text="中文、英文加空格"
        onClick={() => {
          transformSelectedText(text, panguSpacing, updateText);
        }}
      />

      {/* 英文轉大寫 */}
      <FunctionButton
        icon={<CaseUpper className="h-5 w-5 mr-2" />}
        text="英文轉大寫"
        onClick={() => {
          transformSelectedText(text, toUpperCase, updateText);
        }}
      />

      {/* 英文轉小寫 */}
      <FunctionButton
        icon={<CaseLower className="h-5 w-5 mr-2" />}
        text="英文轉小寫"
        onClick={() => {
          transformSelectedText(text, toLowerCase, updateText);
        }}
      />

      {/* 英文句首大寫 */}
      <FunctionButton
        icon={<CaseSensitive className="h-5 w-5 mr-2" />}
        text="英文句首大寫"
        onClick={() => {
          transformSelectedText(text, toSentenceCase, updateText);
        }}
      />

      {/* 英文單字字首大寫 */}
      <FunctionButton
        icon={<CaseSensitive className="h-5 w-5 mr-2" />}
        text="英文單字字首大寫"
        onClick={() => {
          transformSelectedText(text, toTitleCase, updateText);
        }}
      />

      {/* 數字、英文轉全形 */}
      <FunctionButton
        icon={<ArrowBigUpDash className="h-5 w-5 mr-2" />}
        text="數字、英文轉全形"
        onClick={() => {
          transformSelectedText(text, toFullWidth, updateText);
        }}
      />

      {/* 數字、英文轉半形 */}
      <FunctionButton
        icon={<ArrowBigDownDash className="h-5 w-5 mr-2" />}
        text="數字、英文轉半形"
        onClick={() => {
          transformSelectedText(text, toHalfWidth, updateText);
        }}
      />
    </div>
  );
};
