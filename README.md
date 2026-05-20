<p align="center">
  <img src="mobile/assets/images/icon.png" width="120" alt="行程助手 Logo" />
</p>

<h1 align="center">行程助手 TripApp</h1>

<p align="center">
  国内 Tripsy 平替 · AI 智能规划 · 3D 地球 · 杂志级设计
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-iOS%20%7C%20Android%20%7C%20Web-blue" />
  <img src="https://img.shields.io/badge/framework-Expo%20React%20Native-black" />
  <img src="https://img.shields.io/badge/backend-Next.js%2016-white" />
  <img src="https://img.shields.io/badge/AI-DeepSeek-purple" />
  <img src="https://img.shields.io/badge/license-MIT-green" />
</p>

---

## 预览

| 探索 & AI 规划 | 发现瀑布流 | 个人主页 |
|:---:|:---:|:---:|
| 3D 地球 + AI 对话 | 双列 Bento 卡片 | 视差头部 + 行程看板 |

> 截图请 clone 后在浏览器运行 `npm run web` 查看完整效果。

## 特性

### 核心体验
-  **AI 智能规划** — DeepSeek 大模型生成真实经纬度行程，全球城市秒级响应
-  **3D 地球** — MapLibre GL 球形投影 + 天地图瓦片 + 飞机沿 Great Circle 弧线飞行
-  **时间线日程** — 按天组织航班/酒店/景点，彩色 Morandi 标签
-  **天气集成** — 和风天气 API，实时 + 7 天预报
-  **文档收纳** — 机票 PDF / 护照扫描，阿里云 OSS 存储
-  **出行清单 + 费用** — 待办勾选 + 多币种记账 + 汇率转换

### UI 设计
-  **Luxury/Editorial 美学** — Playfair Display 衬线标题 + 香槟金点缀
-  **毛玻璃 Morphism** — expo-blur 70% 透明度 + 极细描边
-  **Bento 便当盒网格** — 双列动态高度瀑布流
-  **视差头部** — 下拉放大 + 吸顶 Tab
-  **昼夜主题** — CartoDB Light / Dark 平滑切换

### 技术架构

| 层 | 技术 |
|---|------|
| 移动端 | React Native 0.83 · Expo SDK 55 · NativeWind · Reanimated 4 |
| Web 端 | Next.js 16 · TypeScript 严格模式 |
| 数据库 | SQLite (better-sqlite3) |
| 认证 | JWT access + refresh 双令牌 · 手机号短信登录 |
| AI | DeepSeek Chat API |
| 地图 | MapLibre GL · 天地图 · Turf.js · Leaflet |
| 支付 | 支付宝 APP 支付 · 微信支付 (预留) |

## 快速开始

### 环境要求
- Node.js 22+
- npm 11+

### 1. 安装依赖

```bash
cd tripapp
cd mobile && npm install && cd ..
cd web && npm install && cd ..
```

### 2. 配置环境变量

```bash
cp web/.env.example web/.env
```

编辑 `web/.env`，填写以下 Key：

```env
DEEPSEEK_API_KEY=sk-xxxxx        # DeepSeek AI (platform.deepseek.com)
QWEATHER_API_KEY=xxxxx           # 和风天气 (dev.qweather.com)
TIANDITU_TOKEN=xxxxx             # 天地图 (console.tiangong.gov.cn)
```

> 不填 AI Key 时使用内置模板引擎，仍可正常体验。

### 3. 启动开发服务器

```bash
# 终端 1：启动 API 后端
cd web && npm run dev          # → http://localhost:3001

# 终端 2：启动 App
cd mobile && npm run web       # → http://localhost:19001
```

### 4. 在手机上运行

```bash
cd mobile
npx expo start                 # 不加 --web
# 手机安装 Expo Go → 扫描终端二维码
```

> 生产构建：`npx expo prebuild` → Xcode / Android Studio

## 项目结构

```
tripapp/
├── mobile/                     # React Native Expo App
│   └── src/
│       ├── app/                # expo-router 页面路由
│       │   ├── (tabs)/         # 3 Tab: globe / discover / profile
│       │   ├── (auth)/         # 登录 / 注册
│       │   ├── trips/          # 行程 CRUD
│       │   └── post/           # 帖子详情
│       ├── components/         # 组件库
│       │   ├── ai/             # SmartChipBar / CostBreakdown / DayCardStrip
│       │   ├── globe/          # TripMapView / CitySearch / GeneratingState
│       │   ├── itinerary/      # Timeline / DaySelector / ItemForm
│       │   └── trips/          # TripCard / HeroTripCard / ShareSheet
│       ├── hooks/              # useTrips / useWeather / useSmsCode
│       ├── lib/                # api / auth / constants / ics
│       └── stores/             # Zustand authStore
│
└── web/                        # Next.js 16 API 后端
    └── src/
        ├── app/
        │   ├── api/            # 16 个 API 路由
        │   │   ├── auth/       # 短信登录 / 注册 / 刷新
        │   │   ├── trips/      # 行程 CRUD + 分享
        │   │   ├── ai-planner/ # DeepSeek AI 规划
        │   │   ├── weather/    # 和风天气
        │   │   └── admin/      # 后台管理
        │   └── admin/          # 管理后台页面
        └── lib/                # db / sms / oss / weather / constants
```

## License

MIT
