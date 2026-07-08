// 管理员后台页
const app = getApp();
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');

Page({
  data: {
    stats: { totalUsers: 0, totalChildren: 0, totalScreenings: 0, riskDistribution: { high: 0, medium: 0, low: 0 }, ageDistribution: [] },
    barHigh: 0, barMedium: 0, barLow: 0,
    tab: 'users',
    users: [], children: [], records: []
  },

  onLoad() {
    if (!app.globalData.isAdmin) {
      wx.redirectTo({ url: '/pages/admin-login/admin-login' });
      return;
    }
    this.loadStats();
    this.loadList('users');
  },

  loadStats() {
    api.admin.stats().then(s => {
      const stats = s || {};
      const rd = stats.riskDistribution || { high: 0, medium: 0, low: 0 };
      const max = Math.max(rd.high, rd.medium, rd.low, 1);
      // 年龄段百分比
      const ageDist = (stats.ageDistribution || []).map(a => ({
        ...a,
        percent: stats.totalChildren > 0 ? Math.round(a.count / stats.totalChildren * 100) : 0
      }));
      this.setData({
        stats: { ...stats, riskDistribution: rd, ageDistribution: ageDist },
        barHigh: rd.high / max * 100,
        barMedium: rd.medium / max * 100,
        barLow: rd.low / max * 100
      });
    }).catch(() => {});
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ tab });
    this.loadList(tab);
  },

  loadList(tab) {
    if (tab === 'users') {
      api.admin.users().then(list => {
        const users = (list || []).map(u => ({ ...u, createTimeText: util.formatDateTime(u.createTime) }));
        this.setData({ users });
      }).catch(() => {});
    } else if (tab === 'children') {
      api.admin.children().then(list => {
        const children = (list || []).map(c => ({ ...c, ageText: util.getChildAge(c.birthDate) }));
        this.setData({ children });
      }).catch(() => {});
    } else if (tab === 'records') {
      api.admin.records().then(list => {
        const records = (list || []).map(r => ({
          ...r,
          createTimeText: util.formatDateTime(r.createTime),
          childAvatar: r.child ? r.child.avatar : '👶',
          childName: r.child ? r.child.name : '未知'
        }));
        this.setData({ records });
      }).catch(() => {});
    }
  },

  viewRecord(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/result/result?id=' + id });
  },

  exportData() {
    const url = api.admin.exportUrl(this.data.tab);
    wx.showActionSheet({
      itemList: ['在浏览器中打开下载（推荐）', '复制下载链接'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.setClipboardData({
            data: url,
            success: () => wx.showToast({ title: '链接已复制，请在浏览器打开', icon: 'none' })
          });
        } else {
          wx.setClipboardData({
            data: url,
            success: () => wx.showToast({ title: '下载链接已复制', icon: 'success' })
          });
        }
      }
    });
  },

  doLogout() {
    app.clearAdminLogin();
    wx.showToast({ title: '已退出', icon: 'success' });
    setTimeout(() => wx.switchTab({ url: '/pages/home/home' }), 600);
  }
});
