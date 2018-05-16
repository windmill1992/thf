// pages/newHouseType/newHouseType.js
Page({
  data: {

  },
  onLoad: function (options) {
    let obj = wx.getStorageSync('houseTypeList');
    if (obj) {
      this.setData({ unit: obj.unit, list: obj.list });
    } else {
      wx.navigateBack()
    }
  }
})