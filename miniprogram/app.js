// app.js — 星语 · 全局逻辑
const api = require('./utils/api.js');

App({
  globalData: {
    token: '',
    userInfo: null,
    adminToken: '',
    isAdmin: false
  },

  onLaunch() {
    // 恢复登录态
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    const adminToken = wx.getStorageSync('adminToken');
    if (token) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo || null;
    }
    if (adminToken) {
      this.globalData.adminToken = adminToken;
      this.globalData.isAdmin = true;
    }
    // 设置 API 基址
    api.setBaseUrl('http://localhost:8081');
  },

  // 保存用户登录信息
  saveLogin(token, userInfo) {
    this.globalData.token = token;
    this.globalData.userInfo = userInfo;
    wx.setStorageSync('token', token);
    wx.setStorageSync('userInfo', userInfo);
  },

  // 退出登录
  clearLogin() {
    this.globalData.token = '';
    this.globalData.userInfo = null;
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
  },

  // 保存管理员登录
  saveAdminLogin(token) {
    this.globalData.adminToken = token;
    this.globalData.isAdmin = true;
    wx.setStorageSync('adminToken', token);
  },

  clearAdminLogin() {
    this.globalData.adminToken = '';
    this.globalData.isAdmin = false;
    wx.removeStorageSync('adminToken');
  },

  // 判断是否登录，未登录则跳转登录页
  requireLogin() {
    if (!this.globalData.token) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      setTimeout(() => wx.navigateTo({ url: '/pages/login/login' }), 600);
      return false;
    }
    return true;
  }
});
