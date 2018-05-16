// pages/agencyDetail/agencyDetail.js
const app = getApp().globalData;
const api = {
  agencyInfo: app.baseUrl + '/oauth/oauth-rest/broker-list-by-id-list'  //经纪人信息
}
Page({
  data: {
    info: {}
  },
  onLoad: function (options) {
    if (options.id) {
      let city = wx.getStorageSync('city');
      this.setData({ id: options.id, city: city });
      this.getAgencyInfo();
      this.phonePrefix();
    } else {
      wx.navigateBack()
    }
  },
  getAgencyInfo: function () {
    const that = this;
    wx.showLoading({
      title: '加载中...'
    });
    wx.request({
      url: api.agencyInfo,
      header: app.header,
      method: 'GET',
      data: { brokerUserIdList: this.data.id },
      success(res) {
        if (res.data.code == 0) {
          let r = res.data.data;
          if (r != null && r.length > 0) {
						if (r[0].userAvatar.indexOf('http') == -1) {
							r[0].userAvatar = app.resUrl.photo + r[0].userAvatar;
						}
            r[0].lang = r[0].languageList.join(' ');
            that.setData({ info: r[0] });
          }
        } else {
          that.showToast(res.data.resultMsg);
        }
      },
      fail() {
        that.showToast('未知错误！');
      },
      complete() {
        wx.hideLoading()
      }
    })
  },
  call: function (e) {
    // let tel = e.currentTarget.dataset.mobile;
		// tel = '+00' + tel.substr(1);
		let tel = '18989467603';
    wx.makePhoneCall({
      phoneNumber: tel
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