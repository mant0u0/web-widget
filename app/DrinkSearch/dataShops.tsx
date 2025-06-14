// dataShops.tsx
// 飲料店資料模型定義
export interface DrinkShop {
  name: string;
  name_en: string;
  image: string;
  website: string;
  facebook: string;
  instagram: string;
  line: string;
  menu: string;
  color: string;
}

// 飲料店資料
const shopsData: DrinkShop[] = [
  {
    name: "50嵐",
    name_en: "50 lan",
    image: "50嵐.jpg",
    website: "http://www.50lan.com/",
    facebook: "https://www.facebook.com/20201204.50lin/?locale=zh_TW",
    instagram: "https://www.instagram.com/50lan_central/",
    line: "",
    menu: "http://50lan.com/web/products.asp",
    color: "#ffff00",
  },
  {
    name: "茶之魔手",
    name_en: "Tea & Magic Hand",
    image: "茶之魔手.jpg",
    website: "https://www.teamagichand.com.tw/",
    facebook: "https://www.facebook.com/Teamagichand00/?locale=zh_TW",
    instagram: "https://www.instagram.com/teamagichand00/",
    line: "",
    menu: "https://www.teamagichand.com.tw/price/",
    color: "#b72b50",
  },
  {
    name: "先喝道",
    name_en: "TAO TAO TEA",
    image: "先喝道 TAO TAO TEA.jpg",
    website: "https://www.taotaotea.com.tw/",
    facebook:
      "https://www.facebook.com/p/TAO-TAO-TEA-%E5%85%88%E5%96%9D%E9%81%93-100087595682143/",
    instagram: "https://www.instagram.com/tao.tao.tea/",
    line: "",
    menu: "https://www.taotaotea.com.tw/pages/menu",
    color: "#cf001a",
  },
  {
    name: "CoCo 都可",
    name_en: "CoCo Tea",
    image: "CoCo都可.jpg",
    website: "https://www.coco-tea.com/",
    facebook: "https://www.facebook.com/cocofreshtea.tw/?locale=zh_TW",
    instagram: "https://www.instagram.com/cocotea.tw/",
    line: "",
    menu: "",
    color: "#f99b38",
  },
  {
    name: "日春木瓜牛奶",
    name_en: "",
    image: "日春木瓜牛奶.jpg",
    website:
      "https://www.qsquare.com.tw/floor-detail.php?lv01_type=B3&lv02_id=A23060600012c56",
    facebook:
      "https://www.facebook.com/p/%E6%97%A5%E6%98%A5%E6%9C%A8%E7%93%9C%E7%89%9B%E5%A5%B6-%E5%8F%B0%E7%81%A3%E7%B8%BD%E9%83%A8-100064112016234/?locale=zh_TW",
    instagram: "https://www.instagram.com/taoyuan_international_airport/",
    line: "",
    menu: "",
    color: "#da151f",
  },
  {
    name: "烏弄",
    name_en: "UNOCHA",
    image: "烏弄.jpg",
    website: "https://unocha.com.tw/",
    facebook: "https://www.facebook.com/UNOCHA.tw/?locale=zh_TW",
    instagram: "https://www.instagram.com/unocha_tw",
    line: "",
    menu: "https://unocha.com.tw/drinks.php",
    color: "#115652",
  },

  {
    name: "TEA TOP 第一味",
    name_en: "TEA TOP",
    image: "TEA TOP 第一味.jpg",
    website: "https://www.teatop.com.tw/",
    facebook: "https://www.facebook.com/tea.topTW/?locale=zh_TW",
    instagram: "https://www.instagram.com/teatop_tw/",
    line: "",
    menu: "https://www.teatop.com.tw/menu/north-menu/",
    color: "#e9602a",
  },
  {
    name: "發發牧場",
    name_en: "The Far Far Farm",
    image: "發發牧場 The Far Far Farm.jpg",
    website: "https://www.thefarfarfarm.com/",
    facebook: "https://www.facebook.com/thefarfarfarm/?locale=zh_TW",
    instagram: "https://www.instagram.com/thefarfarfarm/",
    line: "",
    menu: "",
    color: "#e1efd5",
  },
  {
    name: "得正",
    name_en: "Dejeng",
    image: "得正 Dejeng.jpg",
    website: "https://dejeng.com/",
    facebook:
      "https://www.facebook.com/p/%E5%BE%97%E6%AD%A3-OOLONG-TEA-PROJECT-100064036692208/?locale=zh_TW",
    instagram: "https://www.instagram.com/dejengoolongtea/",
    line: "",
    menu: "https://dejeng.com/drinks/",
    color: "#335384",
  },
  {
    name: "有飲",
    name_en: "Youin",
    image: "有飲 Youin.jpg",
    website: "https://www.youindrink.com/",
    facebook: "https://www.facebook.com/youintaiwan/",
    instagram: "https://www.instagram.com/youintw2021/",
    line: "",
    menu: "",
    color: "#a7a7a7",
  },
  {
    name: "迷客夏",
    name_en: "Milksha",
    image: "迷客夏 Milksha.jpg",
    website: "https://www.milksha.com/",
    facebook: "https://www.facebook.com/Milkshatw/?locale=zh_TW",
    instagram: "https://www.instagram.com/milksha_tw/",
    line: "",
    menu: "https://www.milksha.com/products.php",
    color: "#62840b",
  },
  {
    name: "可不可熟成紅茶",
    name_en: "KEBUKE",
    image: "可不可熟成紅茶 KEBUKE.jpg",
    website: "https://www.kebuke.com/",
    facebook: "https://www.facebook.com/kebuke2008/?locale=zh_TW",
    instagram: "https://www.instagram.com/kebukeofficial/",
    line: "",
    menu: "https://kebuke.com/menu/",
    color: "#003c4f",
  },
  {
    name: "茶聚",
    name_en: "CHA'GE",
    image: "茶聚 CHA'GE.jpg",
    website: "https://www.chage.com.tw/",
    facebook:
      "https://m.facebook.com/hashtag/%E8%8C%B6%E8%81%9Achage?__eep__=6",
    instagram: "https://www.instagram.com/chage.tea/",
    line: "",
    menu: "https://www.chage.com.tw/edcontent.php?lang=tw&tb=2",
    color: "#e3e3e3",
  },
  {
    name: "清心福全",
    name_en: "Chingshin",
    image: "清心福全.jpg",
    website: "https://www.chingshin.tw/",
    facebook: "https://www.facebook.com/chingshin1987/?locale=zh_TW",
    instagram: "https://www.instagram.com/chingshin1987/",
    line: "",
    menu: "https://www.chingshin.tw/product.php",
    color: "#005744",
  },
  {
    name: "八曜和茶",
    name_en: "8YOTEA",
    image: "八曜和茶.jpg",
    website: "https://8yotea.com/",
    facebook: "https://www.facebook.com/@8yotea/?locale=zh_TW",
    instagram: "https://www.instagram.com/8yotea/",
    line: "",
    menu: "",
    color: "#f7c059",
  },
  {
    name: "一沐日",
    name_en: "A nice holiday",
    image: "一沐日.jpg",
    website: "https://www.aniceholiday.com.tw/",
    facebook: "https://www.facebook.com/anicehoilday/?locale=zh_TW",
    instagram: "https://www.instagram.com/aniceholiday_tea/",
    line: "",
    menu: "https://www.aniceholiday.com.tw/beverages-menu",
    color: "#5f6738",
  },
  {
    name: "再睡5分鐘",
    name_en: "NAP TEA",
    image: "再睡5分鐘 NAP TEA.jpg",
    website: "https://www.napteazzz.com/",
    facebook: "https://www.facebook.com/napteazzz/?locale=zh_TW",
    instagram: "https://www.instagram.com/napteazzz/",
    line: "",
    menu: "https://www.napteazzz.com/%E8%8F%9C%E5%96%AEmenu",
    color: "#70462d",
  },
  {
    name: "珍煮丹",
    name_en: "TRUEDAN",
    image: "珍煮丹 TRUEDAN.jpg",
    website: "https://www.truedan.com.tw/",
    facebook: "https://www.facebook.com/truedantw/?locale=zh_TW",
    instagram: "https://www.instagram.com/truedantw/",
    line: "",
    menu: "https://www.truedan.com.tw/product.php",
    color: "#043436",
  },
  {
    name: "現萃茶",
    name_en: "CITY TEA",
    image: "CITY TEA 現萃茶.jpg",
    website: "https://www.citycafe.com.tw/event/17xiancuicha/index.html",
    facebook: "",
    instagram: "",
    line: "",
    menu: "",
    color: "#00a881",
  },
  {
    name: "春水堂",
    name_en: "Chun Shui Tang",
    image: "春水堂 Chun Shui Tang.jpg",
    website: "https://www.chunshuitang.com.tw/",
    facebook: "https://www.facebook.com/ChunShui1983/?locale=zh_TW",
    instagram: "https://www.instagram.com/chunshuitang/",
    line: "",
    menu: "https://www.chunshuitang.com.tw/menu/",
    color: "#f4bdba",
  },
  {
    name: "麻古茶坊",
    name_en: "MACU TEA",
    image: "麻古茶坊 MACU TEA.jpg",
    website: "https://www.macutea.com.tw/",
    facebook: "https://www.facebook.com/macu2008.tw/?locale=zh_TW",
    instagram: "https://www.instagram.com/macu2008tw/",
    line: "",
    menu: "https://www.macutea.com.tw/drink.php",
    color: "#e6201f",
  },
  {
    name: "喫茶趣 ToGo",
    name_en: "CHAFORTEA",
    image: "喫茶趣ToGo.jpg",
    website: "https://www.chafortea.com.tw/",
    facebook: "https://www.facebook.com/chafortea8/?locale=zh_TW",
    instagram: "https://www.instagram.com/tenrentw/",
    line: "",
    menu: "",
    color: "#024c0d",
  },
  {
    name: "約翰紅茶公司",
    name_en: "JOHN TEA COMPANY",
    image: "約翰紅茶公司.jpg",
    website: "",
    facebook: "https://www.facebook.com/johnteacompany/?locale=zh_TW",
    instagram: "https://www.instagram.com/johnteacompany/",
    line: "",
    menu: "",
    color: "#183263",
  },
  {
    name: "鶴茶樓 鶴頂紅茶商店",
    name_en: "Hechalou Tea",
    image: "鶴茶樓 鶴頂紅茶商店 Hechalou Tea.jpg",
    website: "https://hechaloutea.com.tw/",
    facebook: "https://www.facebook.com/hechaloutea/?locale=zh_TW",
    instagram: "https://www.instagram.com/hechaloutea/",
    line: "",
    menu: "https://hechaloutea.com.tw/drinks/",
    color: "#2e4c32",
  },
  {
    name: "SOMA 特調飲品",
    name_en: "SOMA",
    image: "SOMA 特調飲品.jpg",
    website: "https://soma-drinks.com/",
    facebook: "https://www.facebook.com/somadrinks/?locale=zh_TW",
    instagram: "https://www.instagram.com/somadrink/",
    line: "",
    menu: "",
    color: "#353444",
  },
  {
    name: "大苑子",
    name_en: "DaYungs",
    image: "大苑子 DaYungs.jpg",
    website: "https://www.dayungs.com/",
    facebook: "https://www.facebook.com/dayungs.tw/?locale=zh_TW",
    instagram: "https://www.instagram.com/dayungs_official/",
    line: "",
    menu: "https://www.dayungs.com/home/product/seasonal/",
    color: "#185432",
  },
  {
    name: "萬波島嶼紅茶",
    name_en: "Wanpo Tea Shop",
    image: "萬波島嶼紅茶 Wanpo Tea Shop.jpg",
    website: "https://wanpotea.com/",
    facebook: "https://www.facebook.com/wanpotea.com.tw/?locale=zh_TW",
    instagram: "https://www.instagram.com/wanpotea.com.tw/",
    line: "",
    menu: "https://wanpotea.com/drink.php",
    color: "#291f1d",
  },
  {
    name: "五桐號",
    name_en: "WooTEA",
    image: "五桐號 WooTEA.jpg",
    website: "https://www.wootea.com/",
    facebook: "https://www.facebook.com/WooTeaTW/?locale=zh_TW",
    instagram: "https://www.instagram.com/wooteatw/",
    line: "",
    menu: "https://www.wootea.com/menu/",
    color: "#a93635",
  },
  {
    name: "鮮茶道",
    name_en: "Presotea",
    image: "鮮茶道 Presotea.jpg",
    website: "http://www.presotea.com.tw/?show_lang=tw",
    facebook: "https://www.facebook.com/presotea.tw/?locale=zh_TW",
    instagram: "https://www.instagram.com/presotea_global/",
    line: "",
    menu: "http://www.presotea.com.tw/menu.php",
    color: "#231717",
  },
  {
    name: "茶湯會",
    name_en: "TP TEA",
    image: "茶湯會 TP TEA.jpg",
    website: "https://tw.tp-tea.com/",
    facebook: "https://www.facebook.com/tptea2005/?locale=zh_TW",
    instagram: "https://www.instagram.com/tptea.taiwan/",
    line: "",
    menu: "https://tw.tp-tea.com/menu/",
    color: "#f9f3e6",
  },
  {
    name: "大茗本位製茶堂",
    name_en: "Daming Tea",
    image: "大茗本位製茶堂.jpg",
    website: "",
    facebook:
      "https://www.facebook.com/p/%E5%A4%A7%E8%8C%97%E6%9C%AC%E4%BD%8D%E8%A3%BD%E8%8C%B6%E5%A0%82-100067777907132/?locale=zh_TW",
    instagram: "https://www.instagram.com/daming_tea/",
    line: "",
    menu: "",
    color: "#dac7af",
  },
  {
    name: "龜記茗品",
    name_en: "Guiji",
    image: "龜記茗品 Guiji.jpg",
    website: "https://guiji-group.com/",
    facebook: "https://www.facebook.com/greattea.asia/?locale=zh_TW",
    instagram: "https://www.instagram.com/guiji_official/",
    line: "",
    menu: "https://guiji-group.com/%e4%b8%ad%e5%8d%80%e9%a3%b2%e5%93%81%e8%8f%9c%e5%96%ae/%e9%a3%b2%e5%93%81%e8%8f%9c%e5%96%ae/",
    color: "#b01f24",
  },
  {
    name: "日出茶太",
    name_en: "Chatime",
    image: "Chatime 日出茶太.jpg",
    website: "https://www.chatime.com.tw/zh/",
    facebook: "https://www.facebook.com/chatimeglobal/?locale=zh_TW",
    instagram: "https://www.instagram.com/chatime.tw_official/",
    line: "",
    menu: "https://www.chatime.com.tw/zh/menu/",
    color: "#4e0878",
  },
  {
    name: "玉津咖啡",
    name_en: "Y.J COFFEE",
    image: "玉津咖啡 Y.J COFFEE.jpg",
    website: "https://www.yujincafe.com/",
    facebook: "https://www.facebook.com/TaiwanYuJin/?locale=zh_TW",
    instagram: "https://www.instagram.com/y.j_coffee/",
    line: "",
    menu: "https://www.yujincafe.com/service/10.htm",
    color: "#858585",
  },
  {
    name: "抿茶",
    name_en: "Mincha",
    image: "抿茶 min cha.jpg",
    website: "https://www.mincha.com.tw/",
    facebook: "https://www.facebook.com/mincha.tw/?locale=zh_TW",
    instagram: "https://www.instagram.com/mincha_official/",
    line: "",
    menu: "https://www.mincha.com.tw/3915421697menu.html",
    color: "#c89f76",
  },
  {
    name: "麥吉",
    name_en: "Machi Machi",
    image: "麥吉 machi machi.jpg",
    website: "https://www.machitea.com/",
    facebook:
      "https://www.facebook.com/profile.php?id=100064009001259&locale=sr_RS",
    instagram: "https://www.instagram.com/machimachi__official/",
    line: "",
    menu: "",
    color: "#fef0e6",
  },
  {
    name: "玖仰茶食文化",
    name_en: "Jiuyang",
    image: "玖仰茶食文化 Jiuyang.jpg",
    website: "",
    facebook:
      "https://www.facebook.com/p/%E7%8E%96%E4%BB%B0%E8%8C%B6%E9%A3%9F%E6%96%87%E5%8C%96-100063858673694/",
    instagram: "https://www.instagram.com/jiuyangtea/",
    line: "",
    menu: "",
    color: "#1e1f23",
  },
  {
    name: "清原芋圓",
    name_en: "Taro Boba",
    image: "清原芋圓 Taro Boba.jpg",
    website: "https://www.taroyuan.com/",
    facebook: "https://www.facebook.com/taroyuan.official/",
    instagram: "https://www.instagram.com/taro_yuan.official/",
    line: "",
    menu: "https://www.taroyuan.com/advantage/#menu",
    color: "#a778a6",
  },
  {
    name: "一手私藏世界紅茶",
    name_en: "ITSO",
    image: "ITSO 一手私藏世界紅茶.jpg",
    website: "https://www.itsotea.com/",
    facebook: "https://www.facebook.com/ITSOtea/?locale=zh_TW",
    instagram: "https://www.instagram.com/itso_tw/",
    line: "",
    menu: "https://www.itsotea.com/product_menu.php",
    color: "#988e7d",
  },
  {
    name: "樂法 Le Phare",
    name_en: "Le Phare",
    image: "樂法 Le Phare.jpg",
    website: "",
    facebook: "https://www.facebook.com/lepharedrink/?locale=zh_TW",
    instagram: "https://www.instagram.com/lepharelife/",
    line: "https://page.line.me/sxj4140t",
    menu: "",
    color: "#762835",
  },
  {
    name: "十杯",
    name_en: "Spade Tea",
    image: "十杯 Spade Tea.jpg",
    website: "https://order-rc.quickclick.cc/tw/food/P_JNJDAmMoW/",
    facebook: "https://www.facebook.com/spadetea/?locale=zh_TW",
    instagram:
      "https://www.instagram.com/explore/locations/301959048/shi-bei-spade-tea/",
    line: "",
    menu: "",
    color: "#e67c7c",
  },
  {
    name: "圓石禪飲",
    name_en: "oregin",
    image: "圓石.jpg",
    website: "https://www.enseki.org",
    facebook: "https://www.facebook.com/OREGIN.TW",
    instagram: "https://www.instagram.com/oregin.tw/",
    line: "",
    menu: "https://www.enseki.org/menu",
    color: "#036db7",
  },
  {
    name: "喫茶小舖",
    name_en: "Teashop168",
    image: "喫茶小舖.jpg",
    website: "https://www.teashop168.com.tw/",
    facebook: "https://www.facebook.com/teashop168/?locale=zh_TW",
    instagram: "https://www.instagram.com/ni_hao1998/",
    line: "",
    menu: "",
    color: "#373634",
  },
  {
    name: "BLIKE 奶茶專門",
    name_en: "BLIKE",
    image: "BLIKE 奶茶專門.jpg",
    website: "https://store.blike.tw/?lang=zh-TW",
    facebook:
      "https://www.facebook.com/p/BLIKE-%E5%A5%B6%E8%8C%B6%E5%B0%88%E9%96%80-61553640478011/?locale=zh_TW",
    instagram: "https://www.instagram.com/blike.tw/",
    line: "",
    menu: "",
    color: "#d2251f",
  },
  {
    name: "貢茶",
    name_en: "Gong cha",
    image: "貢茶 Gong cha.jpg",
    website: "https://www.gong-cha.com.tw/",
    facebook: "https://www.facebook.com/GongChaTaiwan/?locale=zh_TW",
    instagram: "https://www.instagram.com/gongcha_taiwan/",
    line: "",
    menu: "",
    color: "#c30e2f",
  },
  {
    name: "快可立",
    name_en: "Quickly",
    image: "快可立.jpg",
    website: "http://www.quicklygroup.com/",
    facebook: "https://www.facebook.com/JobquicklyTaiwan/?locale=zh_TW",
    instagram: "https://www.instagram.com/explore/locations/3600456/quickly/",
    line: "",
    menu: "",
    color: "#f16c2a",
  },
  {
    name: "三分春色",
    name_en: "chihetea",
    image: "三分春色.jpg",
    website: "https://www.chihetea.com.tw/",
    facebook: "https://www.facebook.com/three077905557/?locale=zh_TW",
    instagram: "https://www.instagram.com/thre_spring/",
    line: "",
    menu: "",
    color: "#e49e48",
  },
  {
    name: "七盞茶",
    name_en: "Seventea",
    image: "七盞茶 Seventea.jpg",
    website: "https://www.taiwan7tea.com.tw/?lang=tw",
    facebook: "https://www.facebook.com/taiwan.se7entea/?locale=zh_TW",
    instagram: "https://www.instagram.com/tw_seventea/",
    line: "",
    menu: "",
    color: "#191e72",
  },
  {
    name: "紅茶巴士",
    name_en: "Black Tea Bus",
    image: "紅茶巴士 Black Tea Bus.jpg",
    website: "https://blackteabus.com.tw/",
    facebook: "https://www.facebook.com/blackteabuscompany/?locale=zh_TW",
    instagram:
      "https://www.instagram.com/explore/locations/107983472142184/black-tea-bus-/",
    line: "",
    menu: "",
    color: "#ca292f",
  },
  {
    name: "思茶",
    name_en: "Missing Tea",
    image: "思茶 Missing Tea.jpg",
    website: "",
    facebook: "https://www.facebook.com/@Missingtea10803/?locale=zh_TW",
    instagram: "https://www.instagram.com/missingtea_2015/",
    line: "",
    menu: "",
    color: "#3e5581",
  },
  {
    name: "Mr. Wish 鮮果茶玩家",
    name_en: "Mr. Wish",
    image: "Mr. Wish 鮮果茶玩家.jpg",
    website: "https://www.mr-wish.com/",
    facebook: "https://www.facebook.com/Mr.WishTaiwan/?locale=zh_TW",
    instagram: "https://www.instagram.com/mr.wish_tw/",
    line: "",
    menu: "",
    color: "#5d8435",
  },
  {
    name: "吃茶三千",
    name_en: "CHICHA San Chen",
    image: "吃茶三千 CHICHA San Chen.jpg",
    website: "",
    facebook: "https://www.facebook.com/chichasanchen.TW/",
    instagram: "https://www.instagram.com/chichasanchen.tw/",
    line: "",
    menu: "",
    color: "#9dc08a",
  },
  {
    name: "手作功夫茶",
    name_en: "Kung Fu Tea",
    image: "手作功夫茶 Kung Fu Tea.jpg",
    website: "https://www.kungfutea.com.tw/",
    facebook: "https://www.facebook.com/Kungfutea/?locale=zh_TW",
    instagram: "https://www.instagram.com/kungfutea_tw/",
    line: "",
    menu: "",
    color: "#1f1f1f",
  },
  {
    name: "Mateas 鮮奶．茶沙龍",
    name_en: "Mateas",
    image: "Mateas 鮮奶．茶沙龍.jpg",
    website: "https://www.mateas.com.tw/",
    facebook: "https://www.facebook.com/mateas.tw/?locale=zh_TW",
    instagram: "https://www.instagram.com/mateas.tw/",
    line: "",
    menu: "",
    color: "#dfe0e4",
  },
  {
    name: "樺達奶茶",
    name_en: "HWADA Milk Tea",
    image: "樺達奶茶.jpg",
    website: "https://www.att4fun.com.tw/cuisine-in/46BzT5aUqemXFWs7",
    facebook: "https://www.facebook.com/HWADAmilktea/?locale=zh_TW",
    instagram: "https://www.instagram.com/hwadamilktea/",
    line: "",
    menu: "",
    color: "#d6d6d6",
  },
  {
    name: "上宇林連鎖茶飲",
    name_en: "Shang Yu Lin",
    image: "上宇林連鎖茶飲.jpg",
    website: "https://www.shangyulin.com.tw/",
    facebook: "https://www.facebook.com/syltea/?locale=zh_TW",
    instagram: "https://www.instagram.com/shang_yulin/",
    line: "",
    menu: "",
    color: "#ae7c4b",
  },
  {
    name: "丘森茶室",
    name_en: "Chosen Tea",
    image: "丘森茶室 Chosen Tea.jpg",
    website: "https://chosen-tea.com/",
    facebook: "https://www.facebook.com/chosentea.official/?locale=zh_TW",
    instagram: "https://www.instagram.com/chosen.tea/",
    line: "",
    menu: "",
    color: "#063c22",
  },
  {
    name: "紅太陽國際茶飲",
    name_en: "Red Sun International Tea",
    image: "紅太陽國際茶飲.jpg",
    website: "http://www.redsuntea.com/",
    facebook: "https://www.facebook.com/redsuntea/?locale=zh_TW",
    instagram: "https://www.instagram.com/redsuntea/",
    line: "",
    menu: "",
    color: "#c40000",
  },
  {
    name: "阿娘喂！廖老大茶坊連鎖",
    name_en: "",
    image: "阿娘喂！廖老大茶坊連鎖.jpg",
    website: "https://www.xn--10rp0i5t9d.com/",
    facebook:
      "https://www.facebook.com/p/%E9%98%BF%E5%A8%98%E5%96%82%E5%BB%96%E8%80%81%E5%A4%A7%E9%80%A3%E9%8E%96%E8%8C%B6%E5%9D%8A%E5%A4%A7%E6%BA%AA%E4%B8%AD%E6%AD%A3%E5%BA%97-100084282547621/",
    instagram: "https://www.instagram.com/liaoboss_tea/",
    line: "",
    menu: "",
    color: "#fedb1f",
  },
  {
    name: "無飲",
    name_en: "Wu Win",
    image: "無飲.jpg",
    website: "https://www.wu-win.com/h/Index?key=716207668656",
    facebook: "https://www.facebook.com/wuwintw/?locale=zh_TW",
    instagram: "https://www.instagram.com/wuwin_tw/",
    line: "",
    menu: "",
    color: "#b91d28",
  },
  {
    name: "茶海",
    name_en: "CHA Hi",
    image: "茶海 CHA Hi.jpg",
    website: "https://huablog.tw/chahi/",
    facebook: "https://www.facebook.com/CHAHi.tw/?locale=zh_TW",
    instagram: "https://www.instagram.com/chahi_tw/",
    line: "",
    menu: "",
    color: "#cbcbc7",
  },
  {
    name: "御私藏",
    name_en: "Cozy Tea Loft",
    image: "御私藏 Cozy Tea Loft.jpg",
    website: "https://www.possession-tea.com/",
    facebook: "https://www.facebook.com/ZCozyTeaLoft/?locale=zh_TW",
    instagram: "https://www.instagram.com/cozy_tea_loft/",
    line: "",
    menu: "",
    color: "#be9051",
  },
  {
    name: "馬祖奶茶",
    name_en: "MATSU MILK TEA",
    image: "馬祖奶茶 MATSU MILK TEA.jpg",
    website: "https://www.matsumilktea.com/",
    facebook:
      "https://www.facebook.com/p/Milk-Tea-Matsu-100087760390803/?locale=zh_TW",
    instagram: "https://www.instagram.com/matsuhun2232/",
    line: "",
    menu: "",
    color: "#efe5db",
  },
  {
    name: "一芳水果茶",
    name_en: "Yifangtea",
    image: "一芳水果茶 Yifangtea.jpg",
    website: "https://www.yifangtea.com/chinese/home",
    facebook: "https://www.facebook.com/yifangtea/?locale=zh_TW",
    instagram: "https://www.instagram.com/yifangtea.official/",
    line: "",
    menu: "",
    color: "#e2e2e2",
  },
  {
    name: "北回木瓜牛奶",
    name_en: "Papaya Milk",
    image: "北回木瓜牛奶.jpg",
    website: "https://www.papayamilk.com.tw/",
    facebook: "https://www.facebook.com/@bei.huei1994/?locale=zh_TW",
    instagram:
      "https://www.instagram.com/explore/locations/252089986/bei-hui-mu-gua-niu-nai/",
    line: "",
    menu: "",
    color: "#ef791f",
  },
  {
    name: "拾汣茶屋",
    name_en: "19TeaHouse",
    image: "拾汣茶屋 19TeaHouse.jpg",
    website: "https://www.19teahouse.com/",
    facebook: "https://www.facebook.com/19teahouse/?locale=zh_TW",
    instagram: "https://www.instagram.com/19teahouse/",
    line: "",
    menu: "",
    color: "#789a79",
  },
  {
    name: "花好月圓茶飲專賣",
    name_en: "Perfect Life Tea Shop",
    image: "花好月圓茶飲專賣.jpg",
    website: "",
    facebook: "https://www.facebook.com/perfectlife.teashop/?locale=zh_TW",
    instagram: "https://www.instagram.com/perfectlife.teashop/",
    line: "",
    menu: "",
    color: "#935b28",
  },
  {
    name: "十二韻",
    name_en: "Tea Melody",
    image: "Tea Melody 十二韻.jpg",
    website: "https://www.tea-melody.com.tw/index.php",
    facebook: "https://www.facebook.com/12TeaMelody/?locale=zh_TW",
    instagram: "https://www.instagram.com/tea.melody/",
    line: "",
    menu: "",
    color: "#373634",
  },
  {
    name: "鮮自然",
    name_en: "",
    image: "鮮自然.jpg",
    website: "https://page.line.me/ycf9608q",
    facebook: "https://www.facebook.com/naturalfirst2005/?locale=zh_TW",
    instagram: "https://www.instagram.com/sianzihran/",
    line: "",
    menu: "",
    color: "#92c221",
  },
  {
    name: "炎術",
    name_en: "",
    image: "炎術.jpg",
    website: "https://0422354445.tw66.com.tw/",
    facebook: "https://www.facebook.com/yanshudrink267/?locale=zh_TW",
    instagram:
      "https://www.instagram.com/explore/locations/268761155/yan-shu-chuang-shi-dian/",
    line: "",
    menu: "",
    color: "#506a3a",
  },
  {
    name: "馬祖新村",
    name_en: "Mazuvillage",
    image: "馬祖新村.jpg",
    website: "https://www.mazuvillage.com/",
    facebook: "https://www.facebook.com/ArtMatsuVillage/?locale=zh_TW",
    instagram:
      "https://www.instagram.com/explore/locations/215678608/ma-zu-xin-cun-juan-cun-wen-chuang-yuan-qu/",
    line: "",
    menu: "",
    color: "#01135f",
  },
  {
    name: "自在軒",
    name_en: "ZI ZAI XUAN",
    image: "自在軒 ZI ZAI XUAN.jpg",
    website: "",
    facebook: "https://www.facebook.com/easehome168/?locale=zh_TW",
    instagram: "https://www.instagram.com/zizaixuan_1986/",
    line: "",
    menu: "",
    color: "#1f372a",
  },
  {
    name: "壽奶茶專賣",
    name_en: "",
    image: "壽奶茶專賣.jpg",
    website: "https://sosweet1978.weebly.com/",
    facebook: "https://www.facebook.com/sosweet1978/?locale=zh_TW",
    instagram: "https://www.instagram.com/somilk1978/",
    line: "",
    menu: "",
    color: "#c40c24",
  },
  {
    name: "老賴茶棧",
    name_en: "Like Tea Shop",
    image: "老賴茶棧.jpg",
    website: "https://www.liketeashop.com/",
    facebook: "https://www.facebook.com/LikeTea.JuiceStation/?locale=zh_TW",
    instagram: "https://www.instagram.com/liketeashop/",
    line: "",
    menu: "https://www.liketeashop.com/drink",
    color: "#d4bfbc",
  },
  {
    name: "李記紅茶冰",
    name_en: "Li-Ji Tea Shop",
    image: "李記紅茶冰 Li-Ji Tea Shop.jpg",
    website: "https://www.leejitea.com/",
    facebook: "https://www.facebook.com/leeji.2008/?locale=zh_TW",
    instagram:
      "https://www.instagram.com/explore/locations/1032807931/li-ji-gu-wei-hong-cha-bing--da-du-wen-chang-dian/",
    line: "",
    menu: "https://www.leejitea.com/39154216972017132057.html",
    color: "#8e1b20",
  },
  {
    name: "幸福堂",
    name_en: "Xing Fu Tang",
    image: "幸福堂 Xing Fu Tang.jpg",
    website: "https://www.xingfutang.com.tw/index.php?lang=tw",
    facebook: "https://www.facebook.com/xingfutang.tw/?locale=zh_TW",
    instagram: "https://www.instagram.com/xingfutang.tw/",
    line: "",
    menu: "",
    color: "#ecdd9a",
  },
  {
    name: "紅茶媽媽",
    name_en: "MA MA TEA",
    image: "紅茶媽媽 MA MA TEA.jpg",
    website: "https://www.mamatea.com.tw/",
    facebook: "https://m.facebook.com/people/Mommom-Tea/61564586285476/",
    instagram: "https://www.instagram.com/mamatea_1211/",
    line: "",
    menu: "",
    color: "#231918",
  },
  {
    name: "波哥",
    name_en: "",
    image: "波哥.jpg",
    website: "",
    facebook: "",
    instagram:
      "https://www.instagram.com/explore/locations/2413704/?locale=es_US&hl=am-et",
    line: "",
    menu: "",
    color: "#323232",
  },
  {
    name: "TrueWin 初韻",
    name_en: "TrueWin",
    image: "TrueWin 初韻.jpg",
    website: "https://truewin2018.com.tw/",
    facebook: "https://www.facebook.com/TrueWinLucteaDay/?locale=zh_TW",
    instagram: "https://www.instagram.com/truewin_lucteaday/",
    line: "",
    menu: "",
    color: "#303030",
  },
  {
    name: "瓦克茶飲",
    name_en: "Walker Tea Shop",
    image: "瓦克茶飲 Walker Tea Shop.jpg",
    website: "",
    facebook: "https://www.facebook.com/walker.teashop/?locale=zh_TW",
    instagram: "https://www.instagram.com/walker.teashop/",
    line: "",
    menu: "",
    color: "#10375e",
  },
  {
    name: "鬍子茶",
    name_en: "Who's Tea",
    image: "鬍子茶 Who's Tea.jpg",
    website: "https://www.whosteatw.com/",
    facebook: "https://www.facebook.com/WhosTea/?locale=zh_TW",
    instagram: "https://www.instagram.com/whostea_tw/",
    line: "",
    menu: "",
    color: "#21364b",
  },
  {
    name: "春芳號",
    name_en: "Chun Fun How",
    image: "春芳號.jpg",
    website: "https://www.chunfunhow.com/",
    facebook: "https://www.facebook.com/chunfunhow8/?locale=zh_TW",
    instagram: "https://www.instagram.com/chunfunhow/",
    line: "",
    menu: "https://www.chunfunhow.com/drinks.php",
    color: "#396e5e",
  },
  {
    name: "UG 樂己",
    name_en: "UG",
    image: "UG 樂己.jpg",
    website: "",
    facebook: "https://www.facebook.com/uniquegreentea/?locale=zh_TW",
    instagram: "https://www.instagram.com/ugtea_official/",
    line: "https://page.line.me/370ivune",
    menu: "",
    color: "#028002",
  },
  {
    name: "寶島紅茶冰",
    name_en: "Formosa & Tea",
    image: "寶島紅茶冰 Formosa & Tea.jpg",
    website:
      "https://www.tahaohao.com/categories/formosablacktea?srsltid=AfmBOoocLUCB5h1s5r42fCe6ab_mmi7zlLeHC3bMK8wUZUQ9idk8dNgk",
    facebook:
      "https://www.facebook.com/p/%E5%AF%B6%E5%B3%B6%E7%B4%85%E8%8C%B6%E5%86%B0-%E9%A0%AD%E4%BB%BD%E5%BA%97-100057561424983/",
    instagram: "https://www.instagram.com/formosatea.ty/",
    line: "",
    menu: "",
    color: "#939498",
  },
  {
    name: "布萊恩紅茶",
    name_en: "Brian Black Tea",
    image: "布萊恩紅茶.jpg",
    website: "https://www.brianblacktea.com.tw/",
    facebook: "https://www.facebook.com/MrBU2005/?locale=zh_TW",
    instagram: "https://www.instagram.com/mrbu2020/",
    line: "",
    menu: "",
    color: "#747474",
  },
  {
    name: "T4 清茶達人",
    name_en: "T4",
    image: "T4清茶達人.jpg",
    website: "https://www.t4.com.tw/",
    facebook: "https://www.facebook.com/T4taiwanHeadquarter/?locale=zh_TW",
    instagram: "https://www.instagram.com/t4taiwan/",
    line: "",
    menu: "https://www.t4.com.tw/Product",
    color: "#1db5a8",
  },
  {
    name: "DrinkStore 水雲朵",
    name_en: "DrinkStore",
    image: "DrinkStore 水雲朵.jpg",
    website: "https://www.drinkstore.com.tw/",
    facebook: "https://www.facebook.com/drinkcloudstore/?locale=zh_TW",
    instagram: "https://www.instagram.com/twdrinkstore/",
    line: "https://page.line.me/phq5219w",
    menu: "https://www.drinkstore.com.tw/web/product/product.jsp",
    color: "#05824a",
  },
  {
    name: "甲文青茶飲",
    name_en: "JIA WEN CING",
    image: "甲文青茶飲 JIA WEN CING.jpg",
    website: "https://www.jwc-tea.com.tw/",
    facebook: "https://www.facebook.com/jiawencing.headquarters/",
    instagram: "https://www.instagram.com/jiawencing/",
    line: "",
    menu: "",
    color: "#f1c74f",
  },
  {
    name: "双十八木",
    name_en: "Double 18 Tea",
    image: "双十八木 Double 18 Tea.jpg",
    website: "https://www.double18tea.tw/",
    facebook: "https://www.facebook.com/DoubleShibatea/?locale=zh_TW",
    instagram: "https://www.instagram.com/double18tea_tw/",
    line: "",
    menu: "https://www.double18tea.tw/menu.html",
    color: "#6b6b6b",
  },
  {
    name: "白巷子",
    name_en: "WHITE ALLEY",
    image: "白巷子 WHITE ALLEY.jpg",
    website: "http://www.whitealley.com.tw/",
    facebook: "https://www.facebook.com/whitealley/?locale=zh_TW",
    instagram:
      "https://www.instagram.com/explore/locations/108854893950509/white-alley/?locale=zh_tw&hl=ar",
    line: "",
    menu: "",
    color: "#737373",
  },
  {
    name: "叮哥茶飲",
    name_en: "DING GO TEA",
    image: "叮哥茶飲.jpg",
    website: "https://www.dinggotea.com/",
    facebook: "https://www.facebook.com/dinggo.tea168/?locale=zh_TW",
    instagram: "https://www.instagram.com/dinggo_2002/",
    line: "",
    menu: "",
    color: "#e8365a",
  },
  {
    name: "泰讚了",
    name_en: "thai like tea",
    image: "泰讚了 thai like tea.jpg",
    website: "",
    facebook: "https://www.facebook.com/thailiketea01/?locale=zh_TW",
    instagram: "https://www.instagram.com/thailiketea/",
    line: "",
    menu: "",
    color: "#201e1f",
  },
  {
    name: "微堂",
    name_en: "WELL DONE",
    image: "微堂 WELL DONE.jpg",
    website: "https://welldone0805.com/",
    facebook: "https://www.facebook.com/@Welldone888/",
    instagram: "https://www.instagram.com/welldone2557/",
    line: "",
    menu: "",
    color: "#a2d6c9",
  },
  {
    name: "甘蔗の媽媽",
    name_en: "Sugarcane mamama",
    image: "甘蔗の媽媽.jpg",
    website: "",
    facebook: "https://www.facebook.com/Sugarcane.mamama/?locale=zh_TW",
    instagram: "https://www.instagram.com/explore/locations/139441186715012/-/",
    line: "",
    menu: "",
    color: "#a4b3ae",
  },
  {
    name: "特．好喝 TOP TIER TEA",
    name_en: "TOP TIER TEA",
    image: "特．好喝 TOP TIER TEA.jpg",
    website: "https://toptiertea.com.tw/",
    facebook:
      "https://www.facebook.com/p/%E7%89%B9-%E5%A5%BD%E5%96%9D-toptiertea-61561864010963/?locale=zh_TW",
    instagram: "https://www.instagram.com/toptiertea.tw/",
    line: "",
    menu: "",
    color: "#231717",
  },
  {
    name: "彤露おかわり",
    name_en: "TUNG LU OKAWARI",
    image: "彤露おかわり.jpg",
    website: "",
    facebook: "https://www.facebook.com/tungluokawari/?locale=ja_JP",
    instagram: "https://www.instagram.com/tunglu_okawari/",
    line: "",
    menu: "",
    color: "#cac9cf",
  },
  {
    name: "沐荼寺",
    name_en: "MUTUCHA",
    image: "沐荼寺.jpg",
    website: "https://www.mutucha.com/",
    facebook: "https://www.facebook.com/Mutucha/?locale=zh_TW",
    instagram: "https://www.instagram.com/mutucha__taiwan/",
    line: "",
    menu: "",
    color: "#561626",
  },
  {
    name: "小佐お茶作",
    name_en: "ZUO TEA",
    image: "小佐お茶作.jpg",
    website: "https://www.zuotea.com.tw/",
    facebook: "https://www.facebook.com/zuotea99/?locale=ja_JP",
    instagram: "https://www.instagram.com/zuotea99/",
    line: "",
    menu: "",
    color: "#063a6a",
  },
  {
    name: "黛黛茶",
    name_en: "DailyDae",
    image: "黛黛茶 DailyDae.jpg",
    website: "https://www.dailydae.com.tw/",
    facebook: "https://www.facebook.com/dailydae.tea/?locale=zh_TW",
    instagram: "https://www.instagram.com/dailydae.tea/",
    line: "",
    menu: "",
    color: "#dbdbdb",
  },
  {
    name: "沐白小農",
    name_en: "i-milky",
    image: "沐白小農.jpg",
    website: "https://i-milky.weebly.com/",
    facebook: "https://www.facebook.com/imilky.tw/",
    instagram: "https://www.instagram.com/imilky.tw/",
    line: "",
    menu: "",
    color: "#83abcb",
  },
  {
    name: "醋頭家",
    name_en: "True Boss",
    image: "醋頭家 True Boss.jpg",
    website: "http://www.trueboss.com.tw/",
    facebook: "https://www.facebook.com/trueboss.tw/?locale=zh_TW",
    instagram:
      "https://www.instagram.com/explore/locations/101006592259971/true-boss/",
    line: "",
    menu: "",
    color: "#0f367b",
  },
  {
    name: "紅茶老爹",
    name_en: "",
    image: "紅茶老爹.jpg",
    website: "https://yesally.com.tw/list_in.php?ID=1783",
    facebook: "https://www.facebook.com/profile.php?id=100089573525723",
    instagram: "https://www.instagram.com/mr.blacktea/",
    line: "",
    menu: "",
    color: "#185641",
  },
  {
    name: "清玉",
    name_en: "",
    image: "清玉.jpg",
    website: "",
    facebook: "",
    instagram: "",
    line: "",
    menu: "",
    color: "#92c221",
  },
  {
    name: "鶖茶",
    name_en: "CHILL DAY",
    image: "CHILL DAY 鶖茶.jpg",
    website: "https://shop.ichefpos.com/store/uBx4hazz/ordering",
    facebook: "https://www.facebook.com/CHILLDAY.2021/",
    instagram: "https://www.instagram.com/chillday_2021/",
    line: "",
    menu: "",
    color: "#152429",
  },
  {
    name: "水巷茶弄",
    name_en: "CHA NUNG",
    image: "水巷茶弄 CHA NUNG.jpg",
    website: "https://www.chanung.com.tw/",
    facebook: "https://www.facebook.com/chanungtw/?locale=zh_TW",
    instagram: "https://www.instagram.com/chanungtw/",
    line: "",
    menu: "https://www.chanung.com.tw/products",
    color: "#cbcbcb",
  },
  {
    name: "1955 阿義",
    name_en: "",
    image: "1955阿義.jpg",
    website: "",
    facebook: "https://www.facebook.com/1995AYI/?locale=zh_TW",
    instagram: "https://www.instagram.com/southayi1955/",
    line: "",
    menu: "",
    color: "#cccbc6",
  },
  {
    name: "茶朵木teas",
    name_en: "",
    image: "茶朵木teas.jpg",
    website:
      "https://www.ubereats.com/tw/store/%E8%8C%B6%E6%9C%B5%E6%9C%A8teas-%E6%96%B0%E8%8E%8A%E7%A6%8F%E5%A3%BD%E5%BA%97/wUWlM_AGQDyr-WkAiBSvhA?srsltid=AfmBOoqSKFqmAWFQkLtig3e4Wj_W7ifHrk5MrmSun6MhlQ524B43xk6R",
    facebook:
      "https://www.facebook.com/p/%E8%8C%B6%E6%9C%B5%E6%9C%A8teas%E9%A3%B2%E6%96%99-%E8%8A%B1%E8%93%AE%E6%B0%91%E5%9C%8B%E5%BA%97-100064500168016/?locale=zh_TW",
    instagram:
      "https://www.instagram.com/explore/locations/601665021/cha-duo-mu-teas/",
    line: "",
    menu: "",
    color: "#73c6ca",
  },
  {
    name: "日出客棧",
    name_en: "",
    image: "日出客棧.jpg",
    website: "https://sunriseinn-official.com/",
    facebook: "https://www.facebook.com/Official.InnSunrise/?locale=zh_TW",
    instagram: "https://www.instagram.com/sunrise_inpeh/",
    line: "",
    menu: "",
    color: "#b82f44",
  },
  {
    name: "進發家",
    name_en: "Jin Fa Jia",
    image: "進發家 Jin Fa Jia.jpg",
    website: "https://www.8teahouse.com/?lang=tw",
    facebook: "https://www.facebook.com/JinFaJiaTaiwaneseTea/",
    instagram: "https://www.instagram.com/explore/locations/2120912708198035/",
    line: "",
    menu: "",
    color: "#221713",
  },
  {
    name: "小貴冰",
    name_en: "GUEI BING",
    image: "小貴冰 GUEI BING.jpg",
    website: "",
    facebook:
      "https://www.facebook.com/p/%E5%B0%8F%E8%B2%B4%E5%86%B0GueiBing-100092540901046/",
    instagram: "https://www.instagram.com/guei_bing/",
    line: "",
    menu: "",
    color: "#c47d49",
  },
];

export default shopsData;
