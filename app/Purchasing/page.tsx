"use client";

import React, { useState, ChangeEvent } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";

interface Fee {
  id: number;
  name: string;
  amount: string;
  currency: "TWD" | "JPY";
}

interface CalculationResults {
  cost: string;
  final: string;
  profit: string;
  feesTotal: string;
}

const PurchaseCalculator: React.FC = () => {
  const [japanPrice, setJapanPrice] = useState<string>("");
  const [markup, setMarkup] = useState<string>("30");
  const [exchangeRate, setExchangeRate] = useState<string>("0.22");
  const [fees, setFees] = useState<Fee[]>([
    { id: 1, name: "運費", amount: "", currency: "TWD" },
  ]);

  const addFee = (): void => {
    const newId = Math.max(0, ...fees.map((f) => f.id)) + 1;
    setFees([...fees, { id: newId, name: "", amount: "", currency: "TWD" }]);
  };

  const removeFee = (id: number): void => {
    setFees(fees.filter((fee) => fee.id !== id));
  };

  const updateFee = (id: number, field: keyof Fee, value: string): void => {
    setFees(
      fees.map((fee) => {
        if (fee.id !== id) return fee;

        if (field === "currency") {
          const currentAmount = parseFloat(fee.amount);
          if (!isNaN(currentAmount)) {
            const rate = parseFloat(exchangeRate);
            let newAmount: string;
            if (fee.currency === "TWD" && value === "JPY") {
              // 台幣轉日圓
              newAmount = Math.round(currentAmount / rate).toString();
            } else if (fee.currency === "JPY" && value === "TWD") {
              // 日圓轉台幣
              newAmount = (currentAmount * rate).toFixed(2);
            } else {
              return fee;
            }
            return { ...fee, [field]: value, amount: newAmount };
          }
        }

        return { ...fee, [field]: value };
      }),
    );
  };

  const calculatePrice = (): CalculationResults => {
    if (!japanPrice)
      return { cost: "0", final: "0", profit: "0", feesTotal: "0" };

    const priceInYen = parseFloat(japanPrice);
    const rate = parseFloat(exchangeRate);
    const markupRate = parseFloat(markup) / 100;

    // Calculate base cost in TWD
    const baseCost = priceInYen * rate;

    // Calculate additional fees in TWD
    const totalFees = fees.reduce((sum, fee) => {
      if (!fee.amount) return sum;
      const amount = parseFloat(fee.amount);
      return sum + (fee.currency === "JPY" ? amount * rate : amount);
    }, 0);

    const totalCost = baseCost + totalFees;
    const finalPrice = totalCost * (1 + markupRate);
    const profit = finalPrice - totalCost;

    return {
      cost: totalCost.toFixed(2),
      final: finalPrice.toFixed(2),
      profit: profit.toFixed(2),
      feesTotal: totalFees.toFixed(2),
    };
  };

  const handleExchangeRateChange = (newRate: string): void => {
    setExchangeRate(newRate);
    const oldRate = parseFloat(exchangeRate);
    const newRateNum = parseFloat(newRate);

    if (isNaN(newRateNum) || isNaN(oldRate)) return;

    setFees(
      fees.map((fee) => {
        if (fee.currency === "JPY" && fee.amount) {
          const amount = parseFloat(fee.amount);
          if (!isNaN(amount)) {
            return {
              ...fee,
              amount: Math.round(amount * (newRateNum / oldRate)).toString(),
            };
          }
        }
        return fee;
      }),
    );
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void,
  ): void => {
    setter(e.target.value);
  };

  const results = calculatePrice();

  return (
    <div className="p-8">
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            日本代購價格計算器
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                商品日本售價 (日圓)
              </label>
              <input
                type="number"
                value={japanPrice}
                onChange={(e) => handleInputChange(e, setJapanPrice)}
                className="w-full rounded border p-2"
                placeholder="請輸入日本售價"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">
                匯率 (日圓兌台幣)
              </label>
              <input
                type="number"
                value={exchangeRate}
                onChange={(e) => handleExchangeRateChange(e.target.value)}
                className="w-full rounded border p-2"
                step="0.01"
                placeholder="請輸入匯率"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">
                加價百分比 (%)
              </label>
              <input
                type="number"
                value={markup}
                onChange={(e) => handleInputChange(e, setMarkup)}
                className="w-full rounded border p-2"
                placeholder="請輸入加價百分比"
              />
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
                      updateFee(
                        fee.id,
                        "currency",
                        e.target.value as "TWD" | "JPY",
                      )
                    }
                    className="w-24 rounded border p-2"
                  >
                    <option value="TWD">台幣</option>
                    <option value="JPY">日圓</option>
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
                    parseFloat(japanPrice || "0") * parseFloat(exchangeRate)
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
