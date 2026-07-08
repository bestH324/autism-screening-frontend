// 赋能页
const api = require('../../utils/api.js');

Page({
  data: { list: [], loading: false },

  onShow() {
    this.setData({ loading: true });
    api.content.resources().then(list => {
      this.setData({ list: list || [], loading: false });
    }).catch(() => this.setData({ loading: false }));
  },

  tapItem(e) {
    wx.showToast({ title: e.currentTarget.dataset.title + '——即将上线', icon: 'none' });
  }
});
