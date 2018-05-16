// pages/newHouseInfo/newHouseInfo.js
Page({
  data: {
    prefix: getApp().globalData.resUrl.school
  },
  onLoad: function (options) {
    let info = wx.getStorageSync('newHouseInfo');
    this.setData({ infos: info });
    if (info.index == 0) {
      wx.setNavigationBarTitle({
        title: '楼盘详情'
      });
    } else if (info.index == 1) {
      wx.setNavigationBarTitle({
        title: '物业信息'
      });
    } else if (info.index == 2) {
      wx.setNavigationBarTitle({
        title: '周边学区'
      });
    } else {
      wx.navigateBack()
    }
  }
})