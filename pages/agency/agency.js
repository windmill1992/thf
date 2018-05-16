// pages/agency/agency.js
const app = getApp().globalData;
const api = {
	agency: app.baseUrl + '/oauth/oauth-rest/search-broker-list',   //经纪人
}
Page({
	data: {
		agents: [],
		page: 1,
		hasAgents: true,
		hasmore: 1
	},
	onLoad: function (options) {
		let city = wx.getStorageSync('city');
		if (city) {
			wx.showNavigationBarLoading();
			wx.setNavigationBarTitle({
				title: '淘海房' + city + '地产经纪',
			});
			wx.hideNavigationBarLoading()
		}
		this.getAgency(1, 10);
	},
	getAgency: function (pn, ps) {
		const that = this;
		wx.showLoading({
			title: '加载中...'
		});
		let code = wx.getStorageSync('regionCode');
		app.header.regionCode = code;
		wx.request({
			url: api.agency,
			method: 'GET',
			header: app.header,
			data: { pageIndex: pn, pageSize: ps },
			success(res) {
				if (res.data.code == 0) {
					let r = res.data.data;
					let next = res.data.hasNext;
					if (r != null) {
						for (let i = 0; i < r.length; i++) {
							let arr = [];
							for (let j = 0; j < r[i].languageList.length; j++) {
								if (r[i].languageList[j] == '中文') {
									arr.push('普');
								} else if (r[i].languageList[j] == '粤语') {
									arr.push('粤');
								} else if (r[i].languageList[j] == '英文') {
									arr.push('英');
								}
							}
							r[i].lang = arr.join(' ');
							if (r[i].userAvatar.indexOf('http') == -1) {
								r[i].userAvatar = app.resUrl.photo + r[i].userAvatar;
							}
						}
						let arr2 = that.data.agents.concat(r);
						that.setData({ agents: arr2, hasmore: next });
					} else {
						that.setData({ hasAgents: false });
					}
				} else {
					that.showToast(res.data.resultMsg);
				}
			},
			fail() {
				that.showToast('未知错误！');
			}, complete() {
				wx.hideLoading();
				app.header.regionCode = null;
			}
		})
	},
	onReachBottom: function () {
		if (!this.data.hasmore) return;
		let page = this.data.page;
		this.getAgency(++page, 10);
		this.setData({ page: page });
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