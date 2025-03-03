// components/DeviceDetector.tsx
"use client";

import { useEffect } from "react";

export default function DeviceDetector() {
  useEffect(() => {
    // 檢測是否為移動設備
    const isMobile = () => {
      const userAgent = navigator.userAgent;
      const mobileRegex =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      return mobileRegex.test(userAgent) || window.innerWidth < 768;
    };

    // 根據設備類型更改 body 的類名
    if (isMobile()) {
      document.body.classList.remove("font-include-emoji");
      document.body.classList.add("font-no-emoji");
      console.log("Mobile detected - using font-no-emoji class");
    } else {
      document.body.classList.remove("font-no-emoji");
      document.body.classList.add("font-include-emoji");
      console.log("Desktop detected - using font-include-emoji class");
    }

    // 監聽窗口大小變化
    const handleResize = () => {
      if (window.innerWidth < 768) {
        document.body.classList.remove("font-include-emoji");
        document.body.classList.add("font-no-emoji");
      } else {
        document.body.classList.remove("font-no-emoji");
        document.body.classList.add("font-include-emoji");
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return null;
}
