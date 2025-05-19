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
    error: null,
    rawResult: null, // 添加原始结果字段，用于调试
    wuxingString: '',
    wuxingObj: {}, // 新增，传递给chart组件
    wuxingEn: {}, // 新增，英文属性名版本
    debugMode: true, // 调试模式，显示更多信息
    birthDate: '', // 阳历日期
    birthTimeStr: '' // 时辰字符串
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取全局数据
    const app = getApp();
    const { birthDate, birthTime } = app.globalData;
    
    // 保存阳历日期和时辰到data中
    let birthTimeStr = birthTime;
    if (birthTime) {
      // 如果需要，可以在这里将时辰代码转换为更友好的显示格式
      const timeMap = {
        '子': '子时 (23:00-01:00)',
        '丑': '丑时 (01:00-03:00)',
        '寅': '寅时 (03:00-05:00)',
        '卯': '卯时 (05:00-07:00)',
        '辰': '辰时 (07:00-09:00)',
        '巳': '巳时 (09:00-11:00)',
        '午': '午时 (11:00-13:00)',
        '未': '未时 (13:00-15:00)',
        '申': '申时 (15:00-17:00)',
        '酉': '酉时 (17:00-19:00)',
        '戌': '戌时 (19:00-21:00)',
        '亥': '亥时 (21:00-23:00)'
      };
      birthTimeStr = timeMap[birthTime] || birthTime;
    }
    
    this.setData({
      birthDate: birthDate || '',
      birthTimeStr: birthTimeStr || ''
    });
    
    // 如果已经有分析结果，直接显示
    if (app.globalData.analysisResult) {
      try {
        let result = app.globalData.analysisResult;
        
        // 检查结果是否为字符串（可能是JSON字符串）
        if (typeof result === 'string') {
          try {
            result = JSON.parse(result);
            console.log('解析JSON字符串成功');
          } catch (e) {
            console.error('解析JSON字符串失败:', e);
          }
        }
        
        console.log('处理分析结果:', result);
        
        // 格式化结果
        const formattedResult = formatUtil.formatAnalysisResult(result);
        const baziString = this.formatBazi(formattedResult.bazi);
        const wuxingObj = this.formatWuxingObj(formattedResult.wuxing);
        const wuxingString = this.formatWuxingString(wuxingObj);
        // 创建英文属性名版本
        const wuxingEn = this.createWuxingEn(wuxingObj);
        
        console.log('格式化后的八字:', baziString);
        console.log('格式化后的五行:', wuxingObj);
        console.log('英文版五行:', wuxingEn);
        
        this.setData({
          isLoading: false,
          result: formattedResult,
          baziString: baziString,
          wuxingString: wuxingString,
          wuxingObj: wuxingObj,
          wuxingEn: wuxingEn,
          rawResult: JSON.stringify(result, null, 2) // 保存原始结果，用于调试
        });
      } catch (error) {
        console.error('处理分析结果失败:', error);
        this.setData({
          isLoading: false,
          error: '处理分析结果失败，请重试',
          rawResult: app.globalData.analysisResult ? JSON.stringify(app.globalData.analysisResult, null, 2) : '无数据'
        });
      }
    } else {
      // 否则，调用API获取分析结果
      this.fetchAnalysisResult();
    }
  },

  /**
   * 获取分析结果
   */
  fetchAnalysisResult: function() {
    const app = getApp();
    const { birthDate, birthTime, gender } = app.globalData;
    
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
    
    // 获取当前API模式
    let currentMode = 'mock'; // 默认使用模拟数据模式
    try {
      currentMode = apiService.getApiMode();
      console.log('当前API模式:', currentMode);
    } catch (error) {
      console.error('获取API模式失败:', error);
    }
    
    // 调用API获取分析结果
    apiService.getBaziAnalysis(birthDate, birthTime, gender)
      .then(result => {
        try {
          // 检查结果是否为字符串（可能是JSON字符串）
          if (typeof result === 'string') {
            try {
              result = JSON.parse(result);
              console.log('解析JSON字符串成功');
            } catch (e) {
              console.error('解析JSON字符串失败:', e);
            }
          }
          
          console.log('API返回的原始结果:', result);
          
          // 格式化结果
          const formattedResult = formatUtil.formatAnalysisResult(result);
          const baziString = this.formatBazi(formattedResult.bazi);
          const wuxingObj = this.formatWuxingObj(formattedResult.wuxing);
          const wuxingString = this.formatWuxingString(wuxingObj);
          // 创建英文属性名版本
          const wuxingEn = this.createWuxingEn(wuxingObj);
          
          console.log('格式化后的八字:', baziString);
          console.log('格式化后的五行:', wuxingObj);
          console.log('英文版五行:', wuxingEn);
          
          // 保存到全局数据
          app.saveAnalysisResult(formattedResult);
          
          this.setData({
            isLoading: false,
            result: formattedResult,
            baziString: baziString,
            wuxingString: wuxingString,
            wuxingObj: wuxingObj,
            wuxingEn: wuxingEn,
            rawResult: JSON.stringify(result, null, 2) // 保存原始结果，用于调试
          });
          
          // 如果是模拟数据模式，提示用户
          if (currentMode === 'mock') {
            wx.showToast({
              title: '当前使用模拟数据，非真实分析结果',
              icon: 'none',
              duration: 3000
            });
          }
        } catch (error) {
          console.error('处理分析结果失败:', error);
          this.setData({
            isLoading: false,
            error: '处理分析结果失败，请重试',
            rawResult: result ? JSON.stringify(result, null, 2) : '无数据'
          });
        }
      })
      .catch(error => {
        console.error('获取分析结果失败:', error);
        
        this.setData({
          isLoading: false,
          error: '获取分析结果失败，请重试'
        });
        
        apiService.handleApiError(error);
      });
  },

  /**
   * 重新分析按钮点击事件
   */
  handleReanalyze: function() {
    wx.navigateBack();
  },

  /**
   * 查看更多占卜点击事件
   */
  handleMoreDivination: function() {
    wx.navigateTo({
      url: '/pages/divination/divination'
    });
  },

  // 八字格式化，兼容X.AI和DeepSeek
  formatBazi(bazi) {
    console.log('原始八字数据:', bazi);
    
    if (!bazi) return '';
    
    // 兼容X.AI返回的结构
    if (bazi.year && bazi.month && bazi.day && bazi.hour) {
      // 处理每个柱
      const getStr = (pillar) => {
        if (typeof pillar === 'string') return pillar;
        if (pillar.heavenlyStem && pillar.earthlyBranch) {
          return `${pillar.heavenlyStem}${pillar.earthlyBranch}`;
        }
        if (pillar.stem && pillar.branch) {
          return `${pillar.stem}${pillar.branch}`;
        }
        return '';
      };
      
      const result = `${getStr(bazi.year)} ${getStr(bazi.month)} ${getStr(bazi.day)} ${getStr(bazi.hour)}`;
      console.log('处理对象格式八字结果:', result);
      return result;
    }
    
    // 兼容数组
    if (Array.isArray(bazi)) {
      const result = bazi.join(' ');
      console.log('处理数组格式八字结果:', result);
      return result;
    }
    
    // 兼容字符串
    if (typeof bazi === 'string') {
      console.log('八字已是字符串格式:', bazi);
      return bazi;
    }
    
    console.log('无法识别的八字格式');
    return '';
  },

  // 五行对象兼容中英文
  formatWuxingObj(wuxing) {
    console.log('原始五行数据:', wuxing);
    
    // 获取当前API模式
    let currentMode = 'mock';
    try {
      currentMode = apiService.getApiMode();
      console.log('当前API模式:', currentMode);
    } catch (error) {
      console.error('获取API模式失败:', error);
    }
    
    if (!wuxing) {
      console.log('无五行数据，使用默认值');
      // 只在模拟模式下使用默认非零值
      if (currentMode === 'mock') {
        return { 金: 2, 木: 1, 水: 1, 火: 3, 土: 2 };
      } else {
        return { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
      }
    }
    
    // 处理API返回数据 - 不再转换，直接使用API原始值
    console.log('API返回五行数据(XAI):', wuxing);
    
    // XAI模式下，直接映射英文属性到中文
    if (currentMode === 'xai' && wuxing.metal !== undefined) {
      const result = {
        金: Number(wuxing.metal || 0),
        木: Number(wuxing.wood || 0),
        水: Number(wuxing.water || 0),
        火: Number(wuxing.fire || 0),
        土: Number(wuxing.earth || 0)
      };
      console.log('XAI模式，处理后的五行数据:', result);
      return result;
    } 
    // 其他模式或中文属性情况
    else {
      const result = {
        金: wuxing.金 !== undefined ? Number(wuxing.金) : (wuxing.metal !== undefined ? Number(wuxing.metal) : 0),
        木: wuxing.木 !== undefined ? Number(wuxing.木) : (wuxing.wood !== undefined ? Number(wuxing.wood) : 0),
        水: wuxing.水 !== undefined ? Number(wuxing.水) : (wuxing.water !== undefined ? Number(wuxing.water) : 0),
        火: wuxing.火 !== undefined ? Number(wuxing.火) : (wuxing.fire !== undefined ? Number(wuxing.fire) : 0),
        土: wuxing.土 !== undefined ? Number(wuxing.土) : (wuxing.earth !== undefined ? Number(wuxing.earth) : 0)
      };
      
      // 检查是否所有值都为0
      const allZero = [result.金, result.木, result.水, result.火, result.土].every(val => val === 0);
      
      // 只有在mock模式且所有值为0时使用默认值
      if (currentMode === 'mock' && allZero) {
        console.log('Mock模式且数据全为0，使用默认值');
        return {
          金: 2,
          木: 1,
          水: 1,
          火: 3,
          土: 2
        };
      }
      
      console.log('处理后的五行数据:', result);
      return result;
    }
  },

  // 五行字符串展示
  formatWuxingString(wuxing) {
    if (!wuxing) return '';
    return `金:${wuxing.金} 木:${wuxing.木} 水:${wuxing.水} 火:${wuxing.火} 土:${wuxing.土}`;
  },
  
  // 创建英文属性名版本的五行数据
  createWuxingEn(wuxing) {
    if (!wuxing) return { jin: 0, mu: 0, shui: 0, huo: 0, tu: 0 };
    
    return {
      jin: Number(wuxing.金 || 0),
      mu: Number(wuxing.木 || 0),
      shui: Number(wuxing.水 || 0),
      huo: Number(wuxing.火 || 0),
      tu: Number(wuxing.土 || 0)
    };
  }
}) 