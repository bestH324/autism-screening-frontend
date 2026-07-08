// 转诊页
const api = require('../../utils/api.js');

Page({
  data: { regions: [], instMap: {}, loading: false },

  onShow() { this.loadInstitutions(); },

  loadInstitutions() {
    this.setData({ loading: true });
    api.content.institutions().then(list => {
      const instMap = {};
      (list || []).forEach(inst => {
        const r = inst.region || '其他';
        if (!instMap[r]) instMap[r] = [];
        instMap[r].push(inst);
      });
      this.setData({ regions: Object.keys(instMap), instMap, loading: false });
    }).catch(() => this.setData({ loading: false }));
  },

  callPhone(e) {
    const phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({ phoneNumber: phone }).catch(() => {});
  }
});
