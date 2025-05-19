/**
 * 格式化分析结果，确保所有字段都存在
 * @param {Object} result - API返回的分析结果
 * @returns {Object} - 格式化后的结果
 */
const formatAnalysisResult = (result) => {
  // 默认值
  const defaultResult = {
    lunarDate: '',
    solarTerm: '',
    bazi: {
      year: '',
      month: '',
      day: '',
      hour: ''
    },
    wuxing: {
      金: 0,
      木: 0,
      水: 0,
      火: 0,
      土: 0
    },
    wuxingLack: '',
    zodiac: '',
    aiSummary: []
  };
  
  // 合并结果，确保所有字段都存在
  return {
    ...defaultResult,
    ...result,
    bazi: {
      ...defaultResult.bazi,
      ...(result.bazi || {})
    },
    wuxing: {
      ...defaultResult.wuxing,
      ...(result.wuxing || {})
    }
  };
};

/**
 * 格式化八字为易读格式
 * @param {Object} bazi - 八字对象
 * @returns {String} - 格式化后的八字字符串
 */
const formatBaziString = (bazi) => {
  if (!bazi) return '';
  return `${bazi.year || ''} ${bazi.month || ''} ${bazi.day || ''} ${bazi.hour || ''}`;
};

/**
 * 格式化五行数据为图表需要的格式
 * @param {Object} wuxing - 五行数据
 * @returns {Array} - 图表数据数组
 */
const formatWuxingForChart = (wuxing) => {
  if (!wuxing) return [];
  
  return Object.keys(wuxing).map(key => ({
    name: key,
    value: wuxing[key] || 0
  }));
};

/**
 * 格式化AI摘要为HTML格式
 * @param {Array} aiSummary - AI摘要数组
 * @returns {String} - HTML格式的摘要
 */
const formatAiSummaryToHtml = (aiSummary) => {
  if (!aiSummary || !aiSummary.length) return '';
  
  return aiSummary.map(item => `<p>${item}</p>`).join('');
};

module.exports = {
  formatAnalysisResult,
  formatBaziString,
  formatWuxingForChart,
  formatAiSummaryToHtml
}; 