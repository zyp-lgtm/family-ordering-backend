# 后端项目设置指南

## 📦 已完成

✅ Node.js 项目创建
✅ 所有代码文件已创建
✅ 依赖已安装（114个包）
✅ 项目结构完整

## 🗄️ MongoDB 设置

由于您需要本地开发，有以下几种选择：

### 选项 1：使用 Railway 部署（推荐，最简单）

**优点：**
- 免费
- 无需本地安装 MongoDB
- 自动 HTTPS
- 可直接从小程序访问

**步骤：**
1. 访问 https://railway.app/
2. 注册/登录账号（支持 GitHub 登录）
3. 点击 "New Project"
4. 选择 "Deploy from GitHub repo"
5. 将代码推送到 GitHub 后选择仓库
6. 添加 MongoDB 服务（Railway 一键添加）
7. 设置环境变量

### 选项 2：本地安装 MongoDB

#### macOS 安装 MongoDB

```bash
# 使用 Homebrew 安装
brew tap mongodb/brew
brew install mongodb-community

# 启动 MongoDB
brew services start mongodb-community

# 验证安装
mongo --version
```

#### Windows 安装 MongoDB

1. 访问 https://www.mongodb.com/try/download/community
2. 下载 Windows 安装包
3. 运行安装程序
4. 默认配置即可
5. 安装后 MongoDB 会自动作为服务运行

### 选项 3：使用 Docker（如果已安装）

```bash
# 拉取 MongoDB 镜像
docker pull mongo:latest

# 运行 MongoDB 容器
docker run -d -p 27017:27017 --name mongodb mongo:latest

# 验证运行
docker ps | grep mongo
```

## 🚀 快速开始

### 如果选择 Railway 部署

1. **推送到 GitHub**
   ```bash
   cd /Users/apple/aicode/family-ordering-backend
   git init
   git add .
   git commit -m "Initial commit: family ordering backend"
   ```

2. **在 Railway 部署**
   - 访问 railway.app
   - 连接 GitHub 账号
   - 选择这个仓库
   - Railway 自动部署

3. **添加 MongoDB**
   - 在 Railway 项目中点击 "+" 号
   - 选择 "Database" → "MongoDB"
   - 自动配置完成

4. **获取 API 地址**
   - 部署完成后，Railway 会提供地址
   - 例如: `https://family-ordering.up.railway.app`

### 如果选择本地开发

1. **安装并启动 MongoDB**（见上文）

2. **启动后端服务器**
   ```bash
   cd /Users/apple/aicode/family-ordering-backend
   npm run dev
   ```

3. **测试 API**
   ```bash
   # 健康检查
   curl http://localhost:3000/health

   # 测试登录
   curl -X POST http://localhost:3000/api/auth/login-test \
     -H "Content-Type: application/json" \
     -d '{"nickname":"测试用户","role":"owner"}'
   ```

## 📝 下一步

### 1. 获取微信小程序密钥（如果需要真实登录）

1. 访问 https://mp.weixin.qq.com/
2. 登录小程序后台
3. 开发 → 开发管理 → 开发设置
4. 获取 AppSecret

### 2. 配置小程序服务器域名

**重要：** 个人小程序可以配置服务器域名，但有数量限制。

1. 登录小程序后台
2. 开发 → 开发管理 → 开发设置 → 服务器域名
3. 添加你部署的域名（Railway 提供的域名）
4. 请求类型选择 `request` 合法域名

### 3. 修改前端项目

在后端部署完成后，修改前端项目的 `utils/request.js`：

```javascript
// 修改 API 地址
const API_BASE_URL = 'https://your-railway-app.up.railway.app'

// 关闭模拟数据
const DEV_MODE = false
```

## 🔧 环境变量说明

**必须配置的变量：**

| 变量 | 说明 | Railway 自动提供 |
|------|------|------------------|
| `MONGODB_URI` | MongoDB 连接字符串 | ✅ |
| `PORT` | 服务器端口 | ✅ |

**需要手动配置的变量：**

| 变量 | 说明 | 示例 |
|------|------|------|
| `WECHAT_APPID` | 小程序 AppID | `wx5dfcd63c33aa2556` |
| `WECHAT_SECRET` | 小程序密钥 | 从公众平台获取 |
| `JWT_SECRET` | JWT 签名密钥 | 随机字符串 |

## 📊 项目文件说明

```
family-ordering-backend/
├── server.js              # ✅ 主服务器文件
├── package.json           # ✅ 依赖配置
├── .env                   # ✅ 环境变量（本地）
├── .env.example           # ✅ 环境变量示例
├── .gitignore             # ✅ Git 忽略文件
├── railway.toml           # ✅ Railway 配置
├── README.md              # ✅ 项目文档
├── SETUP.md               # ✅ 本设置指南
└── src/
    ├── models/            # ✅ 数据模型（4个）
    │   ├── User.js
    │   ├── Family.js
    │   ├── Dish.js
    │   └── Order.js
    ├── routes/            # ✅ API 路由（4个）
    │   ├── auth.js       # 认证相关
    │   ├── family.js     # 家庭管理
    │   ├── dish.js       # 菜品管理
    │   └── order.js      # 订单管理
    └── middleware/        # ✅ 中间件
        └── auth.js       # 认证中间件
```

## 🎯 推荐方案

对于个人小程序，**强烈推荐使用 Railway 部署**：

1. ✅ 完全免费
2. ✅ 无需本地安装 MongoDB
3. ✅ 自动 HTTPS
4. ✅ 支持小程序访问
5. ✅ 自动扩容
6. ✅ 日志监控
7. ✅ 一键部署

需要我帮您推送到 GitHub 并部署到 Railway 吗？
