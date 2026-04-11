# 大型战争策略类网页游戏 Monorepo

基于 Next.js + NestJS + Prisma 的原创战争策略页游工程骨架，当前已实现：

- 用户注册 / 登录 / JWT 鉴权
- 玩家资料创建
- 主城系统（City）
- 资源系统（ResourceStock）
- 建筑系统（升级、队列、结算、效果应用）

## 目录结构

```txt
.
├── apps
│   ├── web
│   └── server
├── packages
│   └── shared
├── docker
├── docker-compose.yml
└── .env.example
```

## 快速开始

```bash
cp .env.example .env
npm install
```

### 启动基础设施

```bash
docker compose up -d postgres redis
```

### Prisma 初始化

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 启动前后端

```bash
npm run dev
```

- Web: http://localhost:3000
- API: http://localhost:3001/api

## 关键接口

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/player/me` (Bearer Token)
- `GET /api/city/me` (Bearer Token)
- `GET /api/city/resources` (Bearer Token)
- `GET /api/buildings` (Bearer Token)
- `GET /api/buildings/queue` (Bearer Token)
- `POST /api/buildings/:type/upgrade` (Bearer Token)
- `POST /api/buildings/settle` (Bearer Token)

## 前端路由

- `/register` 注册
- `/login` 登录
- `/home` 登录后主城首页（资源栏 + 主城面板 + 建筑面板）
