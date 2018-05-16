// pages/selectCity/selectCity.js
const app = getApp().globalData;
const amapFile = require('../../libs/amap-wx.js');
const api = {
	cityInfo: app.baseUrl + '/system/region/getByLocation'        //根据坐标返回城市信息
}
Page({
	data: {

	},
	onLoad: function (options) {
		this.getLoc();
		let regions = app.regions;
		if (app.regions && app.regions.length > 0) {
			this.setData({ regions: app.regions });
		} else {
			this.setData({ noRegion: true });
		}
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
			success() {
				let myAmap = new amapFile.AMapWX({ key: app.amap.key });
				myAmap.getRegeo({
					success(res) {
						let info = res[0].regeocodeData.addressComponent;
						if (info.country != '中国') {
							that.getCityInfo(info.streetNumber.location.split(','))
						} else {
							that.setData({ location: info.city, exist: false, code: '' });
							wx.setStorage({
								key: 'mypos',
								data: info.city
							});
						}
					},
					fail(errorInfo) {
						that.showToast(errorInfo)
					}
				})
			},
			fail() {
				that.showToast('位置错误！');
			}
		})
	},
	getCityInfo: function (a) {
		const that = this;
		wx.request({
			url: api.cityInfo,
			method: 'GET',
			header: app.header,
			data: { lng: a[0], lat: a[1] },
			success(res) {
				if (res.data.code == 0) {
					let r = res.data.data;
					that.setData({ exist: r.exist });
					if (r.country == 'ca' || r.country == 'us' || r.country == 'au') {
						that.setData({ location: r.region.chineselng, code: r.region.code });
						wx.setStorageSync('mypos', r.region.chineselng);
						wx.setStorageSync('regionCode', r.region.code);
						wx.setStorageSync('city', r.region.chineselng);
					} else {
						that.showToast('地区不在查询范围内！');
					}
				} else {
					that.showToast(res.data.resultMsg);
				}
			},
			fail() {
				that.showToast('未知错误(城市信息)');
			}
		})
	},
	setCity: function (e) {
		let data = e.currentTarget.dataset;
		let pos = data.pos;
		if (pos && this.data.exist) {
			wx.navigateBack()
		} else if (pos) {
			this.showToast('该城市无房源！');
			return;
		}
		let code = data.code;
		let city = data.city;
		wx.setStorageSync('city', city);
		wx.setStorageSync('regionCode', code);
		wx.navigateBack()
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