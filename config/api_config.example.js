/**
 * API配置文件示例
 * 使用方法：
 * 1. 复制此文件并重命名为api_config.js
 * 2. 填入您的实际API密钥和URL
 * 3. 确保api_config.js已在.gitignore中，避免提交到版本控制系统
 */

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
  // 可选值: 'backend' (后端API模式), 'direct' (直接API模式), 'mock' (模拟数据模式)
  DEFAULT_MODE: 'mock' // 开发阶段默认使用模拟数据模式
}; 