// 筛查页
const app = getApp();
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');

Page({
  data: {
    started: false,
    children: [],
    childrenRange: [],
    childIndex: 0,
    questions: [],
    total: 0,
    currentIndex: 0,
    currentQuestion: null,
    currentNum: 1,
    currentVideo: '',
    answeredMap: {},   // { questionId: value }
    answeredCount: 0,
    progressPercent: 0,
    allAnswered: false,
    submitting: false
  },

  onLoad() {
    // 加载问卷题目
    api.questionnaire.default().then(res => {
      const q = res || {};
      const questions = q.questions || [];
      this.setData({
        questions: questions,
        total: questions.length,
        currentQuestion: questions[0],
        currentNum: 1,
        currentVideo: api.videoUrl(questions[0] && questions[0].video_url)
      });
    }).catch(() => {
      wx.showToast({ title: '题库加载失败', icon: 'none' });
    });
  },

  onShow() {
    // 已登录才加载儿童列表
    if (app.globalData.token) {
      this.loadChildren();
    }
  },

  loadChildren() {
    api.child.list().then(list => {
      const children = (list || []).map(c => ({
        ...c,
        ageText: util.getChildAge(c.birthDate)
      }));
      const childrenRange = children.map(c => (c.avatar || '👶') + ' ' + c.name + ' (' + c.ageText + ')');
      let childIndex = 0;
      // 若从儿童管理页带过来的选中
      if (app.globalData.preSelectChildId) {
        const idx = children.findIndex(c => c.id === app.globalData.preSelectChildId);
        if (idx >= 0) childIndex = idx;
        app.globalData.preSelectChildId = null;
      }
      this.setData({ children, childrenRange, childIndex });
    }).catch(() => {});
  },

  onChildChange(e) {
    this.setData({ childIndex: parseInt(e.detail.value) });
  },

  startScreening() {
    if (this.data.children.length === 0) {
      wx.showToast({ title: '请先添加宝宝信息', icon: 'none' });
      return;
    }
    if (!app.requireLogin()) return;
    this.setData({ started: true });
    this.loadQuestion(0);
  },

  loadQuestion(index) {
    const q = this.data.questions[index];
    if (!q) return;
    this.setData({
      currentIndex: index,
      currentQuestion: q,
      currentNum: index + 1,
      currentVideo: api.videoUrl(q.video_url)
    });
    this.updateProgress();
  },

  selectAnswer(e) {
    const { qid, value } = e.currentTarget.dataset;
    const answeredMap = Object.assign({}, this.data.answeredMap);
    answeredMap[qid] = value;
    this.setData({ answeredMap });
    this.updateProgress();
  },

  updateProgress() {
    const answeredMap = this.data.answeredMap;
    const total = this.data.total;
    const answeredCount = Object.keys(answeredMap).length;
    const allAnswered = answeredCount >= total;
    this.setData({
      answeredCount,
      progressPercent: total > 0 ? Math.round(answeredCount / total * 100) : 0,
      allAnswered
    });
  },

  prevQuestion() {
    if (this.data.currentIndex > 0) this.loadQuestion(this.data.currentIndex - 1);
  },

  nextQuestion() {
    const cur = this.data.currentQuestion;
    if (this.data.answeredMap[cur.id] === undefined) {
      wx.showToast({ title: '请先回答当前题目', icon: 'none' });
      return;
    }
    if (this.data.currentIndex < this.data.total - 1) this.loadQuestion(this.data.currentIndex + 1);
  },

  submitScreening() {
    if (!this.data.allAnswered) {
      wx.showToast({ title: '请回答所有题目后再提交', icon: 'none' });
      return;
    }
    const child = this.data.children[this.data.childIndex];
    if (!child) { wx.showToast({ title: '请选择筛查宝宝', icon: 'none' }); return; }

    // 组装答案数组
    const answers = this.data.questions.map(q => ({
      questionId: q.id,
      value: this.data.answeredMap[q.id]
    }));

    this.setData({ submitting: true });
    api.answer.submit(child.id, 1, answers).then(report => {
      wx.showToast({ title: '筛查完成', icon: 'success' });
      setTimeout(() => {
        wx.redirectTo({ url: '/pages/result/result?id=' + report.id });
      }, 600);
    }).catch(() => {}).then(() => this.setData({ submitting: false }));
  },

  goChildManage() {
    wx.navigateTo({ url: '/pages/child-manage/child-manage' });
  },

  // 退出筛查
  onUnload() {
    if (this.data.started && this.data.answeredCount > 0 && !this.data.submitting) {
      // 进度不持久化，按原设计
    }
  }
});
