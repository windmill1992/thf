// pages/newsDetail/newsDetail.js
const app = getApp().globalData;
const util = require('../../utils/util.js');
const wxParse = require('../../wxParse/wxParse.js');
const api = {
  getDetail: app.baseUrl + '/knowledge/info/detail',            //新闻详情信息
  getRelevance: app.baseUrl + '/knowledge/info/listRelevance'   //相关资讯
}
Page({
  data: {
    hasRelevance: false
  },
  onLoad: function (options) {
    let newsId = options.newsId;
    if (newsId) {
      this.getDetail(newsId);
      this.setData({ newsId: newsId });
    } else {
      wx.navigateBack()
    }
  },
  getDetail: function (id) {
    const that = this;
    wx.showLoading({
      title: '加载中...',
    });
    wx.request({
      url: api.getDetail,
      method: 'GET',
      header: app.header,
      data: { id: id },
      success(res) {
        if (res.data.code == 0) {
          let r = res.data.data;
          r.imgUrl = app.resUrl.encImg + r.imgUrl;
          if (r.updatedAt != null) {
            r.date = util.formatTime(new Date(r.updatedAt), '-');
          } else {
            r.createdAt = util.formatTime(new Date(r.createdAt), '-');
          }
          wxParse.wxParse('newsContent', 'html', r.content, that);
          that.setData({ news: r });
        } else {
          that.showToast(res.data.resultMsg);
        }
      },
      fail() {
        that.showToast('未知错误！');
      },
      complete() {
        wx.hideLoading();
        that.getRelevance(id);
      }
    })
  },
  getRelevance: function (id) {
    const that = this;
    let code = wx.getStorageSync('regionCode');
    if (code) {
      wx.request({
        url: api.getRelevance,
        method: 'GET',
        header: app.header,
        data: { id: id, region: code },
        success(res) {
          if (res.data.code == 0) {
            if (res.data.data != null) {
              let r = res.data.data;
              for (let i = 0; i < r.length; i++) {
                r[i].imgUrl = app.resUrl.encImg + r[i].imgUrl;
                if (r[i].updatedAt != null) {
                  r[i].date = util.formatTime(new Date(r[i].updatedAt), '-').split(' ')[0];
                } else {
                  r[i].date = util.formatTime(new Date(r[i].createdAt), '-').split(' ')[0];
                }
              }
              that.setData({ hasRelevance: true, relevance: r });

            }
          } else {
            that.showToast(res.data.resultMsg);
          }
        }, fail() {
          that.showToast('未知错误！');
        }
      })
    } else {
      that.setData({ hasRelevance: false });
    }
  },
  onShareAppMessage: function () {
    let dd = this.data.news;
    return {
      title: dd.title,
      path: '/pages/newsDetail/newsDetail?newsId=' + dd.id,
      imageUrl: dd.imgUrl
    }
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