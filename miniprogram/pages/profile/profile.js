// 个人中心页
const app = getApp();

Page({
  data: {
    isLoggedIn: false,
    name: '',
    phone: ''
  },

  onShow() {
    const isLoggedIn = !!app.globalData.token;
    const u = app.globalData.userInfo || {};
    this.setData({
      isLoggedIn,
      name: isLoggedIn ? (u.nickname || ('用户' + String(u.phone || '').slice(-4))) : '未登录',
      phone: isLoggedIn ? (u.phone || '') : '点击登录'
    });
  },

  tapHeader() {
    if (!this.data.isLoggedIn) wx.navigateTo({ url: '/pages/login/login' });
  },

  goChildManage() {
    if (!app.requireLogin()) return;
    wx.navigateTo({ url: '/pages/child-manage/child-manage' });
  },
  goHistory() {
    if (!app.requireLogin()) return;
    wx.navigateTo({ url: '/pages/history/history' });
  },
  goAbout() { wx.navigateTo({ url: '/pages/about/about' }); },

  showPrivacy() {
    wx.showModal({
      title: '隐私政策',
      content: '1. 信息收集：我们仅收集为提供筛查服务所必需的信息，包括手机号、儿童基本信息、筛查答案。\n2. 信息使用：收集的信息仅用于提供筛查评估和生成报告。\n3. 信息存储：您的数据存储在安全的服务器上，采取加密措施保护。\n4. 信息共享：未经您的明确同意，我们不会将您的信息分享给第三方。\n5. 您的权利：您可以随时查看、修改或删除您的个人信息。',
      showCancel: false, confirmText: '我知道了'
    });
  },

  doLogout() {
    wx.showModal({
      title: '提示', content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.clearLogin();
          wx.showToast({ title: '已退出登录', icon: 'success' });
          this.setData({ isLoggedIn: false, name: '未登录', phone: '点击登录' });
        }
      }
    });
  }
});
