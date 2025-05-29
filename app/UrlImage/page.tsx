"use client";

import React, { useState, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Download, Image, Link, Settings } from "lucide-react";

interface PageData {
  title: string;
  imageUrl: string;
  originalUrl: string;
}

interface ImageSettings {
  sizeMode: "preset" | "custom";
  ratio: string;
  baseWidth: number;
  customWidth: number;
  customHeight: number;
  fontSize: number;
  fontSizeMode: "auto" | "manual";
}

type MessageType = "success" | "error" | "info";

interface Message {
  type: MessageType;
  content: string;
}

const UrlImageComposer: React.FC = () => {
  const [url, setUrl] = useState<string>("");
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [settings, setSettings] = useState<ImageSettings>({
    sizeMode: "preset",
    ratio: "1:1",
    baseWidth: 800,
    customWidth: 800,
    customHeight: 800,
    fontSize: 24,
    fontSizeMode: "auto",
  });
  const [message, setMessage] = useState<Message | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [previewCanvas, setPreviewCanvas] = useState<HTMLCanvasElement | null>(
    null,
  );
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  const showMessage = useCallback((type: MessageType, content: string) => {
    setMessage({ type, content });
    setTimeout(() => setMessage(null), 5000);
  }, []);

  const fetchWebPage = async (targetUrl: string): Promise<string> => {
    const proxies = [
      "https://api.codetabs.com/v1/proxy?quest=",
      "https://api.allorigins.win/raw?url=",
      "https://thingproxy.freeboard.io/fetch/",
      "https://corsproxy.io/?",
    ];

    for (const proxy of proxies) {
      try {
        console.log("嘗試代理:", proxy);
        const response = await fetch(proxy + encodeURIComponent(targetUrl), {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; WebBot/1.0)" },
        });

        if (response.ok) {
          return await response.text();
        }
      } catch (error) {
        console.log("代理失敗:", error);
      }
    }
    throw new Error("所有網頁代理都失敗");
  };

  const parseWebPage = (
    html: string,
    baseUrl: string,
  ): { title: string; imageUrl: string } => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // 獲取標題
    let title = "";
    const ogTitle = doc.querySelector('meta[property="og:title"]');
    const titleTag = doc.querySelector("title");

    if (ogTitle) title = ogTitle.getAttribute("content") || "";
    else if (titleTag) title = titleTag.textContent || "";

    // 獲取圖片
    let imageUrl = "";
    const ogImage = doc.querySelector('meta[property="og:image"]');
    const imgTags = doc.querySelectorAll("img[src]");

    if (ogImage) {
      imageUrl = ogImage.getAttribute("content") || "";
    } else if (imgTags.length > 0) {
      // 找最大的圖片
      for (const img of imgTags) {
        const src = img.getAttribute("src");
        if (src && src.length > imageUrl.length) {
          imageUrl = src;
        }
      }
    }

    // 處理相對路徑
    if (imageUrl && !imageUrl.startsWith("http")) {
      const base = new URL(baseUrl);
      imageUrl = imageUrl.startsWith("/")
        ? base.origin + imageUrl
        : base.origin + "/" + imageUrl;
    }

    return { title: title.trim(), imageUrl };
  };

  const processUrl = async () => {
    if (!url.trim()) {
      showMessage("error", "請輸入網址");
      return;
    }

    setIsProcessing(true);
    setPageData(null);
    setPreviewCanvas(null);

    // 清理之前的 blob URLs
    if (previewBlobUrl) {
      URL.revokeObjectURL(previewBlobUrl);
      setPreviewBlobUrl(null);
    }
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
    }

    try {
      const fullUrl = url.startsWith("http") ? url : "https://" + url;
      const html = await fetchWebPage(fullUrl);
      const { title, imageUrl } = parseWebPage(html, fullUrl);

      if (!title && !imageUrl) {
        showMessage("error", "無法找到標題或圖片");
        return;
      }

      const data: PageData = {
        title: title || "無標題",
        imageUrl,
        originalUrl: fullUrl,
      };

      setPageData(data);
      console.log("設定頁面資料:", data);

      if (data.title && imageUrl) {
        showMessage("success", `成功獲取網頁資訊！標題: ${data.title}`);
      } else {
        showMessage("error", "需要標題和圖片才能合成");
      }
    } catch (error) {
      showMessage(
        "error",
        `處理失敗: ${error instanceof Error ? error.message : "未知錯誤"}`,
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = async (imageUrl: string): Promise<string> => {
    const proxies = [
      "https://images.weserv.nl/?url=",
      "https://api.codetabs.com/v1/proxy?quest=",
      "https://api.allorigins.win/raw?url=",
      "https://corsproxy.io/?",
    ];

    for (const proxy of proxies) {
      try {
        console.log("嘗試下載圖片:", proxy);

        let fetchUrl: string;
        if (proxy.includes("weserv.nl")) {
          fetchUrl =
            proxy + encodeURIComponent(imageUrl.replace(/^https?:\/\//, ""));
        } else {
          fetchUrl = proxy + encodeURIComponent(imageUrl);
        }

        const response = await fetch(fetchUrl, {
          headers: { Accept: "image/*" },
        });

        if (response.ok) {
          const blob = await response.blob();
          if (blob.type.startsWith("image/") && blob.size > 1000) {
            return URL.createObjectURL(blob);
          }
        }
      } catch (error) {
        console.log("圖片代理失敗:", error);
      }
    }

    throw new Error("所有圖片代理都失敗");
  };

  const getImageSize = (): { width: number; height: number } => {
    if (settings.sizeMode === "custom") {
      return {
        width: settings.customWidth,
        height: settings.customHeight,
      };
    } else {
      const [w, h] = settings.ratio.split(":").map(Number);
      return {
        width: settings.baseWidth,
        height: Math.round((settings.baseWidth * h) / w),
      };
    }
  };

  // 使用 useMemo 來計算預覽樣式，當設定改變時自動更新
  const previewStyle = useMemo(() => {
    if (!pageData || !pageData.title || !pageData.imageUrl) return null;

    const { width, height } = getImageSize();
    const maxPreviewWidth = 500;
    const maxPreviewHeight = 400;

    // 計算適合預覽區域的尺寸，保持比例
    let previewWidth = width;
    let previewHeight = height;

    if (width > maxPreviewWidth) {
      previewWidth = maxPreviewWidth;
      previewHeight = (height * maxPreviewWidth) / width;
    }

    if (previewHeight > maxPreviewHeight) {
      previewHeight = maxPreviewHeight;
      previewWidth = (width * maxPreviewHeight) / height;
    }

    // 計算適合預覽的字體大小
    let fontSize: number;
    if (settings.fontSizeMode === "auto") {
      fontSize = Math.max(
        16,
        Math.min(32, Math.min(previewWidth, previewHeight) / 25),
      );
    } else {
      fontSize = settings.fontSize;
    }

    return {
      width: previewWidth,
      height: previewHeight,
      aspectRatio: `${width}/${height}`,
      fontSize: fontSize,
    };
  }, [pageData, settings]);

  // 處理圖片載入錯誤
  const [imageError, setImageError] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  const handleImageError = useCallback(() => {
    console.log("預覽圖片載入失敗:", previewBlobUrl);
    setImageError(true);
    setImageLoaded(false);
  }, [previewBlobUrl]);

  const handleImageLoad = useCallback(() => {
    console.log("預覽圖片載入成功:", previewBlobUrl);
    setImageError(false);
    setImageLoaded(true);
  }, [previewBlobUrl]);

  // 當 pageData 改變時載入預覽圖片
  React.useEffect(() => {
    const loadPreviewImage = async () => {
      if (!pageData?.imageUrl) {
        setPreviewBlobUrl(null);
        setImageError(false);
        setImageLoaded(false);
        return;
      }

      setIsLoadingPreview(true);
      setImageError(false);
      setImageLoaded(false);

      try {
        // 清理之前的 blob URL
        if (previewBlobUrl) {
          URL.revokeObjectURL(previewBlobUrl);
        }

        // 下載圖片為 blob
        const newBlobUrl = await downloadImage(pageData.imageUrl);
        setPreviewBlobUrl(newBlobUrl);
        console.log("預覽圖片 blob URL 已生成:", newBlobUrl);
      } catch (error) {
        console.error("載入預覽圖片失敗:", error);
        setImageError(true);
      } finally {
        setIsLoadingPreview(false);
      }
    };

    loadPreviewImage();

    // 清理函數
    return () => {
      if (previewBlobUrl) {
        URL.revokeObjectURL(previewBlobUrl);
      }
    };
  }, [pageData?.imageUrl]);

  const generateImage = async () => {
    if (!pageData || !pageData.imageUrl) {
      showMessage("error", "沒有可用的資料");
      return;
    }

    setIsGenerating(true);

    try {
      // 清理之前的 blob URL
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }

      // 下載圖片到暫存
      const newBlobUrl = await downloadImage(pageData.imageUrl);
      setBlobUrl(newBlobUrl);

      // 獲取尺寸設定
      const { width, height } = getImageSize();

      // 等待 DOM 更新
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 動態載入 html2canvas
      if (!(window as any).html2canvas) {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        document.head.appendChild(script);

        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      // 創建隱藏的合成容器
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.background = "white";
      tempContainer.style.width = width + "px";

      const wrapper = document.createElement("div");
      wrapper.style.position = "relative";
      wrapper.style.overflow = "hidden";
      wrapper.style.width = width + "px";
      wrapper.style.height = height + "px";

      const backgroundDiv = document.createElement("div");
      backgroundDiv.style.width = "100%";
      backgroundDiv.style.height = "100%";
      backgroundDiv.style.backgroundSize = "cover";
      backgroundDiv.style.backgroundPosition = "center center";
      backgroundDiv.style.backgroundRepeat = "no-repeat";
      backgroundDiv.style.backgroundImage = `url(${newBlobUrl})`;

      const titleDiv = document.createElement("div");
      titleDiv.style.position = "absolute";
      titleDiv.style.bottom = "0";
      titleDiv.style.left = "0";
      titleDiv.style.right = "0";
      titleDiv.style.background =
        "linear-gradient(transparent, rgba(0,0,0,0.8))";
      titleDiv.style.color = "white";
      titleDiv.style.padding = "50px";
      titleDiv.style.paddingTop = "80px";
      titleDiv.style.textAlign = "center";
      titleDiv.style.fontWeight = "bold";
      titleDiv.textContent = pageData.title;

      // 動態調整字體
      let fontSize: number;
      if (settings.fontSizeMode === "auto") {
        fontSize = Math.max(16, Math.min(32, Math.min(width, height) / 25));
      } else {
        fontSize = settings.fontSize;
      }
      titleDiv.style.fontSize = fontSize + "px";

      wrapper.appendChild(backgroundDiv);
      wrapper.appendChild(titleDiv);
      tempContainer.appendChild(wrapper);
      document.body.appendChild(tempContainer);

      // 生成最終圖片
      const canvas = await (window as any).html2canvas(tempContainer, {
        backgroundColor: "white",
        scale: 1,
        width: width,
        height: height,
        useCORS: false,
        allowTaint: false,
      });

      // 清理臨時容器
      document.body.removeChild(tempContainer);

      setPreviewCanvas(canvas);
      showMessage("success", `圖片產生成功！尺寸: ${width}x${height}px`);
    } catch (error) {
      showMessage(
        "error",
        `產生圖片失敗: ${error instanceof Error ? error.message : "未知錯誤"}`,
      );
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadFinalImage = async () => {
    if (!pageData || !pageData.imageUrl) {
      showMessage("error", "沒有可用的資料");
      return;
    }

    setIsGenerating(true);

    try {
      let downloadBlobUrl = blobUrl;

      // 如果沒有 blob URL，或者需要重新下載
      if (!downloadBlobUrl) {
        // 可以重用預覽的 blob URL 如果存在
        if (previewBlobUrl) {
          downloadBlobUrl = previewBlobUrl;
        } else {
          downloadBlobUrl = await downloadImage(pageData.imageUrl);
        }
        setBlobUrl(downloadBlobUrl);
      }

      // 獲取尺寸設定
      const { width, height } = getImageSize();

      // 等待 DOM 更新
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 動態載入 html2canvas
      if (!(window as any).html2canvas) {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        document.head.appendChild(script);

        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      // 創建隱藏的合成容器
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.background = "white";
      tempContainer.style.width = width + "px";

      const wrapper = document.createElement("div");
      wrapper.style.position = "relative";
      wrapper.style.overflow = "hidden";
      wrapper.style.width = width + "px";
      wrapper.style.height = height + "px";

      const backgroundDiv = document.createElement("div");
      backgroundDiv.style.width = "100%";
      backgroundDiv.style.height = "100%";
      backgroundDiv.style.backgroundSize = "cover";
      backgroundDiv.style.backgroundPosition = "center center";
      backgroundDiv.style.backgroundRepeat = "no-repeat";
      backgroundDiv.style.backgroundImage = `url(${downloadBlobUrl})`;

      const titleDiv = document.createElement("div");
      titleDiv.style.position = "absolute";
      titleDiv.style.bottom = "0";
      titleDiv.style.left = "0";
      titleDiv.style.right = "0";
      titleDiv.style.background =
        "linear-gradient(transparent, rgba(0,0,0,0.8))";
      titleDiv.style.color = "white";
      titleDiv.style.padding = "50px";
      titleDiv.style.paddingTop = "80px";
      titleDiv.style.textAlign = "center";
      titleDiv.style.fontWeight = "bold";
      titleDiv.textContent = pageData.title;

      // 動態調整字體
      const fontSize = Math.max(16, Math.min(32, Math.min(width, height) / 25));
      titleDiv.style.fontSize = fontSize + "px";

      wrapper.appendChild(backgroundDiv);
      wrapper.appendChild(titleDiv);
      tempContainer.appendChild(wrapper);
      document.body.appendChild(tempContainer);

      // 生成最終圖片
      const canvas = await (window as any).html2canvas(tempContainer, {
        backgroundColor: "white",
        scale: 1,
        width: width,
        height: height,
        useCORS: false,
        allowTaint: false,
      });

      // 清理臨時容器
      document.body.removeChild(tempContainer);

      // 直接下載圖片
      const link = document.createElement("a");
      const filename =
        pageData.title.replace(/[^\w\u4e00-\u9fa5]/g, "_").substring(0, 50) +
        ".png";

      link.download = filename;
      link.href = canvas.toDataURL("image/png");
      link.click();

      showMessage("success", `圖片下載成功！尺寸: ${width}x${height}px`);
    } catch (error) {
      showMessage(
        "error",
        `產生圖片失敗: ${error instanceof Error ? error.message : "未知錯誤"}`,
      );
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden">
      <div className="flex h-full">
        {/* 左側控制面板 */}
        <div className="w-1/2 overflow-y-auto border-r bg-gray-50/50 p-6">
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="mb-2 text-2xl font-bold">網址圖片合成器</h1>
              <p className="text-sm text-muted-foreground">
                輸入網址，自動提取標題和圖片，合成為精美的預覽圖
              </p>
            </div>

            {/* URL 輸入區域 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Link className="h-5 w-5" />
                  網址輸入
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="請貼上網址"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={processUrl} disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        處理
                      </>
                    ) : (
                      "獲取"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 訊息顯示 */}
            {message && (
              <Alert
                className={`${
                  message.type === "error"
                    ? "border-red-200 bg-red-50 text-red-800"
                    : message.type === "success"
                      ? "border-green-200 bg-green-50 text-green-800"
                      : "border-blue-200 bg-blue-50 text-blue-800"
                }`}
              >
                <AlertDescription className="text-sm">
                  {message.content}
                </AlertDescription>
              </Alert>
            )}

            {/* 網頁資訊編輯 */}
            {pageData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Image className="h-5 w-5" />
                    網頁資訊
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">標題:</Label>
                    <Input
                      value={pageData.title}
                      onChange={(e) =>
                        setPageData((prev) =>
                          prev ? { ...prev, title: e.target.value } : null,
                        )
                      }
                      className="mt-1"
                      placeholder="請輸入標題"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">圖片網址:</Label>
                    <Input
                      value={pageData.imageUrl}
                      onChange={(e) =>
                        setPageData((prev) =>
                          prev ? { ...prev, imageUrl: e.target.value } : null,
                        )
                      }
                      className="mt-1"
                      placeholder="請輸入圖片網址"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 設定區域 */}
            {pageData && pageData.title && pageData.imageUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Settings className="h-5 w-5" />
                    圖片設定
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={settings.sizeMode}
                    onValueChange={(value: "preset" | "custom") =>
                      setSettings((prev) => ({ ...prev, sizeMode: value }))
                    }
                  >
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="preset" id="preset" />
                        <Label htmlFor="preset" className="text-sm">
                          圖片比例
                        </Label>
                        <Select
                          value={settings.ratio}
                          onValueChange={(value) =>
                            setSettings((prev) => ({ ...prev, ratio: value }))
                          }
                          disabled={settings.sizeMode !== "preset"}
                        >
                          <SelectTrigger className="h-8 w-32 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1:1">1:1 正方形</SelectItem>
                            <SelectItem value="16:9">16:9 橫式</SelectItem>
                            <SelectItem value="4:3">4:3 橫式</SelectItem>
                            <SelectItem value="9:16">9:16 直式</SelectItem>
                            <SelectItem value="3:4">3:4 直式</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="custom" id="custom" />
                        <Label htmlFor="custom" className="text-sm">
                          自訂尺寸
                        </Label>
                      </div>

                      {settings.sizeMode === "custom" && (
                        <div className="ml-6 space-y-2">
                          <div className="flex items-center gap-2">
                            <Label className="w-10 text-sm">寬:</Label>
                            <Input
                              type="number"
                              value={settings.customWidth}
                              onChange={(e) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  customWidth: parseInt(e.target.value) || 800,
                                }))
                              }
                              min={200}
                              max={2000}
                              className="h-8 w-16 text-sm"
                            />
                            <span className="text-xs text-muted-foreground">
                              px
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="w-10 text-sm">高:</Label>
                            <Input
                              type="number"
                              value={settings.customHeight}
                              onChange={(e) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  customHeight: parseInt(e.target.value) || 800,
                                }))
                              }
                              min={200}
                              max={2000}
                              className="h-8 w-16 text-sm"
                            />
                            <span className="text-xs text-muted-foreground">
                              px
                            </span>
                          </div>
                        </div>
                      )}

                      {settings.sizeMode === "preset" && (
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">基準寬度:</Label>
                          <Input
                            type="number"
                            value={settings.baseWidth}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                baseWidth: parseInt(e.target.value) || 800,
                              }))
                            }
                            min={400}
                            max={1600}
                            className="h-8 w-16 text-sm"
                          />
                          <span className="text-xs text-muted-foreground">
                            px
                          </span>
                        </div>
                      )}
                    </div>
                  </RadioGroup>

                  {/* 文字大小設定 */}
                  <div className="border-t pt-4">
                    <Label className="mb-3 block text-sm font-medium">
                      文字大小設定
                    </Label>
                    <RadioGroup
                      value={settings.fontSizeMode}
                      onValueChange={(value: "auto" | "manual") =>
                        setSettings((prev) => ({
                          ...prev,
                          fontSizeMode: value,
                        }))
                      }
                    >
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="auto" id="fontAuto" />
                          <Label htmlFor="fontAuto" className="text-sm">
                            自動調整
                          </Label>
                          <span className="text-xs text-muted-foreground">
                            (根據圖片尺寸)
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="manual" id="fontManual" />
                          <Label htmlFor="fontManual" className="text-sm">
                            手動設定
                          </Label>
                        </div>

                        {settings.fontSizeMode === "manual" && (
                          <div className="ml-6 flex items-center gap-2">
                            <Label className="text-sm">字體大小:</Label>
                            <Input
                              type="number"
                              value={settings.fontSize}
                              onChange={(e) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  fontSize: parseInt(e.target.value) || 24,
                                }))
                              }
                              min={12}
                              max={100}
                              className="h-8 w-16 text-sm"
                            />
                            <span className="text-xs text-muted-foreground">
                              px
                            </span>
                          </div>
                        )}
                      </div>
                    </RadioGroup>
                  </div>

                  <Button
                    onClick={downloadFinalImage}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        產生中
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        下載圖片
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* 右側預覽區域 */}
        <div className="flex w-1/2 flex-col">
          <div className="border-b bg-gray-50/50 px-6 py-4">
            <h2 className="text-lg font-semibold">預覽區域</h2>
            <p className="text-sm text-muted-foreground">
              產生的圖片會在這裡顯示
            </p>
          </div>

          <div className="flex flex-1 items-center justify-center bg-gray-50/30 p-6">
            {pageData && pageData.title && pageData.imageUrl && previewStyle ? (
              <div className="flex max-h-full w-full max-w-full items-center justify-center">
                <div
                  className="relative overflow-hidden rounded-lg bg-white shadow-lg transition-all duration-300"
                  style={{
                    width: previewStyle.width + "px",
                    height: previewStyle.height + "px",
                    aspectRatio: previewStyle.aspectRatio,
                  }}
                >
                  {/* 載入狀態顯示 */}
                  {(isLoadingPreview ||
                    (!imageLoaded && !imageError && previewBlobUrl)) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <div className="text-center">
                        <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-gray-400" />
                        <p className="text-sm text-gray-500">
                          載入預覽圖片中...
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 背景圖片 - 使用 blob URL */}
                  {previewBlobUrl && !imageError && (
                    <img
                      src={previewBlobUrl}
                      alt="預覽背景"
                      className={`absolute inset-0 h-full w-full object-cover transition-all duration-300 ${
                        imageLoaded ? "opacity-100" : "opacity-0"
                      }`}
                      onError={handleImageError}
                      onLoad={handleImageLoad}
                    />
                  )}

                  {/* 圖片載入失敗時的替代顯示 */}
                  {(imageError || (!previewBlobUrl && !isLoadingPreview)) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200">
                      <Image className="mb-2 h-12 w-12 text-gray-400" />
                      <p className="px-4 text-center text-sm text-gray-500">
                        圖片載入失敗
                      </p>
                      <p className="mt-1 max-w-full break-all px-4 text-center text-xs text-gray-400">
                        {pageData.imageUrl.length > 50
                          ? pageData.imageUrl.substring(0, 50) + "..."
                          : pageData.imageUrl}
                      </p>
                    </div>
                  )}

                  {/* 標題疊加 - 只在圖片載入後或載入失敗時顯示 */}
                  {(imageLoaded ||
                    imageError ||
                    (!previewBlobUrl && !isLoadingPreview)) && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-8 text-center">
                      <h3
                        className="font-bold leading-tight text-white transition-all duration-300"
                        style={{
                          fontSize: previewStyle.fontSize + "px",
                        }}
                      >
                        {pageData.title}
                      </h3>
                    </div>
                  )}

                  {/* 尺寸資訊顯示 */}
                  <div className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
                    {getImageSize().width} × {getImageSize().height}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-lg bg-gray-200">
                  <Image className="h-12 w-12 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-600">
                    尚未載入內容
                  </p>
                  <p className="text-sm text-gray-500">
                    請先輸入網址並獲取網頁資訊
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 隱藏的合成容器 */}
        <div ref={canvasRef} className="absolute left-[-9999px] bg-white" />
      </div>
    </div>
  );
};

export default UrlImageComposer;
