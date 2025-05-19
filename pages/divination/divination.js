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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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
    
    // 后续可以跳转到对应的占卜页面
    // wx.navigateTo({
    //   url: `/pages/divination/${id}/${id}`
    // });
  },

  /**
   * 返回结果页
   */
  goBackToResult: function() {
    wx.navigateBack();
  }
}) 