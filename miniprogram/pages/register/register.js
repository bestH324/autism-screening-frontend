// 注册页
const app = getApp();
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');

Page({
  data: {
    phone: '', code: '', password: '', passwordConfirm: '',
    agree: false, countdown: 0, loading: false
  },

  onPhoneInput(e) { this.setData({ phone: e.detail.value }); },
  onCodeInput(e) { this.setData({ code: e.detail.value }); },
  onPwdInput(e) { this.setData({ password: e.detail.value }); },
  onPwd2Input(e) { this.setData({ passwordConfirm: e.detail.value }); },
  toggleAgree() { this.setData({ agree: !this.data.agree }); },

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
      if (n <= 0) { clearInterval(this.timer); this.setData({ countdown: 0 }); }
      else { this.setData({ countdown: n }); }
    }, 1000);
  },

  onUnload() { if (this.timer) clearInterval(this.timer); },

  doRegister() {
    const { phone, code, password, passwordConfirm, agree } = this.data;
    if (!util.isValidPhone(phone)) { wx.showToast({ title: '请输入正确的手机号', icon: 'none' }); return; }
    if (!code) { wx.showToast({ title: '请输入验证码', icon: 'none' }); return; }
    if (!password || password.length < 6) { wx.showToast({ title: '密码至少6位', icon: 'none' }); return; }
    if (password !== passwordConfirm) { wx.showToast({ title: '两次密码不一致', icon: 'none' }); return; }
    if (!agree) { wx.showToast({ title: '请先同意服务协议和隐私政策', icon: 'none' }); return; }

    this.setData({ loading: true });
    api.user.register(phone, code, password, passwordConfirm).then(res => {
      app.saveLogin(res.token, { id: res.userId, phone: res.phone, nickname: res.nickname, avatar: res.avatar });
      wx.showToast({ title: '注册成功', icon: 'success' });
      setTimeout(() => wx.switchTab({ url: '/pages/home/home' }), 600);
    }).catch(() => {}).then(() => this.setData({ loading: false }));
  },

  showTerms() {
    wx.showModal({
      title: '用户服务协议',
      content: '1. 本平台提供的筛查服务仅供早期参考，不能替代专业医疗诊断。\n2. 用户应确保提供的儿童信息真实、准确。\n3. 本平台将严格保护用户隐私信息，不会向第三方泄露。\n4. 用户不得利用本平台从事任何违法违规行为。\n5. 本平台保留对服务内容进行修改和调整的权利。',
      showCancel: false, confirmText: '我知道了'
    });
  },

  showPrivacy() {
    wx.showModal({
      title: '隐私政策',
      content: '1. 信息收集：我们仅收集为提供筛查服务所必需的信息，包括手机号、儿童基本信息、筛查答案。\n2. 信息使用：收集的信息仅用于提供筛查评估和生成报告。\n3. 信息存储：您的数据存储在安全的服务器上，采取加密措施保护。\n4. 信息共享：未经您的明确同意，我们不会将您的信息分享给第三方。\n5. 您的权利：您可以随时查看、修改或删除您的个人信息。',
      showCancel: false, confirmText: '我知道了'
    });
  },

  goLogin() { wx.navigateBack({ delta: 1 }); }
});
