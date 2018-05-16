// pages/news/news.js
const app = getApp().globalData;
const api = {
  getBanner: app.baseUrl + '/knowledge/info/listBanners',   //banner
  newsList: app.baseUrl + '/knowledge/info/listHots',       //热门资讯
};
const util = require('../../utils/util.js');
Page({
  data: {
    width: 60,
    bannerImgs: [],
    newsList: [],
    cur: 0,
    tab: 0,
    types: 1,
    left: 0,
    code: 1,
    page: 1,
    hasmore: false
  },
  onLoad: function (options) {
    const that = this;
    let code = wx.getStorageSync('regionCode');
    if (!code) {
      code = 1;
    }
    wx.createSelectorQuery().selectAll('.navs .nav-a').boundingClientRect(function (rects) {
      let arr = [];
      rects.forEach(function (rect, i) {
        arr.push(rect.left - rects[0].left);
      });
      that.setData({ lefts: arr, code: code });
    }).exec();

    that.getBanner();
    that.getNewsList(1, 10);
  },
  getBanner: function () {
    const that = this;
    wx.request({
      url: api.getBanner,
      method: 'GET',
      header: app.header,
      data: { region: that.data.code, type: that.data.types },
      success(res) {
        if (res.data.code == 0) {
          let r = res.data.data, arr = [], obj = {};
          for (let i = 0; i < r.length; i++) {
            obj.imgUrl = app.resUrl.banner + r[i].imgUrl;
            obj.id = r[i].id;
            obj.title = r[i].title;
            arr.push(obj);
            obj = {};
          }
          that.setData({ bannerImgs: arr });
        } else {
          that.showToast(res.data.resultMsg);
        }
      }, fail() {
        that.showToast('未知错误！');
      }
    })
  },
  getNewsList: function (pn, ps) {
    const that = this;
    wx.showLoading({
      title: '加载中...'
    });
    wx.request({
      url: api.newsList,
      method: 'GET',
      header: app.header,
      data: { region: that.data.code, type: that.data.types, currentPage: pn, pageSize: ps },
      success(res) {
        if (res.data.code == 0) {
          let r = res.data.data;
          let hasNext = res.data.hasNext;
          for (let i = 0; i < r.length; i++) {
            r[i].imgUrl = app.resUrl.encImg + r[i].imgUrl;
            if (r[i].updatedAt != null) {
              r[i].date = util.formatTime(new Date(r[i].updatedAt), '-').split(' ')[0];
            } else {
              r[i].date = util.formatTime(new Date(r[i].createdAt), '-').split(' ')[0];
            }
          }
          let arr = that.data.newsList.concat(r);
          that.setData({ newsList: arr, hasmore: hasNext });
        } else {
          that.showToast(res.data.resultMsg);
        }
      }, fail() {
        that.showToast('未知错误！');
      }, complete() {
        that.setData({ loading: false });
        wx.hideLoading()
      }
    })
  },
  bannerChange: function (e) {
    this.setData({ cur: e.detail.current });
  },
  switchTab: function (e) {
    let dd = this.data;
    let t = e.currentTarget.dataset.tab;
    let tp = e.currentTarget.dataset.type;
    this.setData({ tab: t, types: tp, left: dd.lefts[t], page: 1, bannerImgs: [], newsList: [] });
    this.getBanner();
    this.getNewsList(1, 10);
  },
  navToDetail: function(){
    let id = this.data.bannerImgs[this.data.cur].id;
    wx.navigateTo({
      url: '/pages/newsDetail/newsDetail?newsId=' + id
    });
  },
  onReachBottom: function () {
    const dd = this.data;
    if (dd.loading || !dd.hasmore) return;
    let pn = dd.page;
    pn++;
    this.getNewsList(pn, 10);
    this.setData({ page: pn, loading: true });
  },
  onShareAppMessage: function () {

  },
  showToast: function (txt) {
    const that = this;
    let obj = {};
    obj.show = true;
    obj.title = txt;
    this.setData({ toast: obj });
    setTimeout(function () {
      obj.show = false;
      obj.title = '';
      that.setData({ toast: obj });
    }, 2000);
  }
})