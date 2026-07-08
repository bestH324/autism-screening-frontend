// 关于页
Page({
  data: { logoTaps: 0 },

  tapLogo() {
    let n = this.data.logoTaps + 1;
    if (n >= 7) {
      n = 0;
      wx.navigateTo({ url: '/pages/admin-login/admin-login' });
    }
    this.setData({ logoTaps: n });
  }
});
