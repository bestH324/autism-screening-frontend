// 登录页
const app = getApp();
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');

Page({
  data: {
    phone: '',
    code: '',
    countdown: 0,
    loading: false
  },

  onPhoneInput(e) { this.setData({ phone: e.detail.value }); },
  onCodeInput(e) { this.setData({ code: e.detail.value }); },

  sendCode() {
    const phone = this.data.phone;
    if (!util.isValidPhone(phone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }
    api.user.sendCode(phone).then(() => {
      wx.showToast({ title: '验证码已发送（演示：123456）', icon: 'none' });
      this.startCountdown();
    }).catch(() => {});
  },

  startCountdown() {
    let n = 60;
    this.setData({ countdown: n });
    this.timer = setInterval(() => {
      n--;
      if (n <= 0) {
        clearInterval(this.timer);
        this.setData({ countdown: 0 });
      } else {
        this.setData({ countdown: n });
      }
    }, 1000);
  },

  onUnload() { if (this.timer) clearInterval(this.timer); },

  doLogin() {
    const { phone, code } = this.data;
    if (!phone) { wx.showToast({ title: '请输入手机号', icon: 'none' }); return; }
    if (!code) { wx.showToast({ title: '请输入验证码', icon: 'none' }); return; }
    this.setData({ loading: true });
    api.user.login(phone, code).then(res => {
      app.saveLogin(res.token, { id: res.userId, phone: res.phone, nickname: res.nickname, avatar: res.avatar });
      wx.showToast({ title: '登录成功', icon: 'success' });
      setTimeout(() => wx.switchTab({ url: '/pages/home/home' }), 600);
    }).catch(() => {}).then(() => this.setData({ loading: false }));
  },

  doWechatLogin() {
    this.setData({ loading: true });
    wx.login({
      success: (res) => {
        if (!res.code) {
          wx.showToast({ title: '微信登录失败', icon: 'none' });
          this.setData({ loading: false });
          return;
        }
        api.user.wxLogin(res.code).then(data => {
          app.saveLogin(data.token, { id: data.userId, phone: data.phone, nickname: data.nickname, avatar: data.avatar });
          wx.showToast({ title: '登录成功', icon: 'success' });
          setTimeout(() => wx.switchTab({ url: '/pages/home/home' }), 600);
        }).catch(() => {}).then(() => this.setData({ loading: false }));
      },
      fail: () => {
        this.setData({ loading: false });
        wx.showToast({ title: '微信登录失败', icon: 'none' });
      }
    });
  },

  goRegister() {
    wx.navigateTo({ url: '/pages/register/register' });
  }
});
