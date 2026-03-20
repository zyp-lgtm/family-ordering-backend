# 家庭点餐后端 API - 开发指南

> 本文件包含后端项目特定的上下文信息，用于辅助 AI 辅助开发工作。

**最后更新：** 2026-03-20

## 项目概述

**项目名称**：家庭点餐后端 API

**项目描述**：为家庭点餐微信小程序提供后端服务，包括用户认证、家庭管理、菜品管理、订单管理等功能。

**技术栈**：
- **运行环境**：Node.js
- **Web 框架**：Express.js
- **数据库**：MongoDB
- **ODM**：Mongoose
- **认证**：JWT (JSON Web Tokens)
- **部署平台**：Railway

**项目路径**：`/Users/apple/aicode/family-ordering-backend`
**仓库地址**：https://github.com/zyp-lgtm/family-ordering-backend
**部署地址**：https://family-ordering-backend-production.up.railway.app

---

## 项目结构

```
family-ordering-backend/
├── src/
│   ├── models/                     # 数据模型
│   │   ├── User.js                 # 用户模型
│   │   ├── Family.js               # 家庭模型
│   │   ├── Dish.js                 # 菜品模型
│   │   └── Order.js                # 订单模型
│   ├── routes/                     # 路由
│   │   ├── auth.js                 # 认证路由
│   │   ├── family.js               # 家庭路由
│   │   ├── dish.js                 # 菜品路由
│   │   └── order.js                # 订单路由
│   ├── middleware/                 # 中间件
│   │   └── auth.js                 # JWT 认证中间件
│   └── config/                     # 配置文件
├── server.js                       # 服务器入口
├── package.json
├── .env                            # 环境变量（不提交到Git）
└── CLAUDE.md                       # 本文件
```

---

## 数据模型详解

### User（用户模型）
**文件**：`src/models/User.js`

```javascript
{
  _id: ObjectId,                    // 用户ID（自动生成）
  openid: {                         // 微信openId（唯一索引）
    type: String,
    required: true,
    unique: true
  },
  nickname: {                       // 昵称
    type: String,
    default: '用户'
  },
  avatar: {                         // 头像URL
    type: String,
    default: ''
  },
  role: {                           // 角色
    type: String,
    enum: ['owner', 'member'],
    default: 'member'
  },
  familyId: {                       // 家庭ID（可为null）
    type: ObjectId,
    ref: 'Family',
    default: null
  },
  createTime: {
    type: Date,
    default: Date.now
  }
}
```

**重要**：`familyId` 使用 **ObjectId** 类型，因为需要与 Family 模型建立关联。

---

### Family（家庭模型）
**文件**：`src/models/Family.js`

```javascript
{
  _id: ObjectId,                    // 家庭ID（自动生成）
  familyName: {                     // 家庭名称
    type: String,
    required: true
  },
  ownerId: {                        // 户主ID
    type: ObjectId,
    ref: 'User',
    required: true
  },
  inviteCode: {                     // 邀请码（唯一索引）
    type: String,
    unique: true,
    required: true
  },
  memberCount: {                    // 成员数量
    type: Number,
    default: 1
  },
  createTime: {
    type: Date,
    default: Date.now
  }
}
```

---

### Dish（菜品模型）
**文件**：`src/models/Dish.js`

```javascript
{
  _id: ObjectId,                    // 菜品ID（自动生成）
  familyId: {                       // 家庭ID
    type: ObjectId,
    ref: 'Family',
    required: true,
    index: true
  },
  dishName: {                       // 菜品名称
    type: String,
    required: true
  },
  category: {                       // 分类
    type: String,
    required: true,
    enum: ['荤菜', '素菜', '汤类', '主食', '饮料']
  },
  price: {                          // 价格（参考用）
    type: Number,
    required: true,
    min: 0
  },
  image: {                          // 图片URL
    type: String,
    default: ''
  },
  description: {                    // 描述
    type: String,
    default: ''
  },
  isAvailable: {                    // 是否上架
    type: Boolean,
    default: true
  },
  createTime: {
    type: Date,
    default: Date.now
  },
  updateTime: {                     // 更新时间
    type: Date,
    default: Date.now
  }
}
```

**中间件**：保存前自动更新 `updateTime`

---

### Order（订单模型）
**文件**：`src/models/Order.js`

```javascript
{
  _id: ObjectId,                    // 订单ID（自动生成）
  familyId: {                       // 家庭ID（String类型！）
    type: String,
    required: true,
    index: true
  },
  userId: {                         // 用户ID（String类型！）
    type: String,
    required: true
  },
  userName: {                       // 用户昵称
    type: String,
    required: true
  },
  items: [{                         // 订单项
    dishId: {                       // 菜品ID（String类型！）
      type: String,
      required: true
    },
    dishName: {                     // 菜品名称
      type: String,
      required: true
    },
    price: {                        // 价格
      type: Number,
      required: true
    },
    quantity: {                     // 数量
      type: Number,
      required: true,
      min: 1
    }
  }],
  totalAmount: {                    // 总金额
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  status: {                         // 订单状态
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  createTime: {
    type: Date,
    default: Date.now
  },
  confirmTime: {
    type: Date,
    default: null
  }
}
```

**重要说明**：
- `familyId`, `userId`, `dishId` 使用 **String** 类型，避免 ObjectId 序列化问题
- 前端发送 `_id`，后端自动映射为 `dishId`

---

## 路由详解

### 认证路由（`src/routes/auth.js`）

#### POST /api/auth/login
微信登录（需要 code）

#### POST /api/auth/login-test
测试登录（开发用，无需微信 code）

**请求体**：
```json
{
  "nickname": "测试用户",
  "role": "owner" | "member"
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "_id": "user_id",
      "nickname": "测试用户",
      "avatar": "",
      "role": "owner",
      "familyId": null
    }
  }
}
```

---

### 家庭路由（`src/routes/family.js`）

#### POST /api/family/create
创建家庭（需要认证）

#### POST /api/family/join
加入家庭（需要认证）

**请求体**：
```json
{
  "inviteCode": "ABC123"
}
```

#### GET /api/family/info
获取家庭信息（需要认证，需要加入家庭）

#### GET /api/family/members
获取家庭成员列表（需要认证，需要加入家庭）

---

### 菜品路由（`src/routes/dish.js`）

#### POST /api/dish/init
初始化示例菜品（户主专用，开发用）

初始化 10 个示例菜品：
- 荤菜：宫保鸡丁、红烧肉、麻婆豆腐
- 素菜：清炒时蔬、番茄炒蛋、蒜蓉西兰花
- 汤类：紫菜蛋花汤、冬瓜排骨汤
- 主食：米饭、馒头

#### GET /api/dish/list
获取菜品列表（需要认证，需要加入家庭）

**查询参数**：
- `category`: 分类筛选
- `keyword`: 关键词搜索

#### POST /api/dish/create
添加菜品（户主专用）

#### PUT /api/dish/:id
更新菜品（户主专用）

#### DELETE /api/dish/:id
删除菜品（户主专用）

---

### 订单路由（`src/routes/order.js`）

#### POST /api/order/submit
提交订单（需要认证，需要加入家庭）

**请求体**：
```json
{
  "items": [
    {
      "_id": "dish_id",
      "dishName": "宫保鸡丁",
      "price": 32,
      "quantity": 1
    }
  ]
}
```

**处理逻辑**：
1. 验证用户已加入家庭
2. 将 `item._id` 映射为 `dishId`
3. 验证所有必需字段
4. 转换 ObjectId 为 String
5. 计算总金额
6. 创建并保存订单

**响应**：
```json
{
  "success": true,
  "data": {
    "_id": "order_id",
    "familyId": "family_id",
    "userId": "user_id",
    "userName": "测试用户",
    "items": [
      {
        "dishId": "dish_id",
        "dishName": "宫保鸡丁",
        "price": 32,
        "quantity": 1
      }
    ],
    "totalAmount": 32,
    "status": "pending",
    "createTime": "2026-03-20T..."
  }
}
```

#### GET /api/order/my
获取我的订单（需要认证，需要加入家庭）

**查询条件**：
```javascript
{
  familyId: req.user.familyId.toString(),
  userId: req.user._id.toString()
}
```

#### GET /api/order/family
获取家庭订单（户主专用）

#### PUT /api/order/:id/confirm
确认/取消订单（户主专用）

**请求体**：
```json
{
  "action": "confirm" | "cancel"
}
```

---

## 中间件

### 认证中间件（`src/middleware/auth.js`）

#### authenticate
JWT 认证中间件

**处理流程**：
1. 从请求头获取 token：`Authorization: Bearer {token}`
2. 验证 token
3. 查询用户信息（使用 `.select('-__v')` 获取所有字段）
4. 将用户信息附加到 `req.user`

**使用**：
```javascript
router.post('/submit', authenticate, requireFamily, async (req, res) => {
  console.log(req.user)  // { _id, nickname, avatar, role, familyId, ... }
})
```

#### requireFamily
检查用户是否已加入家庭

**使用**：
```javascript
router.get('/list', authenticate, requireFamily, async (req, res) => {
  // 确保 req.user.familyId 存在
})
```

#### requireOwner
检查用户是否为户主

**使用**：
```javascript
router.post('/create', authenticate, requireOwner, async (req, res) => {
  // 确保 req.user.role === 'owner'
})
```

---

## 重要约定

### 类型转换规则

#### ObjectId → String（用于查询和存储）
```javascript
// User 模型的 familyId 是 ObjectId
// Order 模型的 familyId 是 String
// 查询时需要转换

await Order.find({
  familyId: req.user.familyId.toString(),
  userId: req.user._id.toString()
})
```

#### 前端 _id → 后端 dishId（用于订单项）
```javascript
// 前端发送：{ _id: "dish_xxx", ... }
// 后端映射为：{ dishId: "dish_xxx", ... }

const dishId = item.dishId || item._id
```

### 错误处理

#### 统一错误响应格式
```javascript
res.status(500).json({
  error: '操作失败',
  message: error.message,
  stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
})
```

#### 抛出验证错误
```javascript
// 抛出错误会被 catch 捕获
if (!item.dishName) {
  throw new Error(`第 ${index + 1} 个菜品缺少名称`)
}
```

### 日志规范

#### 重要操作必须记录日志
```javascript
console.log('提交订单请求体:', JSON.stringify(req.body, null, 2))
console.log('用户信息:', {
  _id: req.user._id,
  nickname: req.user.nickname,
  familyId: req.user.familyId
})
console.log('订单保存成功, _id:', order._id)
```

#### 错误日志包含堆栈
```javascript
console.error('提交订单失败:', error)
console.error('错误堆栈:', error.stack)
```

---

## 环境变量

### 必需变量
```bash
# MongoDB 连接字符串
MONGODB_URI=mongodb://user:pass@host:port/database

# JWT 密钥（自动生成）
JWT_SECRET=random_secret_key

# 运行环境
NODE_ENV=production

# 微信小程序配置（可选，正式登录需要）
WECHAT_APPID=your_appid
WECHAT_SECRET=your_secret
```

### Railway 配置
在 Railway 控制台设置环境变量：
1. 进入项目设置
2. 添加变量
3. 重新部署

---

## 部署

### Railway 自动部署
推送到 GitHub 后自动触发部署：
```bash
git add .
git commit -m "feat: something"
git push
```

### 健康检查
```bash
curl https://family-ordering-backend-production.up.railway.app/health
```

**响应**：
```json
{
  "status": "ok",
  "message": "家庭点餐 API 服务正常运行",
  "database": {
    "state": "connected",
    "ready": true,
    "host": "configured"
  }
}
```

---

## 开发命令

### 本地开发
```bash
cd /Users/apple/aicode/family-ordering-backend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 启动生产服务器
npm start
```

### Git 操作
```bash
# 查看状态
git status

# 提交代码
git add .
git commit -m "fix: something"
git push

# 查看日志
git log --oneline -10
```

---

## 常见问题

### 问题 1：ObjectId 转换错误
**错误**：`Cast to ObjectId failed for value "xxx"`

**原因**：类型不匹配，String 类型的 ID 被当作 ObjectId 查询

**解决**：
```javascript
// 错误
await Order.find({ familyId: req.user.familyId })

// 正确
await Order.find({ familyId: req.user.familyId.toString() })
```

### 问题 2：用户字段缺失
**错误**：`Cannot read property 'nickname' of undefined`

**原因**：认证中间件没有返回所有字段

**解决**：
```javascript
// 使用 .select('-__v') 获取除 __v 外的所有字段
const user = await User.findById(decoded.userId).select('-__v')
```

### 问题 3：订单项字段不完整
**错误**：`第 1 个菜品缺少 ID`

**原因**：前端发送的字段与后端期望不匹配

**解决**：后端同时支持 `_id` 和 `dishId`
```javascript
const dishId = item.dishId || item._id
```

---

## 测试 API

### 使用 curl

#### 1. 登录获取 token
```bash
curl -X POST https://family-ordering-backend-production.up.railway.app/api/auth/login-test \
  -H "Content-Type: application/json" \
  -d '{"nickname":"测试","role":"owner"}'
```

#### 2. 创建家庭
```bash
curl -X POST https://family-ordering-backend-production.up.railway.app/api/family/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"familyName":"温馨的家"}'
```

#### 3. 提交订单
```bash
curl -X POST https://family-ordering-backend-production.up.railway.app/api/order/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "items": [
      {
        "_id": "dish_id",
        "dishName": "宫保鸡丁",
        "price": 32,
        "quantity": 1
      }
    ]
  }'
```

### 使用 Postman
1. 导入 API 端点
2. 设置环境变量：`BASE_URL`, `TOKEN`
3. 使用 Pre-request Script 自动添加 Authorization

---

## 更新日志

### 2026-03-20
- ✅ 修复订单提交 ObjectId 类型问题
- ✅ Order 模型改用 String 类型（familyId, userId, dishId）
- ✅ 添加前端 _id 到 dishId 的映射
- ✅ 修复查询时类型转换问题
- ✅ 添加完整的错误处理和日志

### 2026-03-19
- ✅ 初始化后端项目
- ✅ 实现所有基础 API
- ✅ 配置 Railway 部署
- ✅ MongoDB 连接配置

---

## 相关资源

- [Express.js 官方文档](https://expressjs.com/)
- [Mongoose 官方文档](https://mongoosejs.com/docs/)
- [JWT 官方网站](https://jwt.io/)
- [Railway 官方文档](https://docs.railway.app/)
- [MongoDB 手册](https://docs.mongodb.com/manual/)
