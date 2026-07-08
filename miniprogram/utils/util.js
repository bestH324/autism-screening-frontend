// utils/util.js — 工具函数

// 日期格式化 YYYY-MM-DD
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

// 日期时间格式化 YYYY-MM-DD HH:mm
function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

function pad(n) { return n < 10 ? '0' + n : '' + n; }

// 由出生日期计算月龄
function getAgeInMonths(birthDate) {
  const birth = new Date(birthDate);
  const now = new Date();
  return (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
}

// 友好的年龄显示
function getChildAge(birthDate) {
  if (!birthDate) return '未知';
  const months = getAgeInMonths(birthDate);
  if (months < 0) return '未出生';
  if (months < 12) return months + '个月';
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? (years + '岁' + rem + '个月') : (years + '岁');
}

// 校验手机号
function isValidPhone(phone) {
  return /^1\d{10}$/.test(phone);
}

// 今天的日期字符串（用于 picker max）
function today() {
  return formatDate(new Date());
}

// 防抖
function debounce(fn, wait) {
  let t = null;
  return function () {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, arguments), wait);
  };
}

module.exports = {
  formatDate,
  formatDateTime,
  getAgeInMonths,
  getChildAge,
  isValidPhone,
  today,
  debounce,
  pad
};
