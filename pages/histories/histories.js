// pages/histories/histories.js
Page({
  data: {
    houseList: []
  },
  onLoad: function (options) {
    let code = wx.getStorageSync('regionCode');
    let arr = wx.getStorageSync(code);
    let c = code.substr(0, 2);
    let unit = c == 'ca' ? 'C$' : (c == 'us' ? '$' : 'A$');
    if(arr && arr.length > 0){
      this.setData({houseList: arr, unit: unit});
    }else{
      let city = wx.getStorageSync('city');
      this.setData({ city: city});
    }
  }
})