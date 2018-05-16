// pages/selectOptions/selectOptions.js
const util = require('../../utils/util.js');
Page({
  data: {
    date: -1,
    dateData: '',
    room: [0, 0, 0, 0, 0],
    areaIdx: [0, 0, 0, 0, 0, 0, 0, 0],
    area: ['0-500', '500-800', '800-1000', '1000-1500', '1500-2000', '2000-3000', '3000-5000', '5000-1000000'],
    sort: '',
    areaData: [],
    roomData: []
  },
  onLoad: function (options) {
    let dd = new Date();
    let arr = [];
    let d1 = util.formatTime(new Date(dd.setDate(dd.getDate() - 7)), '-').split(' ')[0];
    let d2 = util.formatTime(new Date(dd.setDate(dd.getDate() - 23)), '-').split(' ')[0];
    let d3 = util.formatTime(new Date(dd.setDate(dd.getDate() - 30)), '-').split(' ')[0];
    arr = [d1, d2, d3];
    let str = options.from == 'buy' ? '价格' : '租金';
    this.setData({ pagefrom: str, dateArr: arr });
  },
  selDate: function (e) {
    let d = e.currentTarget.dataset.date;
    if (d == this.data.date) {
      this.setData({ date: -1, dateData: '' });
    } else {
      this.setData({ date: d, dateData: this.data.dateArr[d] });
    }
  },
  selRoom: function (e) {
    let dd = this.data;
    let r = e.currentTarget.dataset.room;
    let i = r - 1;
    let obj = {}, arr = [];
    if (r == dd.room[i]) {
      obj['room[' + i + ']'] = 0;
    } else {
      obj['room[' + i + ']'] = r;
    }
    this.setData(obj);
    obj = {};
    for (let j = 0; j < dd.room.length; j++) {
      if (dd.room[j] != 0) {
        arr.push(dd.room[j]);
      }
    }
    obj['roomData'] = arr;
    this.setData(obj);
  },
  selArea: function (e) {
    let dd = this.data;
    let r = e.currentTarget.dataset.area;
    let i = r - 1;
    let obj = {}, arr = [];
    if (r == dd.areaIdx[i]) {
      obj['areaIdx[' + i + ']'] = '';
    } else {
      obj['areaIdx[' + i + ']'] = r;
    }
    this.setData(obj);
    obj = {};
    for (let j = 0; j < dd.area.length; j++) {
      if (dd.areaIdx[j] != 0) {
        arr.push(dd.area[j]);
      }
    }
    obj['areaData'] = arr;
    this.setData(obj);
  },
  selSort: function (e) {
    let s = e.currentTarget.dataset.sort;
    this.setData({ sort: s });
  },
  reset: function () {
    this.setData({
      date: -1,
      room: [0, 0, 0, 0, 0],
      areaIdx: [0, 0, 0, 0, 0, 0, 0, 0],
      sort: '',
      areaData: [],
      roomData: []
    });
  },
  sure: function () {
    let dd = this.data;
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    prevPage.setData({ update: true, other: { date: dd.dateData, room: dd.roomData, area: dd.areaData, sort: dd.sort } });
    wx.navigateBack();
  }
})