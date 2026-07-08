// 管理员登录页
const app = getApp();
const api = require('../../utils/api.js');

Page({
  data: { username: '', password: '', loading: false },

  onUserInput(e) { this.setData({ username: e.detail.value }); },
  onPwdInput(e) { this.setData({ password: e.detail.value }); },

  doLogin() {
    const { username, password } = this.data;
    if (!username || !password) { wx.showToast({ title: '请输入账号和密码', icon: 'none' }); return; }
    this.setData({ loading: true });
    api.admin.login(username, password).then(res => {
      app.saveAdminLogin(res.token);
      wx.showToast({ title: '登录成功', icon: 'success' });
      setTimeout(() => wx.redirectTo({ url: '/pages/admin-dashboard/admin-dashboard' }), 600);
    }).catch(() => {}).then(() => this.setData({ loading: false }));
  }
});
