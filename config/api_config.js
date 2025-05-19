/**
 * API配置文件
 * 注意：此文件包含敏感信息，不应提交到版本控制系统
 * 在实际部署时，应使用环境变量或其他安全方式存储密钥
 */

module.exports = {
  // DeepSeek API配置
  DEEPSEEK_API: {
    URL: 'https://api.deepseek.com/chat/completions',
    KEY: 'sk-ab8914cd6dc84cbbbcff46c4efb018f6', // 替换为您的实际API密钥
    MODEL: 'deepseek-chat'
  },
  
  // X.AI API配置
  XAI_API: {
    URL: 'https://api.x.ai/v1/chat/completions',
    KEY: 'xai-VZq1z1bvCIhSnrDp9yb79lQO4IkdOTQSxV3bWwg30ExgqHoPctQrYqPkYgqWMyzA1EX159pwV537Urzu', // 替换为您的实际API密钥
    MODEL: 'grok-3-latest'
  },
  
  // 后端API配置
  BACKEND_API: {
    BASE_URL: 'https://api.astroseed.com', // 实际的后端API地址
    CALCULATE_ENDPOINT: '/api/v1/calculate'
  },
  
  // API调用模式
  // 可选值: 'direct' (直接API模式), 'xai' (X.AI API模式), 'mock' (模拟数据模式)
  DEFAULT_MODE: 'xai' // 默认使用X.AI API模式
}; 