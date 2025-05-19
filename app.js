// app.js
App({
  onLaunch: function() {
    // 小程序启动时执行
    console.log('小程序启动');
    
    // 初始化API配置
    try {
      const apiConfig = require('./config/api_config');
      console.log('API配置加载成功');
    } catch (error) {
      console.error('API配置加载失败：', error);
    }
  },
  
  globalData: {
    // 全局数据，可被所有页面访问
    userInfo: null,
    birthDate: null,
    birthTime: null,
    gender: null,
    analysisResult: null
  },
  
  // 全局方法
  saveUserInput: function(birthDate, birthTime, gender) {
    this.globalData.birthDate = birthDate;
    this.globalData.birthTime = birthTime;
    this.globalData.gender = gender;
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