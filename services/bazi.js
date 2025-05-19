/**
 * 时辰列表
 */
const SHICHEN_LIST = [
  { label: '子时(23:00-01:00)', value: '子时', desc: '23:00-01:00' },
  { label: '丑时(01:00-03:00)', value: '丑时', desc: '01:00-03:00' },
  { label: '寅时(03:00-05:00)', value: '寅时', desc: '03:00-05:00' },
  { label: '卯时(05:00-07:00)', value: '卯时', desc: '05:00-07:00' },
  { label: '辰时(07:00-09:00)', value: '辰时', desc: '07:00-09:00' },
  { label: '巳时(09:00-11:00)', value: '巳时', desc: '09:00-11:00' },
  { label: '午时(11:00-13:00)', value: '午时', desc: '11:00-13:00' },
  { label: '未时(13:00-15:00)', value: '未时', desc: '13:00-15:00' },
  { label: '申时(15:00-17:00)', value: '申时', desc: '15:00-17:00' },
  { label: '酉时(17:00-19:00)', value: '酉时', desc: '17:00-19:00' },
  { label: '戌时(19:00-21:00)', value: '戌时', desc: '19:00-21:00' },
  { label: '亥时(21:00-23:00)', value: '亥时', desc: '21:00-23:00' }
];

/**
 * 根据时间获取对应的时辰
 * @param {Date} date - 日期对象
 * @returns {String} - 时辰
 */
const getShichen = (date) => {
  const hour = date.getHours();
  
  if (hour >= 23 || hour < 1) return '子时';
  if (hour >= 1 && hour < 3) return '丑时';
  if (hour >= 3 && hour < 5) return '寅时';
  if (hour >= 5 && hour < 7) return '卯时';
  if (hour >= 7 && hour < 9) return '辰时';
  if (hour >= 9 && hour < 11) return '巳时';
  if (hour >= 11 && hour < 13) return '午时';
  if (hour >= 13 && hour < 15) return '未时';
  if (hour >= 15 && hour < 17) return '申时';
  if (hour >= 17 && hour < 19) return '酉时';
  if (hour >= 19 && hour < 21) return '戌时';
  if (hour >= 21 && hour < 23) return '亥时';
  
  return '子时'; // 默认返回
};

/**
 * 格式化分析结果中的五行数据
 * @param {Object} wuxing - 五行数据对象
 * @returns {Array} - 格式化后的五行数组
 */
const formatWuxingData = (wuxing) => {
  return Object.keys(wuxing).map(key => {
    return {
      name: key,
      value: wuxing[key]
    };
  });
};

/**
 * 格式化八字数据为显示格式
 * @param {Object} bazi - 八字数据对象
 * @returns {String} - 格式化后的八字字符串
 */
const formatBazi = (bazi) => {
  return `${bazi.year} ${bazi.month} ${bazi.day} ${bazi.hour}`;
};

module.exports = {
  SHICHEN_LIST,
  getShichen,
  formatWuxingData,
  formatBazi
}; 