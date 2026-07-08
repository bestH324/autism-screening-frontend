// 科普页
const api = require('../../utils/api.js');

Page({
  data: { category: 'all', list: [], loading: false },

  onShow() { this.loadArticles(); },

  switchTab(e) {
    this.setData({ category: e.currentTarget.dataset.cat });
    this.loadArticles();
  },

  loadArticles() {
    this.setData({ loading: true });
    const cat = this.data.category === 'all' ? '' : this.data.category;
    api.content.articles(cat).then(list => {
      this.setData({ list: list || [], loading: false });
    }).catch(() => this.setData({ loading: false }));
  },

  viewArticle(e) {
    const id = e.currentTarget.dataset.id;
    api.content.articleDetail(id).then(article => {
      wx.showModal({
        title: article.title,
        content: (article.date + ' · ' + article.author + '\n\n' + article.content).replace(/<br>/g, '\n'),
        showCancel: false,
        confirmText: '我知道了'
      });
    }).catch(() => {});
  }
});
