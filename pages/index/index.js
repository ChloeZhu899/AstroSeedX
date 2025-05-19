Page({
  /**
   * 页面的初始数据
   */
  data: {
    logoUrl: '/assets/images/logo.png',
    isLoading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 开始按钮点击事件
   */
  handleStart: function() {
    this.setData({
      isLoading: true
    });
    
    setTimeout(() => {
      this.setData({
        isLoading: false
      });
      wx.navigateTo({
        url: '/pages/input/input'
      });
    }, 300);
  }
}) 