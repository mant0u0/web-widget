// hooks/useLocalStorage.ts
import { useState, useEffect } from "react";

function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((val: T) => T)) => void] {
  // 只在客戶端執行時讀取 localStorage
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // 從 localStorage 讀取初始值
  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
    setIsLoaded(true);
  }, [key]);

  // 返回包裝過的版本的 useState，將值同時寫入 localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // 允許值是一個函數，就像 useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      // 儲存到 state
      setStoredValue(valueToStore);

      // 儲存到 localStorage
      if (isLoaded && typeof window !== "undefined") {
        localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;
