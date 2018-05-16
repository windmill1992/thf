// pages/newHouseDetail/newHouseDetail.js
const app = getApp().globalData;
const util = require('../../utils/util.js');
const api = {
  detail: app.baseUrl + '/house/house/new/detail',        //详情
  houseList: app.baseUrl + '/house/house/new/listSimilar' //相似楼花
}
Page({
  data: {
    houseList: [],
    cur: 0
  },
  onLoad: function (options) {
    if(options.hid){
      let code = wx.getStorageSync('regionCode');
      let unit = '', unit2 = '';
      if(!code){
        code = 1;
      }else{
        let c = code.substr(0, 2);
        unit = c == 'ca' ? '加' : (c == 'us' ? '美' : '澳');
        unit2 = c == 'ca' ? 'C$' : (c == 'us' ? '$' : 'A$');
      }
      this.setData({hid: options.hid, code: code, unit: unit, unit2: unit2});
      this.getDetail();
      this.getHouseList();
    }else{
      wx.navigateBack()
    }
  },
  onShow: function () {
    wx.removeStorageSync('newHouseInfo');
    wx.removeStorageSync('houseTypeList');
  },
  getDetail: function(){
    const that = this;
    wx.showLoading({
      title: '加载中...'
    });
    wx.request({
      url: api.detail,
      method: 'GET',
      header: app.header,
      data: {id: that.data.hid},
      success(res) {
        if(res.data.code == 0){
          let r = res.data.data;
          if (r.imagesRecommend != null){
            for (let i = 0; i < r.imagesRecommend.length;i++){
              r.imagesRecommend[i] = app.resUrl.house + r.imagesRecommend[i];
            }
          }
          for (let i = 0; i < r.floorPlans.length;i++){
            if (r.floorPlans[i].image != ''){
              r.floorPlans[i].image = app.resUrl.house + r.floorPlans[i].image;
            }
          }
          for (let i = 0; i < r.images.length;i++){
            r.images[i] = app.resUrl.house + r.images[i];
          }
          r.price = parseFloat(parseFloat(r.price / 10000).toFixed(2)) + '万';
          r.priceCNY = parseFloat(parseFloat(r.priceCNY / 10000).toFixed(2)) + '万';
          let bt = r.buildingType;
          r.buildType = bt == 0 ? '独立屋' : (bt == 1 ? '排屋' : (bt == 2 ? '公寓' : ''));
          let st = r.status;
          r.stateCN = st == 0 ? '现房' : (st == 1 ? '在售' : (st == 2 ? '售罄' : (st == 3 ? '预售' : '现售')));
          that.setData({infos: r});
        }else{
          that.showToast(res.data.resultMsg);
        }
      },
      complete() {
        wx.hideLoading()
      }
    })
  },
  getHouseList: function(){
    const that = this;
    wx.request({
      url: api.houseList,
      method: 'GET',
      header: app.header,
      data: { id: that.data.hid},
      success(res) {
        if(res.data.code == 0){
          let r = res.data.data;
          if (r != null && r.length > 0) {
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
            that.setData({ houseList: r });
          } else {
            that.setData({ houseList: [] });
          }
        } else {
          that.showToast(res.data.resultMsg);
        }
      }
    })
  },
  getCur: function(e){
    this.setData({cur: e.detail.current});
  },
  lookInfo: function(e){
    let i = e.currentTarget.dataset.idx;
    let data = this.data.infos;
    let obj = {};
    if(i == 0){
      obj.developer = data.developer;
      obj.communityScale = data.communityScale;
      obj.propertyRight = data.propertyRight;
      obj.totalFloors = data.totalFloors;
      obj.buildingForm = data.buildingForm;
      obj.community = data.community;
      obj.orientation = data.orientation;
    }else if(i == 1){
      obj.manageTable = data.manageTable;
      obj.unit = this.data.unit2;
    }else if(i == 2){
      if (data.schools == null || data.schools.length == 0){
        that.showToast('周边没有学区');
        return;
      }
      obj.schools = data.schools;
    }
    obj.index = i;
    wx.setStorageSync('newHouseInfo', obj);
    wx.navigateTo({
      url: '/pages/newHouseInfo/newHouseInfo'
    });
  },
  moreHouseType: function(){
    let obj = {};
    obj.unit = this.data.unit2;
    obj.list = this.data.infos.floorPlans;
    wx.setStorageSync('houseTypeList', obj);
    wx.navigateTo({
      url: '/pages/newHouseType/newHouseType'
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