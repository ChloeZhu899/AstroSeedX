# AstroSeed - 命理分析小程序整体架构设计文档

## 一、架构总览

本项目采用前后端分离架构，前端基于微信小程序原生WXML+WXSS开发，后端采用 Java（Spring Boot）开发，整体满足微信小程序开发规范。后端遵循阿里巴巴Java开发手册及RESTful接口设计规范，核心业务通过调用 DeepSeek API 实现命理计算。

### 架构图
```
[微信小程序（原生WXML+WXSS）] ←→ [Java后端API（Spring Boot）] ←→ [DeepSeek API]
```

- 前端：微信小程序原生开发，页面与交互严格按照 prototype.html 和 prd.md 实现
- 后端：Java（Spring Boot），只提供计算接口，负责参数校验、DeepSeek API对接、结果转换
- 计算服务：通过 DeepSeek API 获取命理分析结果

## 二、前端架构设计（微信小程序）

### 1. 页面结构
- 首页（Cover）：品牌Logo、背景、开始按钮
- 信息输入页：出生日期、时辰选择，按钮
- 结果页：命理分析结果分区展示
  - 采用特殊页面结构确保长内容页面也能显示完整背景图
  - 使用page-wrapper + container双层结构，将背景图固定到外层
- 占卜入口页：多维占卜类型入口
- 其他：历史记录、分享、PDF报告等（可后续迭代）

### 2. 主要组件
- 结果卡片组件：统一展示各类结果的卡片样式
  - 卡片背景必须保持透明，不使用backdrop-filter效果
  - 确保卡片不会遮挡背景图
- 图表组件：处理五行分布图等可视化展示
  - 图表背景也需保持透明以展示底层背景图

### 3. 状态管理
- 使用微信小程序原生数据管理方式
- 页面间通过全局数据、页面参数、缓存等方式共享数据

### 4. 网络请求与接口约定
- 统一封装API请求（如 api.js），所有请求走 RESTful 风格
- 错误处理、加载态、异常提示友好
- 接口数据结构严格对齐后端定义

### 5. 适配与规范
- 适配微信小程序平台，遵循微信小程序UI/交互规范
- 响应式布局，适配主流手机屏幕
- 代码风格遵循微信小程序最佳实践
- **背景图适配** - 使用特殊的页面结构确保背景图在长内容下也能正常显示
  - 微信小程序中CSS不能通过url()引用本地图片资源，必须使用image标签
  - 采用绝对定位+z-index层叠方式确保背景显示正常

## 三、后端架构设计（Java）

### 1. 技术栈
- Spring Boot 3.x
- Spring Web (RESTful API)
- Lombok
- Fastjson/Jackson（JSON序列化）
- OkHttp/RestTemplate（调用DeepSeek API）
- JSR-303参数校验
- Swagger3（接口文档）

### 2. 分层结构
- controller：接口层，参数校验、统一响应
- service：业务层，组装参数、调用DeepSeek API、结果转换
- client：DeepSeek API对接层
- model：DTO/VO/BO等数据结构
- config/exception：配置与全局异常处理

### 3. 主要接口设计
- 仅提供一个主计算接口

#### 接口定义
- URL：`POST /api/v1/calculate`
- 请求参数：
```json
{
  "birthDate": "1995-08-15",
  "birthTime": "午时",
  "gender": "女" // 可选
}
```
- 响应参数：
```json
{
  "lunarDate": "1995年七月十九（闰月）",
  "solarTerm": "立秋",
  "bazi": {
    "year": "乙亥",
    "month": "丙申",
    "day": "丁酉",
    "hour": "戊午"
  },
  "wuxing": {
    "金": 2,
    "木": 1,
    "水": 1,
    "火": 2,
    "土": 1
  },
  "wuxingLack": "缺木，建议多接触大自然",
  "zodiac": "猪",
  "aiSummary": [
    "你天生聪慧，适合文职工作。",
    "今年事业有贵人相助。",
    "注意饮食健康，防止肠胃问题。"
  ]
}
```
- 错误码与异常响应遵循统一规范（如400参数错误、500服务异常等）

### 4. DeepSeek API对接
- service层负责组装参数并调用DeepSeek API
- client层封装HTTP请求，处理API鉴权、超时、异常
- 对DeepSeek返回结果进行字段映射和业务转换，输出前端所需结构
- 支持接口超时/异常重试与降级

### 5. 编码规范与安全
- 严格遵循阿里巴巴Java开发手册
- RESTful接口风格，接口幂等性
- 参数校验（JSR-303）、XSS/SQL注入防护
- 日志与接口调用链追踪
- 统一异常处理与错误码

## 四、前后端接口定义
- 详见上文接口设计，所有接口均为JSON格式，POST请求
- 支持CORS，接口安全校验（如签名、token等可扩展）

## 五、安全与合规
- 用户数据仅用于命理分析，不做持久化存储（如需历史记录，需加密存储）
- 严格遵守微信小程序平台隐私合规要求
- DeepSeek API密钥安全存储，不暴露于前端

## 六、部署与运维建议
- 前端微信小程序项目通过微信开发者工具打包，上传微信开发者平台
- 后端Java服务可部署于云服务器（如阿里云ECS、K8s等），建议使用HTTPS
- 日志、监控、告警完善，接口限流防刷
- DeepSeek API调用量监控与异常告警

---
如需详细类图、接口文档或具体代码模板，请随时告知。 

AstroSeed/
├── assets/                    # 静态资源
│   ├── images/                # 图片资源
│   │   └── background.png     # 统一背景图
│   └── styles/                # 样式文件
│       └── main.wxss          # 主样式文件
├── components/                # 组件
│   ├── result-card/           # 结果卡片组件
│   └── chart/                 # 图表组件(五行分布图等)
├── pages/                     # 页面
│   ├── index/                 # 首页
│   ├── input/                 # 信息输入页
│   ├── result/                # 结果页
│   └── divination/            # 占卜入口页及子页面
├── services/                  # 服务
│   ├── api.js                 # API调用服务
│   └── bazi.js                # 八字计算相关
├── utils/                     # 工具函数
│   ├── date.js                # 日期处理
│   └── format.js              # 格式化工具
├── app.js                     # 小程序入口文件
├── app.json                   # 小程序配置
└── app.wxss                   # 全局样式 