// pages/houseDetail/houseDetail.js
const app = getApp().globalData;
const util = require('../../utils/util.js');
const api = {
  detail: app.baseUrl + '/house/house/second/detail',     					//房源详情
  getExchangeRate: app.baseUrl + '/system/param/getExchangeRate',		//汇率
  similarHouse: app.baseUrl + '/house/house/second/listSimilar',		//相似房源
}
Page({
  data: {
    cur: 0,
    idx: 0,
    height: 'auto',
    similars: []
  },
  onLoad: function (options) {
		let scene = wx.getStorageSync('scene');
    let code = wx.getStorageSync('regionCode');
		if(scene == 1007 || scene == 1008){
			code = options.code;
			wx.setStorageSync('regionCode', code);
			wx.setStorageSync('city', options.city);
		}
    let unit = '', unit2 = '';
    if (code) {
      code = code.substr(0, 2);
      unit = code == 'ca' ? '加' : (code == 'us' ? '美' : '澳');
      unit2 = code == 'ca' ? 'C$' : (code == 'us' ? '$' : 'A$');
    }
    if (options.hid) {
      this.setData({ hid: options.hid, mslno: options.mslno, unit: unit, unit2: unit2 });
      if (options.mslno) {
        wx.showNavigationBarLoading();
        wx.setNavigationBarTitle({
          title: options.mslno,
          success() {
            wx.hideNavigationBarLoading()
          }
        });
      }
      this.getExchangeRate(code);
      this.getSimilarHouse();
    } else {
      wx.navigateBack()
    }
  },
  getExchangeRate: function (code) {
    const that = this;
    wx.request({
      url: api.getExchangeRate,
      method: 'GET',
      header: app.header,
      data: { region: code },
      success(res) {
        if (res.data.code == 0) {
          that.setData({ rate: res.data.data });
          that.getDetail();
        } else {
          that.showToast(res.data.resultMsg);
        }
      },
      fail() {
        that.showToast('获取汇率失败！');
      }
    })
  },
  getDetail: function () {
    const that = this;
    wx.showLoading({
      title: '加载中...'
    });
    app.header.token = '';
    wx.request({
      url: api.detail,
      header: app.header,
      method: 'GET',
      data: { id: that.data.hid },
      success(res) {
        if (res.data.code == 0) {
          let r = res.data.data;
          let rate = that.data.rate;
          if (r.images != null && r.images.length > 0) {
            for (let i = 0; i < r.images.length; i++) {
              r.images[i] = app.resUrl.house + r.images[i];
            }
          }
          if (r.price > 10000) {
            r.price = parseFloat(parseFloat(r.price / 10000).toFixed(2)) + '万';
          }
          if (r.priceCNY > 10000) {
            r.priceCNY = parseFloat(parseFloat(r.priceCNY / 10000).toFixed(2)) + '万';
          }
          if(r.priceMax > 0){
            r.avgPrice = true;
          }
          if (r.priceMax > 10000) {
            r.priceMax = parseFloat(parseFloat(r.priceMax / 10000).toFixed(2)) + '万';
          }
          if (r.priceMin > 10000) {
            r.priceMin = parseFloat(parseFloat(r.priceMin / 10000).toFixed(2)) + '万';
          }
          if (r.priceMaxCNY > 10000) {
            r.priceMaxCNY = parseFloat(parseFloat(r.priceMaxCNY / 10000).toFixed(2)) + '万';
          }
          if (r.priceMinCNY > 10000) {
            r.priceMinCNY = parseFloat(parseFloat(r.priceMinCNY / 10000).toFixed(2)) + '万';
          }
          r.listedDate = util.formatTime(new Date(r.listedDate), '年').split(' ')[0];
          r.floorSizeCN = parseInt(r.floorSize * 0.092903);
          r.landSizeCN = parseInt(r.landSize * 0.092903);
          r.landWidthCN = parseInt(r.landWidth * 0.3048);
          r.landDepthCN = parseInt(r.landDepth * 0.3048);
          r.landTaxCN = parseFloat(parseFloat(r.landTax * rate).toFixed(2));
          r.monthlyMaintenanceFeesCN = parseInt(r.monthlyMaintenanceFees * rate);
          r.pricePerSqftCN = parseInt(r.pricePerSqft * rate / 0.092903);
          r.houseFacilities = r.houseFacilities.split('/').join(', ');
          for (let i = 0; i < r.priceTable.length; i++) {
            r.priceTable[i].day = util.formatTime(new Date(r.priceTable[i].day), '/').split(' ')[0];
            if (r.priceTable[i].price > 10000) {
              r.priceTable[i].price = parseFloat(r.priceTable[i].price / 10000).toFixed(1) + '万';
            }
          }
          that.setData({ infos: r });

          setTimeout(function () {
            wx.createSelectorQuery().select('.detailinfo .desc .con').boundingClientRect(function (rect) {
              if (rect && rect.height > 100) {
                that.setData({ height: '100px', oriH: rect.height + 'px', mask: false, long: true })
              } else {
                that.setData({ long: false });
              }
            }).exec();
          }, 1000);
        } else {
          that.showToast(res.data.resultMsg);
        }
      }, fail() {
        that.showToast('未知错误！');
      },
      complete() {
        wx.hideLoading()
      }
    })
  },
  getSimilarHouse: function () {
    const that = this;
    wx.request({
      url: api.similarHouse,
      method: 'GET',
      header: app.header,
      data: { id: that.data.hid },
      success(res) {
        if (res.data.code == 0) {
          let r = res.data.data;
          if (r != null) {
            for (let i = 0; i < r.length; i++) {
              r[i].imgUrl = app.resUrl.house + r[i].listImage;
              if (r[i].priceCNY >= 10000) {
                r[i].priceCNY = Math.round(r[i].priceCNY / 10000) + '万';
              }
              if (r[i].price > 10000) {
                r[i].price = Math.round(r[i].price / 10000) + '万';
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
              r[i].marketToday = r[i].marketDay == 0;
              r[i].listedDate = util.formatTime(new Date(r[i].listedDate), '-').split(' ')[0];
              let bt = r[i].buildingType;
              r[i].buildType = bt == 0 ? '独立屋' : (bt == 1 ? '排屋' : (bt == 2 ? '公寓' : ''));
            }
            that.setData({ similars: r });
          }
        } else {
          that.showToast(res.data.resultMsg);
        }
      }
    })
  },
  getCur: function (e) {
    this.setData({ cur: e.detail.current });
  },
  previewImg: function () {
    wx.previewImage({
      urls: this.data.infos.images,
      current: this.data.infos.images[this.data.cur]
    })
  },
  changeTab: function (e) {
    this.setData({ idx: e.currentTarget.dataset.idx });
  },
  lookmore: function () {
    let mask = this.data.mask;
    mask = !mask;
    this.setData({ mask: mask });
  },
  showHisPrice: function () {
    let a = this.data.showHis;
    this.setData({ showHis: !a });
  },
  navToDetail: function(e){
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
    obj.to = 'buy';
    for(let j=0;j<arr.length;j++){
      if(arr[j].id == obj.id){
        flag = true;
        break;
      }
    }
    if(!flag){
      if (arr.length >= 20) {
        arr.splice(0, 1);
      }
      arr.push(obj);
    }
    wx.setStorageSync(code, arr);
    wx.navigateTo({
      url: '/pages/buyHouseDetail/buyHouseDetail?hid=' + id + '&mslno=' + mslno
    });
  },
	onShareAppMessage: function(){
		let dd = this.data;
		let code = wx.getStorageSync('regionCode');
		let city = wx.getStorageSync('city');
		return {
			title: '我看中了这套房子，你怎么看？',
			path: '/pages/buyHouseDetail/buyHouseDetail?hid='+ dd.hid + '&code='+ code + '&mslno='+ dd.mslno + '&city='+ city,
			imageUrl: ''
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