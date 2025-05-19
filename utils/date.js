/**
 * 格式化日期为YYYY-MM-DD格式
 * @param {Date} date - 日期对象
 * @returns {String} - 格式化后的日期字符串
 */
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * 获取当前日期的字符串表示
 * @returns {String} - 当前日期字符串，格式YYYY-MM-DD
 */
const getCurrentDate = () => {
  return formatDate(new Date());
};

/**
 * 检查日期是否合法
 * @param {String} dateString - 日期字符串，格式YYYY-MM-DD
 * @returns {Boolean} - 是否合法
 */
const isValidDate = (dateString) => {
  const regEx = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateString.match(regEx)) return false;  // 格式不匹配
  
  const d = new Date(dateString);
  const dNum = d.getTime();
  
  if (!dNum && dNum !== 0) return false; // NaN值，无效日期
  
  return d.toISOString().slice(0, 10) === dateString;
};

/**
 * 计算两个日期之间的天数
 * @param {String} startDate - 开始日期，格式YYYY-MM-DD
 * @param {String} endDate - 结束日期，格式YYYY-MM-DD
 * @returns {Number} - 天数差
 */
const daysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // 转换为UTC时间戳并计算差值
  const startUTC = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUTC = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  
  return Math.floor((endUTC - startUTC) / (1000 * 60 * 60 * 24));
};

module.exports = {
  formatDate,
  getCurrentDate,
  isValidDate,
  daysBetween
}; 