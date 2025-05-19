// services/api.js

// 导入API配置
let apiConfig;
try {
  apiConfig = require('../config/api_config');
} catch (error) {
  console.error('无法加载API配置文件:', error);
  // 使用默认配置
  apiConfig = {
    DEEPSEEK_API: {
      URL: 'https://api.deepseek.com/chat/completions',
      KEY: '',
      MODEL: 'deepseek-chat'
    },
    XAI_API: {
      URL: 'https://api.x.ai/v1/chat/completions',
      KEY: '',
      MODEL: 'grok-3-latest'
    },
    BACKEND_API: {
      BASE_URL: '',
      CALCULATE_ENDPOINT: '/api/v1/calculate'
    },
    DEFAULT_MODE: 'mock'
  };
}

// DeepSeek API地址
const DEEPSEEK_API_URL = apiConfig.DEEPSEEK_API.URL;
const DEEPSEEK_API_KEY = apiConfig.DEEPSEEK_API.KEY;
const DEEPSEEK_MODEL = apiConfig.DEEPSEEK_API.MODEL;

// X.AI API地址
const XAI_API_URL = apiConfig.XAI_API.URL;
const XAI_API_KEY = apiConfig.XAI_API.KEY;
const XAI_MODEL = apiConfig.XAI_API.MODEL;

// 后端API地址
const API_BASE_URL = apiConfig.BACKEND_API.BASE_URL;
const API_CALCULATE_ENDPOINT = apiConfig.BACKEND_API.CALCULATE_ENDPOINT;

// API调用模式
let currentMode = apiConfig.DEFAULT_MODE; // 'direct', 'xai', 'mock'

/**
 * 设置API调用模式
 * @param {String} mode - API调用模式：'direct', 'xai', 'mock'
 */
const setApiMode = (mode) => {
  if (['direct', 'xai', 'mock'].includes(mode)) {
    currentMode = mode;
    console.log(`API模式已切换为: ${mode}`);
    return true;
  }
  console.error(`无效的API模式: ${mode}`);
  return false;
};

/**
 * 获取当前API调用模式
 * @returns {String} - 当前API调用模式
 */
const getApiMode = () => {
  return currentMode;
};

/**
 * 通用请求方法
 */
const request = (url, method, data) => {
  // 如果使用模拟数据，直接返回模拟数据
  if (currentMode === 'mock') {
    return Promise.resolve(getMockData(url, data));
  }
  
  // 检查API基础URL是否配置
  if (!API_BASE_URL || API_BASE_URL === 'https://your-backend-api.com') {
    console.error('后端API地址未配置或无效');
    return Promise.reject({
      code: 400,
      message: '后端API地址未配置，请先配置API地址或切换到其他模式'
    });
  }
  
  console.log(`发送请求到后端API: ${API_BASE_URL}${url}`, data);
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE_URL}${url}`,
      method: method,
      data: data,
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        console.log('后端API响应:', res);
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject({
            code: res.statusCode,
            message: res.data.message || '请求失败'
          });
        }
      },
      fail: (err) => {
        console.error('后端API请求失败:', err);
        reject({
          code: -1,
          message: err.errMsg || '网络错误'
        });
      }
    });
  });
};

/**
 * 直接调用DeepSeek API（仅开发测试使用，生产环境应通过后端调用）
 * 注意：此方法仅供开发阶段测试，实际生产环境中API Key不应暴露在前端代码中
 * @param {String} systemPrompt - 系统提示词
 * @param {String} userPrompt - 用户提示词
 * @returns {Promise} - 返回DeepSeek API响应
 */
const callDeepSeekAPI = (systemPrompt, userPrompt) => {
  // 如果是模拟数据模式，返回模拟数据
  if (currentMode === 'mock') {
    console.log('使用模拟数据代替DeepSeek API调用');
    return Promise.resolve(getMockData(API_CALCULATE_ENDPOINT, { userPrompt }));
  }
  
  // 使用配置文件中的密钥
  const key = DEEPSEEK_API_KEY;
  
  // 如果没有API密钥，拒绝请求
  if (!key || key === 'your_deepseek_api_key_here') {
    return Promise.reject({
      code: 403,
      message: 'API密钥未配置或无效'
    });
  }
  
  console.log('准备调用DeepSeek API...');
  console.log('API URL:', DEEPSEEK_API_URL);
  console.log('API模型:', DEEPSEEK_MODEL);
  console.log('系统提示词长度:', systemPrompt.length);
  console.log('用户提示词长度:', userPrompt.length);
  
  // 检查域名校验
  wx.request({
    url: 'https://www.baidu.com',
    method: 'GET',
    success: () => {
      console.log('网络连接正常');
    },
    fail: (err) => {
      console.error('网络连接测试失败:', err);
    }
  });
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: DEEPSEEK_API_URL,
      method: 'POST',
      data: {
        model: DEEPSEEK_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        stream: false
      },
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      success: (res) => {
        console.log('DeepSeek API响应状态码:', res.statusCode);
        
        if (res.statusCode === 200) {
          try {
            console.log('DeepSeek API响应成功');
            // 解析DeepSeek返回的内容
            const content = res.data.choices[0].message.content;
            console.log('DeepSeek API返回内容:', content);
            
            // 尝试解析为JSON
            try {
              // 移除可能存在的Markdown代码块标记
              let cleanContent = content;
              if (content.includes('```json')) {
                cleanContent = content.replace(/```json\s*|\s*```/g, '');
              } else if (content.includes('```')) {
                cleanContent = content.replace(/```\s*|\s*```/g, '');
              }
              
              // 尝试解析JSON
              const jsonResult = JSON.parse(cleanContent);
              console.log('JSON解析成功:', jsonResult);
              resolve(jsonResult);
            } catch (jsonError) {
              console.error('JSON解析失败，返回原始内容:', jsonError);
              // 如果解析失败，直接返回原始内容
              resolve({
                aiSummary: [content],
                parseError: true
              });
            }
          } catch (error) {
            console.error('处理API响应失败:', error);
            console.error('响应数据:', res.data);
            reject({
              code: -2,
              message: '处理API响应失败: ' + error.message
            });
          }
        } else {
          console.error('DeepSeek API请求失败:', res.statusCode, res.data);
          reject({
            code: res.statusCode,
            message: res.data.error?.message || `请求DeepSeek API失败，状态码: ${res.statusCode}`
          });
        }
      },
      fail: (err) => {
        console.error('DeepSeek API请求网络错误:', err);
        
        // 检查是否是域名校验问题
        if (err.errMsg && err.errMsg.includes('url not in domain list')) {
          reject({
            code: -1,
            message: 'API域名未在微信小程序后台配置，请在开发者工具中关闭域名校验，或在微信公众平台添加合法域名'
          });
        } else {
          reject({
            code: -1,
            message: err.errMsg || '网络错误'
          });
        }
      }
    });
  });
};

/**
 * 调用X.AI API
 * @param {String} systemPrompt - 系统提示词
 * @param {String} userPrompt - 用户提示词
 * @returns {Promise} - 返回X.AI API响应
 */
const callXaiAPI = (systemPrompt, userPrompt) => {
  // 如果是模拟数据模式，返回模拟数据
  if (currentMode === 'mock') {
    console.log('使用模拟数据代替X.AI API调用');
    return Promise.resolve(getMockData(API_CALCULATE_ENDPOINT, { userPrompt }));
  }
  
  // 使用配置文件中的密钥
  const key = XAI_API_KEY;
  
  // 如果没有API密钥，拒绝请求
  if (!key || key === 'your_xai_api_key_here') {
    return Promise.reject({
      code: 403,
      message: 'X.AI API密钥未配置或无效'
    });
  }
  
  console.log('准备调用X.AI API...');
  console.log('API URL:', XAI_API_URL);
  console.log('API模型:', XAI_MODEL);
  console.log('系统提示词长度:', systemPrompt.length);
  console.log('用户提示词长度:', userPrompt.length);
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: XAI_API_URL,
      method: 'POST',
      data: {
        model: XAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        stream: false,
        temperature: 0
      },
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      success: (res) => {
        console.log('X.AI API响应状态码:', res.statusCode);
        
        if (res.statusCode === 200) {
          try {
            console.log('X.AI API响应成功');
            // 解析X.AI返回的内容
            const content = res.data.choices[0].message.content;
            console.log('X.AI API返回内容:', content);
            
            // 尝试解析为JSON
            try {
              // 移除可能存在的Markdown代码块标记
              let cleanContent = content;
              if (content.includes('```json')) {
                cleanContent = content.replace(/```json\s*|\s*```/g, '');
              } else if (content.includes('```')) {
                cleanContent = content.replace(/```\s*|\s*```/g, '');
              }
              
              // 尝试解析JSON
              const jsonResult = JSON.parse(cleanContent);
              console.log('JSON解析成功:', jsonResult);
              resolve(jsonResult);
            } catch (jsonError) {
              console.error('JSON解析失败，返回原始内容:', jsonError);
              // 如果解析失败，直接返回原始内容
              resolve({
                aiSummary: [content],
                parseError: true
              });
            }
          } catch (error) {
            console.error('处理API响应失败:', error);
            console.error('响应数据:', res.data);
            reject({
              code: -2,
              message: '处理API响应失败: ' + error.message
            });
          }
        } else {
          console.error('X.AI API请求失败:', res.statusCode, res.data);
          reject({
            code: res.statusCode,
            message: res.data.error?.message || `请求X.AI API失败，状态码: ${res.statusCode}`
          });
        }
      },
      fail: (err) => {
        console.error('X.AI API请求网络错误:', err);
        
        // 检查是否是域名校验问题
        if (err.errMsg && err.errMsg.includes('url not in domain list')) {
          reject({
            code: -1,
            message: 'API域名未在微信小程序后台配置，请在开发者工具中关闭域名校验，或在微信公众平台添加合法域名'
          });
        } else {
          reject({
            code: -1,
            message: err.errMsg || '网络错误'
          });
        }
      }
    });
  });
};

/**
 * 获取命理分析结果
 * @param {String} birthDate - 出生日期，格式：YYYY-MM-DD
 * @param {String} birthTime - 出生时辰，如：子时、丑时等
 * @param {String} gender - 性别，可选
 * @returns {Promise} - 返回命理分析结果
 */
const getBaziAnalysis = (birthDate, birthTime, gender) => {
  // 构建系统提示词和用户提示词
  const systemPrompt = "你是一位专业的命理分析师，精通八字命理。请根据用户提供的出生信息进行命理分析，并以JSON格式返回结果。";
  
  // 构建用户提示词
  let userPrompt = `请对以下出生信息进行八字命理分析：\n`;
  userPrompt += `出生日期：${birthDate}\n`;
  userPrompt += `出生时辰：${birthTime}\n`;
  if (gender) {
    userPrompt += `性别：${gender}\n`;
  }
  
  userPrompt += `\n请以JSON格式返回分析结果，包含以下字段：\n`;
  userPrompt += `1. lunarDate: 农历日期\n`;
  userPrompt += `2. solarTerm: 当时节气\n`;
  userPrompt += `3. zodiac: 生肖\n`;
  userPrompt += `4. bazi: 八字（包含年、月、日、时的天干地支）\n`;
  userPrompt += `5. wuxing: 五行分布情况（包含金、木、水、火、土的数量）\n`;
  userPrompt += `6. wuxingLack: 五行缺失分析\n`;
  userPrompt += `7. aiSummary: 命理分析摘要（数组形式，每个元素是一段分析文字）\n`;
  
  // 根据当前模式决定调用方式
  switch (currentMode) {
    case 'direct':
      // 直接API模式：调用DeepSeek API
      return callDeepSeekAPI(systemPrompt, userPrompt);
      
    case 'xai':
      // X.AI API模式：调用X.AI API
      return callXaiAPI(systemPrompt, userPrompt);
      
    case 'mock':
    default:
      // 模拟数据模式：返回模拟数据
      console.log('使用模拟数据进行八字分析');
      return Promise.resolve(getMockData(API_CALCULATE_ENDPOINT, {
        birthDate,
        birthTime,
        gender
      }));
  }
};

/**
 * 处理API错误
 * @param {Object} error - 错误对象
 */
const handleApiError = (error) => {
  let message = '网络错误，请稍后重试';
  
  if (error.code === 400) {
    message = '请求参数错误';
  } else if (error.code === 403) {
    message = 'API密钥无效或未配置';
  } else if (error.code === 500) {
    message = '服务器错误，请稍后重试';
  } else if (error.message) {
    message = error.message;
  }
  
  wx.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  });
  
  console.error('API错误:', error);
};

/**
 * 获取模拟数据
 * 开发阶段使用，避免频繁调用API
 */
const getMockData = (url, data) => {
  // 根据不同的API路径返回不同的模拟数据
  if (url.includes('calculate')) {
    return {
      lunarDate: "1995年七月十九（闰月）",
      solarTerm: "立秋",
      bazi: {
        year: "乙亥",
        month: "丙申",
        day: "丁酉",
        hour: "戊午"
      },
      wuxing: {
        金: 2,
        木: 1,
        水: 1,
        火: 3,
        土: 2
      },
      wuxingLack: "五行基本均衡，略缺木，可以多接触大自然",
      zodiac: "猪",
      aiSummary: [
        "你天生聪慧，适合文职工作。",
        "今年事业有贵人相助。",
        "注意饮食健康，防止肠胃问题。",
        "土金较为旺盛，性格坚韧，做事有条理。",
        "木相对较弱，建议多接触植物，在自然环境中放松身心。"
      ]
    };
  }
  
  // 默认返回空对象
  return {};
};

module.exports = {
  getBaziAnalysis,
  handleApiError,
  callDeepSeekAPI,  // 导出直接调用DeepSeek API的方法
  callXaiAPI,       // 导出调用X.AI API的方法
  setApiMode,       // 导出设置API模式的方法
  getApiMode        // 导出获取当前API模式的方法
}; 