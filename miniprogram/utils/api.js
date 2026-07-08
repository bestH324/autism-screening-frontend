// utils/api.js — HTTP 请求封装 + 全部后端接口
const util = require('./util.js');

let BASE_URL = 'http://localhost:8081';

function setBaseUrl(url) {
  BASE_URL = url.replace(/\/$/, '');
}

// 获取当前登录 token（普通用户 / 管理员）
function getToken() {
  const app = getApp();
  return app && app.globalData ? (app.globalData.token || '') : '';
}

// 核心请求方法，返回 Promise
function request(options) {
  const { url, method = 'GET', data, header = {}, auth = true, isAdmin = false } = options;
  const fullUrl = /^https?:\/\//.test(url) ? url : BASE_URL + url;

  const reqHeader = Object.assign({ 'Content-Type': 'application/json' }, header);
  if (auth) {
    const app = getApp();
    const token = isAdmin ? (app.globalData.adminToken) : (app.globalData.token);
    if (token) reqHeader['X-Token'] = token;
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: fullUrl,
      method: method,
      data: data,
      header: reqHeader,
      timeout: 15000,
      success(res) {
        if (res.statusCode === 200) {
          const body = res.data;
          if (body && typeof body === 'object' && 'code' in body) {
            if (body.code === 0) {
              resolve(body.data);
            } else if (body.code === 401) {
              // 登录过期
              const app = getApp();
              if (isAdmin) app.clearAdminLogin();
              else app.clearLogin();
              wx.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
              reject(body);
            } else {
              wx.showToast({ title: body.message || '请求失败', icon: 'none' });
              reject(body);
            }
          } else {
            // 非标准结构（如 CSV 文件下载），直接返回
            resolve(body);
          }
        } else if (res.statusCode === 401) {
          const app = getApp();
          if (isAdmin) app.clearAdminLogin(); else app.clearLogin();
          wx.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
          reject(res);
        } else {
          wx.showToast({ title: '网络错误(' + res.statusCode + ')', icon: 'none' });
          reject(res);
        }
      },
      fail(err) {
        wx.showToast({ title: '网络连接失败', icon: 'none' });
        reject(err);
      }
    });
  });
}

// ==================== 用户接口 ====================
const userApi = {
  sendCode(phone) {
    return request({ url: '/api/user/send-code', method: 'POST', data: { phone }, auth: false });
  },
  register(phone, code, password, passwordConfirm) {
    return request({ url: '/api/user/register', method: 'POST', data: { phone, code, password, passwordConfirm }, auth: false });
  },
  login(phone, code) {
    return request({ url: '/api/user/login', method: 'POST', data: { phone, code }, auth: false });
  },
  wxLogin(code) {
    return request({ url: '/api/user/wx-login', method: 'POST', data: { code }, auth: false });
  },
  logout() {
    return request({ url: '/api/user/logout', method: 'POST' });
  },
  profile() {
    return request({ url: '/api/user/profile' });
  }
};

// ==================== 儿童接口 ====================
const childApi = {
  list() {
    return request({ url: '/api/child/list' });
  },
  add(child) {
    return request({ url: '/api/child/add', method: 'POST', data: child });
  },
  update(id, child) {
    return request({ url: '/api/child/update/' + id, method: 'PUT', data: child });
  },
  remove(id) {
    return request({ url: '/api/child/' + id, method: 'DELETE' });
  },
  detail(id) {
    return request({ url: '/api/child/' + id });
  }
};

// ==================== 问卷接口 ====================
const questionnaireApi = {
  list() {
    return request({ url: '/api/questionnaire/list', auth: false });
  },
  detail(qid) {
    return request({ url: '/api/questionnaire/' + qid, auth: false });
  },
  default() {
    return request({ url: '/api/questionnaire/default', auth: false });
  }
};

// ==================== 答卷与报告接口 ====================
const answerApi = {
  submit(childId, qid, answers) {
    return request({ url: '/api/answer/submit', method: 'POST', data: { childId, qid, answers } });
  },
  report(id) {
    return request({ url: '/api/answer/report/' + id });
  },
  history() {
    return request({ url: '/api/answer/history' });
  },
  historyDetail(id) {
    return request({ url: '/api/answer/history/' + id });
  }
};

// ==================== 内容接口 ====================
const contentApi = {
  articles(category) {
    const q = category ? ('?category=' + category) : '';
    return request({ url: '/api/article/list' + q, auth: false });
  },
  articleDetail(id) {
    return request({ url: '/api/article/' + id, auth: false });
  },
  institutions(region) {
    const q = region ? ('?region=' + encodeURIComponent(region)) : '';
    return request({ url: '/api/institution/list' + q, auth: false });
  },
  institutionDetail(id) {
    return request({ url: '/api/institution/' + id, auth: false });
  },
  resources() {
    return request({ url: '/api/resource/list', auth: false });
  }
};

// ==================== 管理员接口 ====================
const adminApi = {
  login(username, password) {
    return request({ url: '/api/admin/login', method: 'POST', data: { username, password }, auth: false });
  },
  stats() {
    return request({ url: '/api/admin/stats', isAdmin: true });
  },
  users() {
    return request({ url: '/api/admin/users', isAdmin: true });
  },
  children() {
    return request({ url: '/api/admin/children', isAdmin: true });
  },
  records() {
    return request({ url: '/api/admin/records', isAdmin: true });
  },
  recordDetail(id) {
    return request({ url: '/api/admin/records/' + id, isAdmin: true });
  },
  exportUrl(type) {
    return BASE_URL + '/api/admin/export/' + type + '?token=' + (getApp().globalData.adminToken || '');
  }
};

// 视频完整地址（后端返回 /api/video/q1.mp4 形式）
function videoUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  return BASE_URL + path;
}

module.exports = {
  setBaseUrl,
  request,
  videoUrl,
  user: userApi,
  child: childApi,
  questionnaire: questionnaireApi,
  answer: answerApi,
  content: contentApi,
  admin: adminApi
};
