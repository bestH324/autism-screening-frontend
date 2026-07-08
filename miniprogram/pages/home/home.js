// 首页
const app = getApp();

Page({
  data: {},

  onShow() {
    // 刷新登录态显示
  },

  goScreening() {
    wx.switchTab({ url: '/pages/screening/screening' });
  },
  goScience() {
    wx.switchTab({ url: '/pages/science/science' });
  },
  goReferral() {
    wx.switchTab({ url: '/pages/referral/referral' });
  },
  goEmpowerment() {
    wx.navigateTo({ url: '/pages/empowerment/empowerment' });
  },
  goChildManage() {
    if (!app.requireLogin()) return;
    wx.navigateTo({ url: '/pages/child-manage/child-manage' });
  },
  goHistory() {
    if (!app.requireLogin()) return;
    wx.navigateTo({ url: '/pages/history/history' });
  },
  goProfile() {
    wx.switchTab({ url: '/pages/profile/profile' });
  }
});
