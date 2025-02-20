"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trash2, Plus, RefreshCw } from "lucide-react";

type Currency = "TWD" | "USD" | "JPY" | "EUR" | "GBP" | "CNY";

interface Fee {
  id: number;
  name: string;
  amount: string;
  currency: Currency;
}

interface CalculationResults {
  cost: string;
  final: string;
  profit: string;
  feesTotal: string;
  baseForMarkup: string;
}

interface CurrencyInfo {
  label: string;
  defaultRate: number;
  symbol: string;
}

const CURRENCY_INFO: Record<Currency, CurrencyInfo> = {
  TWD: { label: "台幣", defaultRate: 1, symbol: "NT$" },
  USD: { label: "美金", defaultRate: 31.5, symbol: "$" },
  JPY: { label: "日圓", defaultRate: 0.22, symbol: "¥" },
  EUR: { label: "歐元", defaultRate: 34.5, symbol: "€" },
  GBP: { label: "英鎊", defaultRate: 40.2, symbol: "£" },
  CNY: { label: "人民幣", defaultRate: 4.4, symbol: "¥" },
};

const PurchaseCalculator: React.FC = () => {
  const [foreignPrice, setForeignPrice] = useState<string>("");
  const [sourceCurrency, setSourceCurrency] = useState<Currency>("JPY");
  const [markup, setMarkup] = useState<string>("30");
  const [exchangeRate, setExchangeRate] = useState<string>(
    CURRENCY_INFO.JPY.defaultRate.toString(),
  );
  const [includeFeesInMarkup, setIncludeFeesInMarkup] = useState<boolean>(true);
  const [fees, setFees] = useState<Fee[]>([
    { id: 1, name: "運費", amount: "", currency: "TWD" },
  ]);
  const [isLoadingRates, setIsLoadingRates] = useState<boolean>(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("");

  // 取得即時匯率
  const fetchExchangeRates = async (currency: Currency) => {
    setIsLoadingRates(true);
    try {
      const response = await fetch(
        `https://api.coinbase.com/v2/exchange-rates?currency=${currency}`,
      );
      if (!response.ok) throw new Error("匯率資料取得失敗");

      const data = await response.json();
      const twdRate = parseFloat(data.data.rates.TWD);
      let newRate: number;

      if (currency === "TWD") {
        newRate = 1;
      } else {
        newRate = twdRate;
      }

      setExchangeRate(newRate.toFixed(currency === "JPY" ? 3 : 2));
      setLastUpdateTime(new Date().toLocaleString());
    } catch (error) {
      console.error("匯率更新失敗:", error);
      alert("匯率更新失敗，請稍後再試或手動輸入匯率");
    } finally {
      setIsLoadingRates(false);
    }
  };

  // 當幣別改變時自動更新匯率
  useEffect(() => {
    fetchExchangeRates(sourceCurrency);
  }, [sourceCurrency]);

  // 新增費用項目
  const addFee = () => {
    const newId = Math.max(0, ...fees.map((f) => f.id)) + 1;
    setFees([...fees, { id: newId, name: "", amount: "", currency: "TWD" }]);
  };

  // 刪除費用項目
  const removeFee = (id: number) => {
    setFees(fees.filter((fee) => fee.id !== id));
  };

  // 更新幣別
  const handleSourceCurrencyChange = (newCurrency: Currency) => {
    setSourceCurrency(newCurrency);
  };

  // 更新費用項目
  const updateFee = (id: number, field: keyof Fee, value: string) => {
    setFees(
      fees.map((fee) => {
        if (fee.id !== id) return fee;

        if (
          field === "currency" &&
          Object.keys(CURRENCY_INFO).includes(value)
        ) {
          const currentAmount = parseFloat(fee.amount);
          if (!isNaN(currentAmount)) {
            const targetCurrency = value as Currency;
            const currentCurrency = fee.currency;

            // 先轉換為台幣，再轉換為目標幣別
            const amountInTWD =
              currentCurrency === "TWD"
                ? currentAmount
                : currentAmount * CURRENCY_INFO[currentCurrency].defaultRate;

            let newAmount: string;
            if (targetCurrency === "TWD") {
              newAmount = amountInTWD.toFixed(2);
            } else {
              const targetRate = CURRENCY_INFO[targetCurrency].defaultRate;
              newAmount = (amountInTWD / targetRate).toFixed(
                targetCurrency === "JPY" ? 0 : 2,
              );
            }

            return { ...fee, currency: targetCurrency, amount: newAmount };
          }
        }

        return { ...fee, [field]: value };
      }),
    );
  };

  // 計算價格
  const calculatePrice = (): CalculationResults => {
    if (!foreignPrice)
      return {
        cost: "0",
        final: "0",
        profit: "0",
        feesTotal: "0",
        baseForMarkup: "0",
      };

    const priceInForeign = parseFloat(foreignPrice);
    const rate = parseFloat(exchangeRate);
    const markupRate = parseFloat(markup) / 100;

    // 計算商品成本（台幣）
    const baseCost = priceInForeign * rate;

    // 計算額外費用總和（台幣）
    const totalFees = fees.reduce((sum, fee) => {
      if (!fee.amount) return sum;
      const amount = parseFloat(fee.amount);
      if (fee.currency === "TWD") return sum + amount;
      return (
        sum +
        amount * parseFloat(CURRENCY_INFO[fee.currency].defaultRate.toString())
      );
    }, 0);

    const totalCost = baseCost + totalFees;
    const baseForMarkup = includeFeesInMarkup ? totalCost : baseCost;
    const markupAmount = baseForMarkup * markupRate;
    const finalPrice = totalCost + markupAmount;
    const profit = finalPrice - totalCost;

    return {
      cost: totalCost.toFixed(2),
      final: finalPrice.toFixed(2),
      profit: profit.toFixed(2),
      feesTotal: totalFees.toFixed(2),
      baseForMarkup: baseForMarkup.toFixed(2),
    };
  };

  const results = calculatePrice();

  return (
    <div className="p-8">
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            代購價格計算器
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">商品原價</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={foreignPrice}
                  onChange={(e) => setForeignPrice(e.target.value)}
                  className="flex-1 rounded border p-2"
                  placeholder={`請輸入${CURRENCY_INFO[sourceCurrency].label}金額`}
                />
                <select
                  value={sourceCurrency}
                  onChange={(e) =>
                    handleSourceCurrencyChange(e.target.value as Currency)
                  }
                  className="w-24 rounded border p-2"
                >
                  {Object.entries(CURRENCY_INFO).map(([code, info]) => (
                    <option key={code} value={code}>
                      {info.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">匯率設定</label>
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={exchangeRate}
                      onChange={(e) => setExchangeRate(e.target.value)}
                      className="w-full rounded border p-2"
                      step="0.001"
                      placeholder="請輸入匯率"
                    />
                    <button
                      onClick={() => fetchExchangeRates(sourceCurrency)}
                      className="p-2 text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                      disabled={isLoadingRates}
                      title="更新即時匯率"
                    >
                      <RefreshCw
                        size={20}
                        className={isLoadingRates ? "animate-spin" : ""}
                      />
                    </button>
                  </div>
                  {lastUpdateTime && (
                    <p className="text-xs text-gray-500">
                      最後更新: {lastUpdateTime}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">加價設定</label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={markup}
                  onChange={(e) => setMarkup(e.target.value)}
                  className="w-32 rounded border p-2"
                  placeholder="百分比"
                />
                <span className="text-sm">%</span>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="includeFeesInMarkup"
                    checked={includeFeesInMarkup}
                    onChange={(e) => setIncludeFeesInMarkup(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <label htmlFor="includeFeesInMarkup" className="text-sm">
                    包含額外費用在加價計算中
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium">費用項目</label>
                <button
                  onClick={addFee}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <Plus size={16} className="mr-1" />
                  新增費用項目
                </button>
              </div>

              {fees.map((fee) => (
                <div key={fee.id} className="flex items-start gap-2">
                  <input
                    type="text"
                    value={fee.name}
                    onChange={(e) => updateFee(fee.id, "name", e.target.value)}
                    className="flex-1 rounded border p-2"
                    placeholder="費用名稱"
                  />
                  <input
                    type="number"
                    value={fee.amount}
                    onChange={(e) =>
                      updateFee(fee.id, "amount", e.target.value)
                    }
                    className="w-32 rounded border p-2"
                    placeholder="金額"
                  />
                  <select
                    value={fee.currency}
                    onChange={(e) =>
                      updateFee(fee.id, "currency", e.target.value as Currency)
                    }
                    className="w-24 rounded border p-2"
                  >
                    {Object.entries(CURRENCY_INFO).map(([code, info]) => (
                      <option key={code} value={code}>
                        {info.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeFee(fee.id)}
                    className="p-2 text-red-600 hover:text-red-800"
                    aria-label="刪除費用項目"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-gray-50 p-4">
            <h3 className="mb-4 text-lg font-semibold">計算結果</h3>
            <div className="space-y-2">
              <p className="flex justify-between">
                <span>商品成本:</span>
                <span className="font-medium">
                  NT${" "}
                  {(
                    parseFloat(foreignPrice || "0") * parseFloat(exchangeRate)
                  ).toFixed(2)}
                </span>
              </p>
              <p className="flex justify-between">
                <span>費用總額:</span>
                <span className="font-medium">NT$ {results.feesTotal}</span>
              </p>
              <p className="flex justify-between">
                <span>成本總額:</span>
                <span className="font-medium">NT$ {results.cost}</span>
              </p>
              <p className="flex justify-between">
                <span>加價基準金額:</span>
                <span className="font-medium">NT$ {results.baseForMarkup}</span>
              </p>
              <p className="flex justify-between">
                <span>加價金額 ({markup}%):</span>
                <span className="font-medium">
                  NT${" "}
                  {(
                    (parseFloat(results.baseForMarkup) * parseFloat(markup)) /
                    100
                  ).toFixed(2)}
                </span>
              </p>
              <p className="flex justify-between">
                <span>建議售價:</span>
                <span className="font-medium">NT$ {results.final}</span>
              </p>
              <p className="flex justify-between">
                <span>預估利潤:</span>
                <span className="font-medium text-green-600">
                  NT$ {results.profit}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseCalculator;
