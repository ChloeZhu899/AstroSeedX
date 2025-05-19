// pages/input/input.js
const dateUtils = require('../../utils/date');
const baziService = require('../../services/bazi');
const apiService = require('../../services/api');

// 导入API配置
let apiConfig;
try {
  apiConfig = require('../../config/api_config');
} catch (error) {
  console.error('无法加载API配置文件:', error);
  // 使用默认配置
  apiConfig = {
    DEFAULT_MODE: 'mock'
  };
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    birthDate: dateUtils.getCurrentDate(),
    birthTime: '子时',
    birthTimeIndex: 0, // 添加时辰索引
    gender: '',
    shichenList: baziService.SHICHEN_LIST,
    isLoading: false,
    apiMode: 'mock',  // 默认使用模拟数据模式
    apiModeLabel: '',  // API模式显示文本
    apiModeOptions: [
      { value: 'direct', label: '直接API模式（DeepSeek）' },
      { value: 'xai', label: 'X.AI API模式（Grok）' },
      { value: 'mock', label: '模拟数据模式（离线开发）' }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取当前时间对应的时辰
    const now = new Date();
    const currentShichen = baziService.getShichen(now);
    
    // 获取当前API模式
    let currentMode = 'mock'; // 默认使用模拟数据模式
    try {
      currentMode = apiService.getApiMode();
    } catch (error) {
      console.error('获取API模式失败:', error);
    }
    
    // 获取API模式显示文本
    const apiModeLabel = this.getApiModeLabel(currentMode);
    
    // 找到当前时辰在列表中的索引
    let birthTimeIndex = 0;
    const { shichenList } = this.data;
    for (let i = 0; i < shichenList.length; i++) {
      if (shichenList[i].value === currentShichen) {
        birthTimeIndex = i;
        break;
      }
    }
    
    this.setData({
      birthTime: currentShichen,
      birthTimeIndex: birthTimeIndex,
      apiMode: currentMode,
      apiModeLabel: apiModeLabel
    });
  },
  
  /**
   * 获取API模式显示文本
   */
  getApiModeLabel: function(mode) {
    const { apiModeOptions } = this.data;
    for (let i = 0; i < apiModeOptions.length; i++) {
      if (apiModeOptions[i].value === mode) {
        return apiModeOptions[i].label;
      }
    }
    return '未知模式';
  },

  /**
   * 日期选择器改变事件
   */
  bindDateChange: function(e) {
    this.setData({
      birthDate: e.detail.value
    });
  },

  /**
   * 性别选择器改变事件
   */
  bindGenderChange: function(e) {
    const genders = ['男', '女'];
    this.setData({
      gender: genders[e.detail.value]
    });
  },

  /**
   * 时辰选择器改变事件
   */
  bindShichenChange: function(e) {
    const index = e.detail.value;
    const { shichenList } = this.data;
    
    this.setData({
      birthTimeIndex: index,
      birthTime: shichenList[index].value
    });
  },

  /**
   * 兼容旧的时辰选择器点击事件（已废弃，使用bindShichenChange代替）
   */
  showShichenPicker: function() {
    console.log('showShichenPicker方法已废弃，请使用bindShichenChange代替');
    // 不做任何操作，仅用于兼容
  },

  /**
   * API模式选择器改变事件
   */
  bindApiModeChange: function(e) {
    const { apiModeOptions } = this.data;
    const selectedMode = apiModeOptions[e.detail.value].value;
    const selectedLabel = apiModeOptions[e.detail.value].label;
    
    // 如果选择直接API模式或X.AI API模式，提示关闭域名校验
    if (selectedMode === 'direct' || selectedMode === 'xai') {
      wx.showModal({
        title: '域名校验提示',
        content: '直接API模式需要关闭域名校验。请在微信开发者工具中点击右上角"详情"→"本地设置"→勾选"不校验合法域名..."选项。',
        showCancel: false,
        confirmText: '我知道了'
      });
    }
    
    // 设置API模式
    apiService.setApiMode(selectedMode);
    
    this.setData({
      apiMode: selectedMode,
      apiModeLabel: selectedLabel
    });
    
    // 提示用户
    let message = '';
    switch(selectedMode) {
      case 'direct':
        message = '已切换到DeepSeek API模式';
        break;
      case 'xai':
        message = '已切换到X.AI API模式';
        break;
      case 'mock':
        message = '已切换到模拟数据模式，将使用模拟数据进行开发测试';
        break;
    }
    
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 提交表单
   */
  handleSubmit: function() {
    const { birthDate, birthTime, gender, apiMode } = this.data;
    
    // 表单验证
    if (!dateUtils.isValidDate(birthDate)) {
      wx.showToast({
        title: '请选择有效的出生日期',
        icon: 'none'
      });
      return;
    }
    
    // 验证性别必填
    if (!gender) {
      wx.showToast({
        title: '请选择性别',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      isLoading: true
    });
    
    // 保存到全局数据
    const app = getApp();
    app.saveUserInput(birthDate, birthTime, gender);
    
    // 如果是直接API模式或X.AI API模式，直接调用API
    if (apiMode === 'direct' || apiMode === 'xai') {
      console.log(`${apiMode === 'direct' ? 'DeepSeek' : 'X.AI'} API模式，调用API`);
      console.log('出生信息:', birthDate, birthTime, gender);
      
      // 显示加载提示
      wx.showLoading({
        title: '正在分析中...',
        mask: true
      });
      
      apiService.getBaziAnalysis(birthDate, birthTime, gender)
        .then(result => {
          console.log('API调用成功:', result);
          
          // 隐藏加载提示
          wx.hideLoading();
          
          // 保存结果到全局数据
          app.saveAnalysisResult(result);
          
          this.setData({
            isLoading: false
          });
          
          // 跳转到结果页
          wx.navigateTo({
            url: '/pages/result/result',
            fail: (err) => {
              console.error('页面跳转失败:', err);
              wx.showToast({
                title: '页面跳转失败',
                icon: 'none'
              });
            }
          });
        })
        .catch(error => {
          console.error('API调用失败:', error);
          
          // 隐藏加载提示
          wx.hideLoading();
          
          this.setData({
            isLoading: false
          });
          
          // 显示错误信息
          wx.showModal({
            title: 'API调用失败',
            content: error.message || '请检查网络连接是否正常',
            showCancel: false
          });
          
          apiService.handleApiError(error);
        });
      
      return;
    }
    
    // 否则，跳转到结果页，由结果页调用API
    setTimeout(() => {
      this.setData({
        isLoading: false
      });
      
      wx.navigateTo({
        url: '/pages/result/result',
        fail: (err) => {
          console.error('页面跳转失败:', err);
          wx.showToast({
            title: '页面跳转失败',
            icon: 'none'
          });
        }
      });
    }, 500);
  }
}) 