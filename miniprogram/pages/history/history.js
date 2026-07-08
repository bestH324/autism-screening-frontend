// 历史记录页
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');

Page({
  data: { list: [], loading: true },

  onShow() { this.loadHistory(); },

  loadHistory() {
    api.answer.history().then(list => {
      const data = (list || []).map(r => ({
        ...r,
        createTimeText: util.formatDateTime(r.createTime),
        childAvatar: r.child ? r.child.avatar : '👶',
        childName: r.child ? r.child.name : '未知'
      }));
      this.setData({ list: data, loading: false });
    }).catch(() => this.setData({ loading: false }));
  },

  viewDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/result/result?id=' + id });
  },

  goScreening() { wx.switchTab({ url: '/pages/screening/screening' }); }
});
