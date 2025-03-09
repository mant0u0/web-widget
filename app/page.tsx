import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">
          饅頭網頁小工具
        </h1>
        <p className="mb-8 text-center text-gray-500">
          發想一些不常用，但可能很有用的網頁小工具
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {/* <LinkItem
            text="代購價格計算器"
            info="計算代購價格，計算獲利"
            link="/Purchasing"
          /> */}
          <LinkItem
            text="飲料店搜尋器"
            info="搜尋台灣各家連鎖飲料店的網址與社群。"
            link="/DrinkSearch"
          />
          <LinkItem
            text="文字編輯器"
            info="整合各種小功能的純文字編輯器，提供各種符號、顏文字等。"
            link="/TextEditor"
          />
        </div>
      </div>
    </div>
  );
}

function LinkItem({ text = "文字", info = "文字", link = "#" }) {
  return (
    <Link
      href={link}
      className="block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow duration-300"
    >
      <div className="p-4">
        <p className="text-lg font-medium text-gray-800">{text}</p>
        <p className="mt-1 text-sm text-gray-500">{info}</p>
      </div>
    </Link>
  );
}
