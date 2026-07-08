// 结果页
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');

Page({
  data: {
    report: null,
    loading: true,
    riskIcon: '✅',
    childAgeText: '',
    createTimeText: ''
  },

  onLoad(options) {
    if (options.id) this.loadReport(options.id);
  },

  loadReport(id) {
    api.answer.report(id).then(report => {
      const riskIcon = report.riskLevel === 'low' ? '✅' : (report.riskLevel === 'medium' ? '⚠️' : '🔴');
      this.setData({
        report,
        riskIcon,
        childAgeText: report.child ? util.getChildAge(report.child.birthDate) : '未知',
        createTimeText: util.formatDateTime(report.createTime),
        loading: false
      });
    }).catch(() => this.setData({ loading: false }));
  },

  goHistory() { wx.navigateTo({ url: '/pages/history/history' }); },
  goReferral() { wx.switchTab({ url: '/pages/referral/referral' }); },

  shareResult() {
    wx.setClipboardData({
      data: '星语·孤独症筛查报告：' + (this.data.report ? this.data.report.riskText : ''),
      success: () => wx.showToast({ title: '报告信息已复制', icon: 'success' })
    });
  },

  sendResultEmail() {
    wx.showModal({
      title: '发送报告到邮箱',
      editable: true,
      placeholderText: '请输入接收报告的邮箱地址',
      success: (res) => {
        if (res.confirm && res.content) {
          wx.showToast({ title: '报告已发送至 ' + res.content, icon: 'none' });
        }
      }
    });
  }
});
