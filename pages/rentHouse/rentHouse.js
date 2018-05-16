// pages/rentHouse/rentHouse.js
const app = getApp().globalData;
const util = require('../../utils/util.js');
const api = {
  houseList: app.baseUrl + '/house/house/second/search',    //房源查询
  cityList: app.baseUrl + '/system/region/listCity',        //根据大区获取城市
}
Page({
  data: {
    box: '',
    opts: [
      { sel: '-1' },
      { sel: '-1' },
      { sel: '-1' }
    ],
    area: '城市选择',
    cate: '房屋类型',
    price: '租金选择',
    htype: '户型选择',
    types: [
      { id: '', cn: '', en: '' },
      { id: 0, cn: '独立屋', en: 'Single-house' },
      { id: 1, cn: '排屋', en: 'Townhouse' },
      { id: 2, cn: '公寓', en: 'Apartment' }
    ],
    prices: [
      { area: '', cn: '', },
      { area: '0-1000', cn: '0-1000' },
      { area: '1000-1500', cn: '1000-1500' },
      { area: '1500-2000', cn: '1500-2000' },
      { area: '2000-3000', cn: '2000-3000' },
      { area: '3000-4000', cn: '3000-4000' },
      { area: '4000-5000', cn: '4000-5000' },
      { area: '5000-8000', cn: '5000-8000' },
      { area: '8000-1000000000', cn: '8000以上' }
    ],
    htypeBeds: [
      { id: '', cn: '不限', sel: false },
      { id: 1, cn: '1室', sel: false },
      { id: 2, cn: '2室', sel: false },
      { id: 3, cn: '3室', sel: false },
      { id: 4, cn: '4室', sel: false },
      { id: 5, cn: '5室及以上', sel: false }
    ],
    htypeBaths: [
      { id: '', cn: '不限', sel: false },
      { id: 1, cn: '1卫', sel: false },
      { id: 2, cn: '2卫', sel: false },
      { id: 3, cn: '3卫', sel: false },
      { id: 4, cn: '4卫', sel: false },
      { id: 5, cn: '5卫及以上', sel: false }
    ],
    args: {},
    houseList: []
  },
  onLoad: function (options) {
    const that = this;
    let code = wx.getStorageSync('regionCode');
    if (!code) {
      code = 1;
    } else {
      let city = wx.getStorageSync('city');
      let cCode = code.substr(0, 2);
      let unit = cCode == 'ca' ? 'C$' : (cCode == 'us' ? '$' : (cCode == 'au' ? 'A$' : ''));
      that.setData({ unit: unit });
      wx.showNavigationBarLoading();
      wx.setNavigationBarTitle({
        title: '淘海房' + city + '租房'
      });
      wx.hideNavigationBarLoading()
    }
    let obj = {
      currentPage: 1,
      pageSize: 10,
      region: code,
      saleType: 1
    };
    that.setData({ args: obj });
    that.getHouseList(obj);
    that.getCityList();
  },
  onShow: function () {
    if (this.data.update) {
      this.setData({ update: false });
      let other = this.data.other;
      if (other.date) {
        this.setData({ 'args.startDate': other.date });
      }
      if (other.room.length > 0) {
        this.setData({ 'args.beds': other.room.join(',') });
      }
      if (other.area.length > 0) {
        this.setData({ 'args.roomAreaFilter': other.area.join(',') });
      }
      if (other.sort) {
        let arr = other.sort.split('-');
        this.setData({ 'args.direction': arr[0], 'args.sortField': arr[1] });
      }
      this.setData({ 'args.currentPage': 1, houseList: [] });
      this.getHouseList(this.data.args);
    } else {
      let code = wx.getStorageSync('regionCode');
      if (code != this.data.args.region) {
        this.setData({ 'args.region': code, houseList: [] });
        this.getHouseList(this.data.args);
      }
    }
  },
  getHouseList: function (args) {
    const that = this;
    wx.showLoading({
      title: '加载中...'
    });
    wx.request({
      url: api.houseList,
      method: 'GET',
      header: app.header,
      data: args,
      success(res) {
        if (res.data.code == 0) {
          let r = res.data.data;
          if (r != null) {
            let hasNext = res.data.hasNext;
            for (let i = 0; i < r.length; i++) {
              r[i].listImage = app.resUrl.house + r[i].listImage;
              if (r[i].priceCNY >= 10000) {
                r[i].priceCNY = parseInt(r[i].priceCNY / 10000) + '万';
              }
              if (r[i].price >= 10000) {
                r[i].price = parseInt(r[i].price / 10000) + '万';
              }
              if (r[i].priceMax > 0) {
                r[i].avaPrice = Math.round((r[i].priceMax + r[i].priceMin) / 2 / 10000) + '万';
              }
              if (r[i].priceMax > 10000) {
                r[i].priceMax = Math.round(r[i].priceMax / 10000) + '万';
              }
              if (r[i].priceMin > 10000) {
                r[i].priceMin = Math.round(r[i].priceMin / 10000) + '万';
              }
              r[i].listedDate = util.formatTime(new Date(r[i].listedDate), '-').split(' ')[0];
              let bt = r[i].buildingType;
              r[i].buildType = bt == 0 ? '独立屋' : (bt == 1 ? '排屋' : (bt == 2 ? '公寓' : ''));
            }
            let arr = that.data.houseList;
            arr = arr.concat(r);
            that.setData({ houseList: arr, hasmore: hasNext, noData: false });
          } else {
            that.setData({ houseList: [], hasmore: false, noData: true });
          }
        } else {
          that.showToast(res.data.resultMsg);
        }
      }, fail() {
        that.showToast('未知错误！');
      }, complete() {
        wx.hideLoading()
      }
    })
  },
  getCityList: function () {
    const that = this;
    wx.request({
      url: api.cityList,
      method: 'GET',
      header: app.header,
      data: { region: that.data.args.region },
      success(res) {
        if (res.data.code == 0) {
          that.setData({ cityList: res.data.data });
        } else {
          that.showToast(res.data.resultMsg);
        }
      }, fail() {
        that.showToast('获取城市出错！');
      }
    })
  },
  select: function (e) {
    let t = e.currentTarget.dataset.type;
    if (this.data.box == t) {
      this.setData({ box: '' });
    } else {
      this.setData({ box: t });
    }
  },
  selOption: function (e) {
    let cn = e.currentTarget.dataset.cn;
    let arg = e.currentTarget.dataset.arg;
    let box = this.data.box;
    let idx = box == 'area' ? 0 : (box == 'cate' ? 1 : 2);
    let obj = {};
    obj['opts[' + idx + '].sel'] = cn;
    obj['box'] = '';
    if (cn) {
      cn = box == 'area' ? cn.substr(0, 5) : cn;
      obj[box] = cn;
    } else {
      obj[box] = idx == 0 ? '城市选择' : (idx == 1 ? '房屋类型' : '租金选择');
    }
    this.setData(obj);
    if (idx == 0) {
      this.setData({ 'args.city': arg });
    } else if (idx == 1) {
      this.setData({ 'args.buildingType': arg });
    } else if (idx == 2) {
      this.setData({ 'args.priceFilter': arg });
    }
    this.setData({ 'args.currentPage': 1, houseList: [] });
    this.getHouseList(this.data.args);
  },
  selType: function (e) {
    let ds = e.currentTarget.dataset;
    let id = ds.id, prop = ds.name;
    let dd = this.data[prop];
    let obj = {};
    if (id == '') {
      for (let i = 0; i < dd.length; i++) {
        dd[i].sel = false;
      }
      dd[0].sel = true;
    } else {
      dd[0].sel = false;
      dd[id].sel = !dd[id].sel;
    }
    obj[prop] = dd;
    this.setData(obj);
  },
  sureSel: function () {
    let d1 = this.data.htypeBeds;
    let d2 = this.data.htypeBaths;
    let arr1 = [], arr2 = [], arr3 = [], arr4 = [], obj = {};
    for (let i = 0; i < d1.length; i++) {
      if (d1[i].sel) {
        d1[i].id = d1[i].id ? d1[i].id : '不限';
        arr1.push(d1[i].id);
        if (i > 0) {
          arr3.push(d1[i].id);
        }
      }
    }
    if (arr1.length == 0) {
      arr1.push('不限');
    }
    for (let i = 0; i < d2.length; i++) {
      if (d2[i].sel) {
        d2[i].id = d2[i].id ? d2[i].id : '不限';
        arr2.push(d2[i].id);
        if (i > 0) {
          arr4.push(d2[i].id);
        }
      }
    }
    if (arr2.length == 0) {
      arr2.push('不限');
    }
    let str = arr1.join('/') + ',' + arr2.join('/');
    this.setData({ htype: str, box: '', 'args.beds': arr3.join(','), 'args.baths': arr4.join(','), 'args.currentPage': 1, houseList: [], hasmore: true });
    this.getHouseList(this.data.args);
  },
  hideDialog: function (e) {
    this.setData({ box: '' });
  },
  onReachBottom: function () {
    let idx = this.data.args.currentPage;
    idx++;
    this.setData({ 'args.currentPage': idx });
    this.getHouseList(this.data.args);
  },
  navToDetail: function (e) {
    let data = e.currentTarget.dataset;
    let id = data.id;
    let mslno = data.mslno;
    let i = data.idx;
    let code = wx.getStorageSync('regionCode');
    let arr = wx.getStorageSync(code);
    if (arr == null || arr == '' || !arr) {
      arr = [];
    }
    let obj = this.data.houseList[i], flag = false;
    obj.to = 'rent';
    for (let j = 0; j < arr.length; j++) {
      if (arr[j].id == obj.id) {
        flag = true;
        break;
      }
    }
    if (!flag) {
      if (arr.length >= 20) {
        arr.splice(0, 1);
      }
      arr.push(obj);
      wx.setStorageSync(code, arr);
    }
    wx.navigateTo({
      url: '/pages/rentHouseDetail/rentHouseDetail?hid=' + id + '&mslno=' + mslno
    });
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