// 儿童管理页
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');

Page({
  data: {
    children: [],
    formVisible: false,
    editingId: null,
    saving: false,
    today: util.today(),
    minDate: '',  // 计算得到：5年前
    avatarList: ['👶', '👦', '👧', '🧒', '🐻', '🐰'],
    form: { name: '', gender: '', birthDate: '', avatar: '👶' }
  },

  onLoad() {
    // 1-5岁范围
    const now = new Date();
    const y5 = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
    this.setData({ minDate: util.formatDate(y5) });
  },

  onShow() { this.loadChildren(); },

  loadChildren() {
    api.child.list().then(list => {
      const children = (list || []).map(c => ({
        ...c,
        ageText: util.getChildAge(c.birthDate),
        birthText: util.formatDate(c.birthDate)
      }));
      this.setData({ children });
    }).catch(() => {});
  },

  showAddForm() {
    this.setData({
      formVisible: true,
      editingId: null,
      form: { name: '', gender: '', birthDate: '', avatar: '👶' }
    });
  },

  hideForm() { this.setData({ formVisible: false }); },
  noop() {},

  onNameInput(e) { this.setData({ 'form.name': e.detail.value }); },

  selectGender(e) { this.setData({ 'form.gender': e.currentTarget.dataset.gender }); },

  onBirthChange(e) { this.setData({ 'form.birthDate': e.detail.value }); },

  selectAvatar(e) { this.setData({ 'form.avatar': e.currentTarget.dataset.avatar }); },

  saveChild() {
    const { name, gender, birthDate, avatar } = this.data.form;
    if (!name) { wx.showToast({ title: '请输入宝宝昵称', icon: 'none' }); return; }
    if (!gender) { wx.showToast({ title: '请选择性别', icon: 'none' }); return; }
    if (!birthDate) { wx.showToast({ title: '请选择出生日期', icon: 'none' }); return; }

    const age = util.getAgeInMonths(birthDate);
    if (age < 12 || age > 60) {
      wx.showToast({ title: '本筛查适用于1-5岁（12-60个月）的儿童', icon: 'none' });
      return;
    }

    this.setData({ saving: true });
    const payload = { name, gender, birthDate, avatar };
    const editingId = this.data.editingId;
    const action = editingId ? api.child.update(editingId, payload) : api.child.add(payload);
    action.then(() => {
      wx.showToast({ title: editingId ? '已更新' : '已添加', icon: 'success' });
      this.setData({ formVisible: false, editingId: null });
      this.loadChildren();
    }).catch(() => {}).then(() => this.setData({ saving: false }));
  },

  editChild(e) {
    const id = e.currentTarget.dataset.id;
    const child = this.data.children.find(c => c.id === id);
    if (!child) return;
    this.setData({
      formVisible: true,
      editingId: id,
      form: { name: child.name, gender: child.gender, birthDate: child.birthDate, avatar: child.avatar || '👶' }
    });
  },

  deleteChild(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该宝宝的信息吗？相关的筛查记录也会被删除。',
      confirmColor: '#E74C3C',
      success: (res) => {
        if (res.confirm) {
          api.child.remove(id).then(() => {
            wx.showToast({ title: '已删除', icon: 'success' });
            this.loadChildren();
          }).catch(() => {});
        }
      }
    });
  },

  // 选中儿童直接去筛查
  selectForScreening(e) {
    const id = e.currentTarget.dataset.id;
    wx.switchTab({
      url: '/pages/screening/screening'
    });
    // 通过全局暂存选中的儿童 id
    getApp().globalData.preSelectChildId = id;
  }
});
