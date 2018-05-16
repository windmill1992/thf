//index.js
//获取应用实例
const app = getApp().globalData;
const util = require('../../utils/util.js');
const amapFile = require('../../libs/amap-wx.js');
const api = {
	getRegions: app.baseUrl + '/system/region/listBigRegion',     //大区列表
	getBanner: app.baseUrl + '/knowledge/info/indexList',         //轮播图
	houseList: app.baseUrl + '/house/house/second/listRecommend', //热门推荐房源
  cityInfo: app.baseUrl + '/system/region/getByLocation'        //根据坐标返回城市信息
}
Page({
	data: {
		location: '',
		region: ''
	},
	onLoad: function () {
		let that = this;
		if (!app.regions || app.regions.length == 0) {
			wx.showLoading({
				title: '加载中...'
			});
			that.getRegions();
		}
		let code = wx.getStorageSync('regionCode');
		if (code && code != '') {
			let city = wx.getStorageSync('city');
			let cCode = code.substr(0, 2);
			let unit = cCode == 'ca' ? 'C$' : (cCode == 'us' ? '$' : (cCode == 'au' ? 'A$' : ''));
			that.setData({ location: city, region: code, unit: unit });
		} else {
			let pos = wx.getStorageSync('mypos');
			if (!pos) {
				that.getLoc();
			} else {
				that.setData({ location: pos });
			}
		}
		that.getBanner();
		that.getHouseList();
	},
	onShow: function () {
		let code = wx.getStorageSync('regionCode');
		if (code && code != '' && code != this.data.region) {
			let city = wx.getStorageSync('city');
			let cCode = code.substr(0, 2);
			let unit = cCode == 'ca' ? 'C$' : (cCode == 'us' ? '$' : (cCode == 'au' ? 'A$' : ''));
			this.setData({ location: city, region: code, unit: unit });
			wx.showLoading({
				title: '加载中...'
			});
			this.getBanner();
			this.getHouseList();
		}
		if (!app.regions || app.regions.length == 0) {
			wx.showLoading({
				title: '加载中...',
			});
			this.getRegions();
		}
	},
	getBanner: function () {
		const that = this;
		wx.request({
			url: api.getBanner,
			method: 'GET',
			header: app.header,
			data: { region: this.data.region },
			success(res) {
				if (res.data.code == 0) {
					let r = res.data.data, arr = [], obj = {};
					if (r != null && r.length > 0) {
						for (let i = 0; i < r.length; i++) {
							obj.id = r[i].id;
							obj.imgUrl = app.resUrl.banner + r[i].imgUrl;
							arr.push(obj);
							obj = {};
						}
					} else { }
					that.setData({ banners: arr });
				} else {
					that.showToast(res.data.resultMsg);
				}
			},
			fail() {
				that.showToast('未知错误！');
			},
			complete() {
				if (!that.data.loading) {
					wx.hideLoading()
				}
			}
		})
	},
	getLoc: function () {
		let that = this;
		wx.getSetting({
			success: res => {
				if (!res.authSetting['scope.userLocation']) {
					wx.authorize({
						scope: 'scope.userLocation',
						success() {
							that.getLocation();
						},
						fail() {
							wx.openSetting({
								success(res1) {
									if (res1.authSetting['scope.userLocation']) {
										that.getLocation()
									} else {
										that.showToast('授权失败！')
									}
								}
							})
						}
					})
				} else {
					that.getLocation();
				}
			}
		})
	},
	getLocation() {
		let that = this;
		wx.getLocation({
      type: '',
			success(res1) {
				let myAmap = new amapFile.AMapWX({ key: app.amap.key });
				myAmap.getRegeo({
					success(res) {
						let info = res[0].regeocodeData.addressComponent;
						if(info.country != '中国'){
							that.getCityInfo(info.streetNumber.location.split(','))
						}else{
							that.setData({ location: info.city });
							wx.setStorage({
								key: 'mypos',
								data: info.city
							});
						}
					},
					fail(errorInfo) {
						that.showToast(errorInfo)
					}
				});
			},
			fail() {
				that.showToast('未知错误(定位)！');
			}
		})
	},
  getCityInfo: function(a){
    const that = this;
    wx.request({
      url: api.cityInfo,
      method: 'GET',
      header: app.header,
      data: {lng: a[0], lat: a[1]},
      success(res) {
        if(res.data.code == 0){
          let r = res.data.data;
					if(r.country == 'ca' || r.country == 'us' || r.country == 'au'){
						that.setData({ location: r.region.chineselng, region: r.region.code });
						wx.setStorage({
							key: 'mypos',
							data: r.region.chineselng
						});
					}else{
						that.showToast('地区不在查询范围内！');
					}
        }else{
          that.showToast(res.data.resultMsg);
        }
      },
      fail() {
        that.showToast('未知错误(城市信息)');
      }
    })
  },
	getHouseList: function () {
		const that = this;
		wx.request({
			url: api.houseList,
			method: 'GET',
			header: app.header,
			data: { region: that.data.region },
			success(res) {
				if (res.data.code == 0) {
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
						that.setData({ houseList: r });
					} else {
						that.setData({ houseList: [] });
					}
				} else {
					//that.showToast(res.data.resultMsg);
          that.setData({ houseList: [] });
				}
			}, fail() {
				that.showToast('未知错误(房源)！');
			},
			complete() {
				if (!that.data.loading) {
					wx.hideLoading()
				}
			}
		})
	},
	getRegions: function () {
		const that = this;
		that.setData({ loading: true });
		wx.request({
			url: api.getRegions,
			method: 'GET',
			header: app.header,
			data: {},
			success(res) {
				if (res.data.code == 0) {
					app.regions = res.data.data;
					wx.setStorage({
						key: 'regions',
						data: res.data.data
					});
				} else {
					that.showToast(res.data.resultMsg);
				}
			},
			complete() {
				wx.hideLoading();
				that.setData({ loading: false });
			}
		})
	},
	navToDetail: function (e) {
		let id = e.currentTarget.dataset.id;
		wx.navigateTo({
			url: '/pages/newsDetail/newsDetail?newsId=' + id
		});
	},
	houseToDetail: function (e) {
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
			url: '/pages/buyHouseDetail/buyHouseDetail?hid=' + id + '&mslno=' + mslno
		});
	},
	onPullDownRefresh: function () {
		wx.stopPullDownRefresh();
		wx.showLoading({
			title: '加载中...',
		});
		this.getBanner();
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
