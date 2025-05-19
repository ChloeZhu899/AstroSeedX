# AstroSeed - 命理分析小程序

根据提供的PRD和原型，这是一个命理分析小程序项目的整体架构和实现方案。

## 项目结构

```
AstroSeed/
├── assets/                    # 静态资源
│   ├── images/                # 图片资源
│   │   ├── background.png     # 统一背景图
│   │   ├── logo.png           # 应用Logo
│   │   ├── love-icon.png      # 感情占卜图标
│   │   ├── career-icon.png    # 事业占卜图标
│   │   ├── wealth-icon.png    # 财运占卜图标
│   │   └── health-icon.png    # 健康占卜图标
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
```

## 各模块作用

### 1. 页面模块

- **首页(index)**：展示品牌标识和开始按钮，简洁大气
- **信息输入页(input)**：收集用户出生日期和时辰信息
- **结果页(result)**：展示命理分析结果，包括八字、五行分布等
- **占卜入口页(divination)**：提供多种占卜类型入口

### 2. 服务模块

- **API服务(api.js)**：封装后端API调用，处理请求和响应
- **八字服务(bazi.js)**：处理八字计算相关逻辑

### 3. 组件模块

- **结果卡片组件**：统一展示各类结果的卡片样式
- **图表组件**：处理五行分布图等可视化展示

### 4. 工具模块

- **日期工具**：处理阳历、农历转换，时辰处理等
- **格式化工具**：处理API返回数据的格式化展示

## 数据流转方式

项目采用微信小程序原生数据管理方式，页面间通过全局数据、页面参数、缓存等方式共享数据。

在 `app.js` 中定义全局数据：

```javascript
// app.js
App({
  // ...
  globalData: {
    // 全局数据，可被所有页面访问
    userInfo: null,
    birthDate: null,
    birthTime: null,
    analysisResult: null
  },
  
  // 全局方法
  saveUserInput: function(birthDate, birthTime) {
    this.globalData.birthDate = birthDate;
    this.globalData.birthTime = birthTime;
  },
  
  saveAnalysisResult: function(result) {
    this.globalData.analysisResult = result;
    // 可以同时存入缓存，便于历史记录功能
    wx.setStorage({
      key: 'lastAnalysisResult',
      data: result
    });
  }
})
```

页面间数据传递示例：

```javascript
// 在input页面保存数据到全局
const app = getApp();
app.saveUserInput(birthDate, birthTime);

// 在result页面获取全局数据
const app = getApp();
const { birthDate, birthTime } = app.globalData;
```

## 代码示例

### 结果页面展示

**JavaScript代码 (result.js)**:

```javascript
// pages/result/result.js
const apiService = require('../../services/api');
const formatUtil = require('../../utils/format');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    result: null,
    baziString: '',
    error: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.fetchAnalysisResult();
  },

  /**
   * 获取分析结果
   */
  fetchAnalysisResult: function() {
    const app = getApp();
    const { birthDate, birthTime } = app.globalData;
    
    if (!birthDate || !birthTime) {
      wx.showToast({
        title: '缺少出生信息',
        icon: 'none'
      });
      
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      
      return;
    }
    
    this.setData({
      isLoading: true,
      error: null
    });
    
    // 调用API获取分析结果
    apiService.getBaziAnalysis(birthDate, birthTime)
      .then(result => {
        // 格式化结果
        const formattedResult = formatUtil.formatAnalysisResult(result);
        const baziString = formatUtil.formatBaziString(formattedResult.bazi);
        
        // 保存到全局数据
        app.saveAnalysisResult(formattedResult);
        
        this.setData({
          isLoading: false,
          result: formattedResult,
          baziString: baziString
        });
      })
      .catch(error => {
        console.error('获取分析结果失败:', error);
        
        this.setData({
          isLoading: false,
          error: '获取分析结果失败，请重试'
        });
        
        apiService.handleApiError(error);
      });
  }
});
```

**WXML模板 (result.wxml)**:

```html
<!-- pages/result/result.wxml -->
<view class="container">
  <!-- 加载中 -->
  <view class="loading-container" wx:if="{{isLoading}}">
    <view class="loading">
      <view class="loading-icon"></view>
      <view class="loading-text">命理分析中...</view>
    </view>
  </view>
  
  <!-- 错误提示 -->
  <view class="error-container" wx:elif="{{error}}">
    <view class="card error-card">
      <view class="error-icon">!</view>
      <view class="error-text">{{error}}</view>
      <button class="main-button" bindtap="handleReanalyze">重新分析</button>
    </view>
  </view>
  
  <!-- 分析结果 -->
  <block wx:elif="{{result}}">
    <!-- 基本信息 -->
    <view class="card">
      <view class="title">基本信息</view>
      <view class="info-row">
        <view class="info-label">农历日期:</view>
        <view class="info-value">{{result.lunarDate}}</view>
      </view>
      <view class="info-row">
        <view class="info-label">当时节气:</view>
        <view class="info-value">{{result.solarTerm}}</view>
      </view>
      <view class="info-row">
        <view class="info-label">生肖:</view>
        <view class="info-value">{{result.zodiac}}</view>
      </view>
      <view class="info-row">
        <view class="info-label">八字:</view>
        <view class="info-value">{{baziString}}</view>
      </view>
    </view>
    
    <!-- 五行分布 -->
    <view class="card">
      <view class="title">五行分布</view>
      <chart wuxingData="{{result.wuxing}}"></chart>
      <view class="wuxing-lack" wx:if="{{result.wuxingLack}}">
        {{result.wuxingLack}}
      </view>
    </view>
    
    <!-- AI命理分析 -->
    <view class="card">
      <view class="title">命理分析</view>
      <view class="ai-summary">
        <view class="summary-item" wx:for="{{result.aiSummary}}" wx:key="index">
          {{item}}
        </view>
      </view>
    </view>
  </block>
</view>
```

### 占卜入口页面

**JavaScript代码 (divination.js)**:

```javascript
// pages/divination/divination.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    divinationTypes: [
      {
        id: 'love',
        title: '感情占卜',
        icon: '/assets/images/love-icon.png',
        desc: '解析感情运势与桃花'
      },
      {
        id: 'career',
        title: '事业占卜',
        icon: '/assets/images/career-icon.png',
        desc: '分析职场发展与机遇'
      },
      {
        id: 'wealth',
        title: '财运占卜',
        icon: '/assets/images/wealth-icon.png',
        desc: '预测财富走向与机会'
      },
      {
        id: 'health',
        title: '健康占卜',
        icon: '/assets/images/health-icon.png',
        desc: '了解身体状况与养生'
      }
    ]
  },

  /**
   * 选择占卜类型
   */
  selectDivinationType: function(e) {
    const { id } = e.currentTarget.dataset;
    
    // 目前只是提示功能即将上线
    wx.showToast({
      title: '该功能即将上线',
      icon: 'none',
      duration: 2000
    });
  }
});
```

**WXML模板 (divination.wxml)**:

```html
<!-- pages/divination/divination.wxml -->
<view class="container">
  <view class="title">更多占卜</view>
  <view class="subtitle">选择您感兴趣的占卜类型</view>
  
  <view class="divination-grid">
    <view class="option-card" 
          wx:for="{{divinationTypes}}" 
          wx:key="id" 
          bindtap="selectDivinationType" 
          data-id="{{item.id}}">
      <image class="option-icon" src="{{item.icon}}" mode="aspectFit"></image>
      <view class="option-title">{{item.title}}</view>
      <view class="option-desc">{{item.desc}}</view>
    </view>
  </view>
  
  <button class="secondary-button" bindtap="goBackToResult">
    返回分析结果
  </button>
</view>
```

## 技术实现要点

### 1. 界面实现

- 使用微信小程序原生WXML+WXSS开发
- 统一使用background.png作为背景图，设置为fixed定位
- 所有内容区块使用半透明卡片，通过backdrop-filter实现模糊效果
- 文字使用适当阴影确保在背景上清晰可见
- 按钮统一使用绿色(#8be28b)作为主色调

### 2. API调用实现

通过后端API中转调用DeepSeek API，确保API密钥安全：

```javascript
// services/api.js
const API_BASE_URL = 'https://api.example.com';

const getBaziAnalysis = (birthDate, birthTime, gender) => {
  return request('/api/v1/calculate', 'POST', {
    birthDate,
    birthTime,
    gender
  });
};
```

## 注意事项

### 1. API密钥安全
- API密钥存储在后端，前端通过后端API间接调用DeepSeek API
- 避免在前端代码中硬编码任何密钥

### 2. 性能优化
- 减少不必要的重复渲染
- 优化图片资源大小，特别是背景图
- 使用缓存存储用户历史查询结果

### 3. 用户体验
- 添加适当的加载状态提示
- 处理API调用失败的错误提示
- 确保所有交互元素有足够的点击区域

### 4. 兼容性
- 测试不同机型和系统版本
- 确保背景图在不同屏幕比例下显示正常
- 测试在弱网环境下的表现

### 5. 域名白名单问题
- 微信小程序只允许请求已在管理后台配置的域名
- 开发阶段可在"详情" → "本地设置"中勾选"不校验合法域名"
- 生产环境必须在微信小程序管理后台的"开发"->"开发设置"->"服务器域名"中添加合法域名
- 也可以使用模拟数据进行开发测试，避免频繁请求API

## 后续迭代计划

1. **功能扩展**：
   - 实现历史记录功能
   - 添加社交分享功能
   - 开发付费的详细命理报告

2. **UI优化**：
   - 增加更多动画效果
   - 优化五行分布图的可视化效果
   - 增加更多国风元素

3. **性能提升**：
   - 优化API调用策略，减少等待时间
   - 实现本地计算部分简单命理数据，减少API依赖

## 构建与调试指南

### 开发环境配置

1. **安装开发工具**：
   - 下载并安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
   - 注册微信小程序开发者账号，获取AppID（也可使用测试号）

2. **导入项目**：
   - 打开微信开发者工具
   - 点击"项目" → "导入项目"
   - 选择项目目录，填入AppID
   - 点击"导入"按钮

### 本地调试

1. **编译与预览**：
   - 在开发者工具中点击"编译"按钮
   - 左侧模拟器中可以预览小程序效果
   - 可以选择不同的设备尺寸进行预览

2. **代码调试**：
   - 使用Console面板查看日志输出
   - 使用Network面板监控网络请求
   - 使用Storage面板查看缓存数据
   - 使用AppData面板查看页面数据

3. **自定义编译**：
   - 可以在"详情" → "本地设置"中配置自定义编译条件
   - 可以设置启动页面、场景值等参数

### 直接调用DeepSeek API（仅开发测试）

小程序提供了两种API调用模式：

1. **后端API模式**（推荐生产环境使用）：
   - 通过后端服务中转调用DeepSeek API
   - API密钥安全存储在服务端
   - 避免了密钥泄露风险

2. **直接API模式**（仅开发测试使用）：
   - 在信息输入页面点击"切换到直接API模式"
   - 输入DeepSeek API Key
   - 直接从小程序调用DeepSeek API
   - 注意：此模式仅用于开发测试，不要在生产环境使用

DeepSeek API调用示例：
```bash
curl https://api.deepseek.com/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <DeepSeek API Key>" \
  -d '{
        "model": "deepseek-chat",
        "messages": [
          {"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": "Hello!"}
        ],
        "stream": false
      }'
```

### 真机调试

1. **预览调试**：
   - 点击开发者工具上方的"预览"按钮
   - 使用微信扫描生成的二维码
   - 在手机微信中打开小程序进行测试

2. **远程调试**：
   - 点击"远程调试"按钮
   - 使用微信扫描二维码
   - 可以在开发者工具中查看真机的运行状态和日志

3. **性能监控**：
   - 使用"Audits"面板进行性能分析
   - 检查页面渲染、脚本执行、网络请求等性能指标

### 常见问题排查

1. **API调用失败**：
   - 检查API地址是否正确
   - 检查请求参数格式
   - 查看服务器返回的错误信息

2. **页面渲染问题**：
   - 检查数据是否正确绑定
   - 检查条件渲染语句
   - 查看控制台是否有错误信息

3. **样式兼容性**：
   - 在不同尺寸设备上测试
   - 检查rpx单位的使用是否合理
   - 测试不同系统版本的兼容性

4. **背景图片问题**：
   - 微信小程序的WXSS中不能直接通过url()引用本地图片资源
   - 需要使用`<image>`标签代替CSS背景图
   - 在每个页面的WXML中添加`<image class="bg-image" src="/assets/images/background.png" mode="aspectFill"></image>`
   - 确保图片路径正确且图片文件存在

5. **域名白名单问题**：
   - 微信小程序只允许请求已在管理后台配置的域名
   - 开发阶段可在"详情" → "本地设置"中勾选"不校验合法域名"
   - 生产环境必须在微信小程序管理后台的"开发"->"开发设置"->"服务器域名"中添加合法域名
   - 也可以使用模拟数据进行开发测试，避免频繁请求API

## 后续迭代计划

1. **功能扩展**：
   - 实现历史记录功能
   - 添加社交分享功能
   - 开发付费的详细命理报告

2. **UI优化**：
   - 增加更多动画效果
   - 优化五行分布图的可视化效果
   - 增加更多国风元素

3. **性能提升**：
   - 优化API调用策略，减少等待时间
   - 实现本地计算部分简单命理数据，减少API依赖

## 构建与调试指南

### 开发环境配置

1. **安装开发工具**：
   - 下载并安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
   - 注册微信小程序开发者账号，获取AppID（也可使用测试号）

2. **导入项目**：
   - 打开微信开发者工具
   - 点击"项目" → "导入项目"
   - 选择项目目录，填入AppID
   - 点击"导入"按钮

### 本地调试

1. **编译与预览**：
   - 在开发者工具中点击"编译"按钮
   - 左侧模拟器中可以预览小程序效果
   - 可以选择不同的设备尺寸进行预览

2. **代码调试**：
   - 使用Console面板查看日志输出
   - 使用Network面板监控网络请求
   - 使用Storage面板查看缓存数据
   - 使用AppData面板查看页面数据

3. **自定义编译**：
   - 可以在"详情" → "本地设置"中配置自定义编译条件
   - 可以设置启动页面、场景值等参数

### 直接调用DeepSeek API（仅开发测试）

小程序提供了两种API调用模式：

1. **后端API模式**（推荐生产环境使用）：
   - 通过后端服务中转调用DeepSeek API
   - API密钥安全存储在服务端
   - 避免了密钥泄露风险

2. **直接API模式**（仅开发测试使用）：
   - 在信息输入页面点击"切换到直接API模式"
   - 输入DeepSeek API Key
   - 直接从小程序调用DeepSeek API
   - 注意：此模式仅用于开发测试，不要在生产环境使用

DeepSeek API调用示例：
```bash
curl https://api.deepseek.com/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <DeepSeek API Key>" \
  -d '{
        "model": "deepseek-chat",
        "messages": [
          {"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": "Hello!"}
        ],
        "stream": false
      }'
```

### 真机调试

1. **预览调试**：
   - 点击开发者工具上方的"预览"按钮
   - 使用微信扫描生成的二维码
   - 在手机微信中打开小程序进行测试

2. **远程调试**：
   - 点击"远程调试"按钮
   - 使用微信扫描二维码
   - 可以在开发者工具中查看真机的运行状态和日志

3. **性能监控**：
   - 使用"Audits"面板进行性能分析
   - 检查页面渲染、脚本执行、网络请求等性能指标

### 常见问题排查

1. **API调用失败**：
   - 检查API地址是否正确
   - 检查请求参数格式
   - 查看服务器返回的错误信息

2. **页面渲染问题**：
   - 检查数据是否正确绑定
   - 检查条件渲染语句
   - 查看控制台是否有错误信息

3. **样式兼容性**：
   - 在不同尺寸设备上测试
   - 检查rpx单位的使用是否合理
   - 测试不同系统版本的兼容性

## API配置说明

项目提供了三种API调用模式，可以根据不同的开发阶段和需求选择合适的模式：

### 1. 后端API模式（推荐生产环境使用）

- 通过后端服务中转调用DeepSeek API
- API密钥安全存储在后端服务器上
- 避免了密钥泄露风险
- 适用于生产环境

### 2. 直接API模式（仅开发测试使用）

- 直接从小程序调用DeepSeek API
- 需要在页面中输入DeepSeek API Key
- 存在API密钥泄露风险
- 仅适用于开发测试阶段

### 3. 模拟数据模式（离线开发使用）

- 使用预设的模拟数据，不调用实际API
- 不需要API密钥
- 适用于开发初期和UI调整阶段
- 避免频繁API调用

### API配置文件设置

1. 复制`config/api_config.example.js`文件并重命名为`api_config.js`
2. 在`api_config.js`中填入您的实际API密钥和URL
3. 根据需要设置默认的API调用模式

```javascript
module.exports = {
  // DeepSeek API配置
  DEEPSEEK_API: {
    URL: 'https://api.deepseek.com/chat/completions',
    KEY: 'your_deepseek_api_key_here', // 替换为您的实际API密钥
    MODEL: 'deepseek-chat'
  },
  
  // 后端API配置
  BACKEND_API: {
    BASE_URL: 'https://your-backend-api.com', // 替换为您的后端API地址
    CALCULATE_ENDPOINT: '/api/v1/calculate'
  },
  
  // API调用模式
  DEFAULT_MODE: 'backend' // 'backend', 'direct', 'mock'
};
```

**注意：** `api_config.js`文件已添加到`.gitignore`中，不会被提交到版本控制系统，确保您的API密钥安全。 