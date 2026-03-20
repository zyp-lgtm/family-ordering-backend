# 家庭点餐小程序 - 后端 API

基于 Node.js + Express + MongoDB 的后端服务，支持个人小程序。

## 技术栈

- **Node.js** - JavaScript 运行环境
- **Express** - Web 框架
- **MongoDB** - NoSQL 数据库
- **JWT** - 用户认证
- **Railway** - 免费部署平台

## 项目结构

```
family-ordering-backend/
├── server.js              # 服务器入口
├── package.json           # 依赖配置
├── .env.example           # 环境变量示例
├── src/
│   ├── models/           # 数据模型
│   │   ├── User.js
│   │   ├── Family.js
│   │   ├── Dish.js
│   │   └── Order.js
│   ├── routes/           # API 路由
│   │   ├── auth.js       # 认证相关
│   │   ├── family.js     # 家庭管理
│   │   ├── dish.js       # 菜品管理
│   │   └── order.js      # 订单管理
│   └── middleware/       # 中间件
│       └── auth.js       # 认证中间件
└── railway.toml          # Railway 配置
```

## 本地开发

### 1. 安装依赖

```bash
cd /Users/apple/aicode/family-ordering-backend
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/family-ordering
WECHAT_APPID=wx5dfcd63c33aa2556
WECHAT_SECRET=your_app_secret_here
JWT_SECRET=your_jwt_secret_here
```

### 3. 启动 MongoDB

**使用 Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**或本地安装:**
- macOS: `brew install mongodb-community`
- Windows: 从官网下载安装

### 4. 启动服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 运行。

## API 文档

### 认证相关

#### POST /api/auth/login
微信登录

**请求体:**
```json
{
  "code": "微信登录凭证",
  "nickname": "用户昵称",
  "avatar": "头像URL"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "token": "JWT令牌",
    "user": {
      "_id": "用户ID",
      "nickname": "昵称",
      "avatar": "头像",
      "role": "owner|member",
      "familyId": "家庭ID"
    }
  }
}
```

#### POST /api/auth/login-test
测试登录（开发模式）

**请求体:**
```json
{
  "nickname": "测试用户",
  "role": "owner"
}
```

### 家庭管理

#### POST /api/family/create
创建家庭（需要认证）

**请求体:**
```json
{
  "familyName": "温馨的家"
}
```

#### POST /api/family/join
加入家庭（需要认证）

**请求体:**
```json
{
  "inviteCode": "ABC123"
}
```

#### GET /api/family/members
获取家庭成员列表（需要认证 + 家庭）

#### GET /api/family/info
获取家庭信息（需要认证 + 家庭）

### 菜品管理

#### GET /api/dish/list
获取菜品列表（需要认证 + 家庭）

**查询参数:**
- `category`: 分类筛选（荤菜、素菜、汤类、主食、饮料）
- `keyword`: 搜索关键词

#### POST /api/dish/create
添加菜品（需要认证 + 家庭 + 户主）

**请求体:**
```json
{
  "dishName": "宫保鸡丁",
  "category": "荤菜",
  "price": 32,
  "image": "图片URL",
  "description": "经典川菜"
}
```

#### PUT /api/dish/:id
更新菜品（需要认证 + 家庭 + 户主）

#### DELETE /api/dish/:id
删除菜品（需要认证 + 家庭 + 户主）

### 订单管理

#### POST /api/order/submit
提交订单（需要认证 + 家庭）

**请求体:**
```json
{
  "items": [
    {
      "dishId": "菜品ID",
      "dishName": "宫保鸡丁",
      "price": 32,
      "quantity": 1
    }
  ]
}
```

#### GET /api/order/my
获取我的订单（需要认证 + 家庭）

#### GET /api/order/family
获取家庭订单（需要认证 + 家庭 + 户主）

#### PUT /api/order/:id/confirm
确认/取消订单（需要认证 + 家庭 + 户主）

**请求体:**
```json
{
  "action": "confirm|cancel"
}
```

## 部署到 Railway

### 方式一：通过 GitHub（推荐）

1. **将代码推送到 GitHub**
   ```bash
   cd /Users/apple/aicode/family-ordering-backend
   git init
   git add .
   git commit -m "Initial commit"
   gh repo create family-ordering-backend --public --source=.
   git push -u origin main
   ```

2. **在 Railway 部署**
   - 访问 https://railway.app/
   - 点击 "New Project" → "Deploy from GitHub repo"
   - 选择你的仓库
   - Railway 会自动检测 Node.js 项目并部署

3. **添加 MongoDB**
   - 在 Railway 项目中点击 "New Service"
   - 选择 "Database" → "Add MongoDB"
   - Railway 会自动提供 `MONGODB_URI`

4. **设置环境变量**
   - 在项目的 "Variables" 标签页添加：
     - `WECHAT_APPID`: `wx5dfcd63c33aa2556`
     - `WECHAT_SECRET`: 你的微信小程序密钥
     - `JWT_SECRET`: 随机字符串（生成方法：`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`）

### 方式二：通过 CLI

```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录
railway login

# 初始化项目
cd /Users/apple/aicode/family-ordering-backend
railway init

# 添加 MongoDB
railway add mongodb

# 部署
railway up
```

### 获取 API 地址

部署完成后，Railway 会提供一个类似这样的地址：
```
https://your-project-name.up.railway.app
```

这就是你的后端 API 地址。

## 环境变量说明

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `PORT` | 服务器端口 | `3000` |
| `MONGODB_URI` | MongoDB 连接字符串 | Railway 自动提供 |
| `WECHAT_APPID` | 微信小程序 AppID | `wx5dfcd63c33aa2556` |
| `WECHAT_SECRET` | 微信小程序密钥 | 从公众平台获取 |
| `JWT_SECRET` | JWT 签名密钥 | 随机字符串 |

## 前端配置

部署后端后，需要修改前端项目的 `utils/request.js`：

```javascript
// 设置后端 API 地址
const API_BASE_URL = 'https://your-project-name.up.railway.app'

// 关闭模拟数据模式
const DEV_MODE = false
```

## 故障排查

### MongoDB 连接失败
- 检查 `MONGODB_URI` 是否正确
- Railway: 确保已添加 MongoDB 服务
- 本地: 确保 MongoDB 正在运行

### 认证失败
- 检查 `JWT_SECRET` 是否设置
- 确保请求头包含 `Authorization: Bearer <token>`

### 微信登录失败
- 检查 `WECHAT_APPID` 和 `WECHAT_SECRET` 是否正确
- 使用测试登录接口进行调试

## 开发工具

- **Postman**: API 测试
- **MongoDB Compass**: 数据库可视化管理
- **Railway Dashboard**: 日志查看和监控
