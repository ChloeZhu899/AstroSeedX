Component({
  /**
   * 组件的属性列表
   */
  properties: {
    wuxingData: {
      type: Object,
      value: {
        金: 0,
        木: 0,
        水: 0,
        火: 0,
        土: 0
      },
      observer: function(newVal) {
        console.log('chart组件收到wuxingData:', newVal);
        
        // 创建英文属性名版本
        const wuxingDataEn = {
          jin: Number(newVal.金 || 0),
          mu: Number(newVal.木 || 0),
          shui: Number(newVal.水 || 0),
          huo: Number(newVal.火 || 0),
          tu: Number(newVal.土 || 0)
        };
        
        // 检查是否有英文属性名（对于XAI模式）
        if (newVal.metal !== undefined) {
          wuxingDataEn.jin = Number(newVal.metal || 0);
          wuxingDataEn.mu = Number(newVal.wood || 0);
          wuxingDataEn.shui = Number(newVal.water || 0);
          wuxingDataEn.huo = Number(newVal.fire || 0);
          wuxingDataEn.tu = Number(newVal.earth || 0);
        }
        
        // 检查是否所有值都为0
        const allZero = [wuxingDataEn.jin, wuxingDataEn.mu, wuxingDataEn.shui, wuxingDataEn.huo, wuxingDataEn.tu].every(val => val === 0);
        
        if (allZero) {
          console.log('检测到五行数据全为0，将使用默认值');
          this.setData({
            useDefaultData: true,
            wuxingDataEn: {
              jin: 2,
              mu: 1,
              shui: 1,
              huo: 3,
              tu: 2
            }
          });
        } else {
          this.setData({
            useDefaultData: false,
            wuxingDataEn: wuxingDataEn
          });
        }
        
        console.log('设置柱状图数据:', this.data.wuxingDataEn);
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    useDefaultData: false, // 是否使用默认数据
    wuxingDataEn: {
      jin: 0,
      mu: 0,
      shui: 0,
      huo: 0,
      tu: 0
    },
    // 基础高度和最大高度设置
    baseHeight: 20,
    maxHeight: 150
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached: function() {
      console.log('chart组件attached');
    },
    ready: function() {
      console.log('chart组件ready');
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 计算柱子高度
    getBarHeight: function(jin, mu, shui, huo, tu, element) {
      // 找出最大值
      const maxValue = Math.max(jin, mu, shui, huo, tu);
      
      // 如果最大值为0，返回基础高度
      if (maxValue <= 0) {
        return this.data.baseHeight;
      }
      
      // 获取当前元素的值
      let value;
      switch (element) {
        case '金':
          value = jin;
          break;
        case '木':
          value = mu;
          break;
        case '水':
          value = shui;
          break;
        case '火':
          value = huo;
          break;
        case '土':
          value = tu;
          break;
        default:
          value = 0;
      }
      
      // 计算高度比例，但确保即使是0也有一个基础高度
      if (value <= 0) {
        return this.data.baseHeight;
      } else {
        // 最小高度 + 比例高度
        return this.data.baseHeight + Math.floor((this.data.maxHeight - this.data.baseHeight) * value / maxValue);
      }
    },

    // 显示文本提示，方便调试
    showDebugToast: function(msg) {
      wx.showToast({
        title: msg,
        icon: 'none',
        duration: 2000
      });
    }
  }
}) 