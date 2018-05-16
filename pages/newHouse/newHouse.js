// pages/newHouse/newHouse.js
const app = getApp().globalData;
const util = require('../../utils/util.js');
const api = {
  houseList: app.baseUrl + '/house/house/new/search',    //精选房源查询
  cityList: app.baseUrl + '/system/region/listCity',     //根据大区获取城市
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
    price: '价格选择',
    state: '销售状态',
    sort: '排序',
    states: [
      { id: '', cn: '' },
      { id: 3, cn: '预售' },
      { id: 1, cn: '在售' },
      { id: 0, cn: '现房' },
      { id: 2, cn: '售罄' }
    ],
    prices: [
      { area: '', cn: '', },
      { area: '0-500000', cn: '0-50万' },
      { area: '500000-800000', cn: '50万-80万' },
      { area: '800000-1000000', cn: '80万-100万' },
      { area: '1000000-1500000', cn: '100万-150万' },
      { area: '1500000-2000000', cn: '150万-200万' },
      { area: '2000000-3000000', cn: '200万-300万' },
      { area: '3000000-5000000', cn: '300万-500万' },
      { area: '5000000-1000000000', cn: '500万以上' }
    ],
    sorts: [
      { dir: '', field: '', name: '默认排序（更新时间倒序）' },
      { dir: 'asc', field: 2, name: '开盘时间由早到晚' },
      { dir: 'desc', field: 2, name: '开盘时间由晚到早' },
      { dir: 'asc', field: 1, name: '起始价由低到高' },
      { dir: 'desc', field: 1, name: '起始价由高到低' }
    ],
    args: {},
    hasmore: true,
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
    }
    let obj = {
      currentPage: 1,
      pageSize: 10,
      region: code
    };
    that.setData({ args: obj });
    that.getHouseList(obj);
    that.getCityList();
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
          if (r != null && r.length > 0) {
            let hasNext = res.data.hasNext;
            for (let i = 0; i < r.length; i++) {
              r[i].listImage = app.resUrl.house + r[i].listImage;
              if (r[i].priceCNY >= 10000) {
                r[i].priceCNY = Math.round(r[i].priceCNY / 10000) + '万';
              }
              if (r[i].price >= 10000) {
                r[i].price = Math.round(r[i].price / 10000) + '万';
              }
              let bt = r[i].buildingType;
              r[i].buildType = bt == 0 ? '独立屋' : (bt == 1 ? '排屋' : (bt == 2 ? '公寓' : ''));
              let st = r[i].status;
              r[i].stateCN = st == 0 ? '现房' : (st == 1 ? '在售' : (st == 2 ? '售罄' : (st == 3 ? '预售' : '现售')));
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
    let idx = box == 'area' ? 0 : (box == 'price' ? 1 : (box == 'state' ? 2 : 3));
    let obj = {};
    obj['opts[' + idx + '].sel'] = cn;
    obj['box'] = '';
    if (cn) {
      obj[box] = cn;
    } else {
      obj[box] = idx == 0 ? '城市选择' : (idx == 1 ? '价格选择' : (idx == 2 ? '销售状态' : '排序'));
    }
    this.setData(obj);
    if (idx == 0) {
      this.setData({ 'args.city': arg });
    } else if (idx == 1) {
      this.setData({ 'args.priceFilter': arg });
    } else if (idx == 2) {
      this.setData({ 'args.status': arg });
    } else {
      let arr = arg.split(',');
      this.setData({ 'args.direction': arr[0], 'args.sortField': arr[1] });
    }
    this.setData({ 'args.currentPage': 1, houseList: [], hasmore: true });
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
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
    this.setData({ 'args.currentPage': 1, hasmore: true, houseList: [] });
    this.getHouseList();
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