/**
 * API配置文件示例
 * 使用方法：
 * 1. 确保您已在config目录下创建secrets.js文件
 * 2. secrets.js中应包含您的API密钥(参见secrets.example.js)
 * 3. 确保secrets.js已在.gitignore中，避免提交到版本控制系统
 */

// 导入密钥配置
// 实际使用时，这里会导入真实的secrets.js文件
const secrets = {
  DEEPSEEK_API_KEY: '您的DeepSeek API密钥',
  XAI_API_KEY: '您的X.AI API密钥'
};

module.exports = {
  // DeepSeek API配置
  DEEPSEEK_API: {
    URL: 'https://api.deepseek.com/chat/completions',
    KEY: secrets.DEEPSEEK_API_KEY,
    MODEL: 'deepseek-chat'
  },
  
  // X.AI API配置
  XAI_API: {
    URL: 'https://api.x.ai/v1/chat/completions',
    KEY: secrets.XAI_API_KEY,
    MODEL: 'grok-3-latest'
  },
  
  // 后端API配置
  BACKEND_API: {
    BASE_URL: 'https://your-backend-api.com', // 替换为您的后端API地址
    CALCULATE_ENDPOINT: '/api/v1/calculate'
  },
  
  // API调用模式
  // 可选值: 'direct' (直接API模式), 'xai' (X.AI API模式), 'mock' (模拟数据模式)
  DEFAULT_MODE: 'mock' // 开发阶段默认使用模拟数据模式
}; 