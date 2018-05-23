//app.js
App({
  onLaunch: function (options) {
    // 展示本地存储能力
    // var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)
		let scene = options.scene;
		wx.setStorageSync('scene', scene);
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null,
		baseUrl: 'https://apigateway.taohaifang.com',
    // baseUrl: 'http://agtest.taohaifang.com',
    header: {
      'content-type': 'application/json',
      'lang': 'cn',
      'legalTende': 1,
      'applicationId': 2,
      'applicationClientType': 1,
      'token': ''
    },
    resUrl: {
      photo: 'http://images.photo.taohaifang.com/',          //头像 
      rentHouse: 'http://images.renthouse.taohaifang.com/',  //租房
      school: 'http://images.school.taohaifang.com/',  			 //租房
      house: 'http://images.house.taohaifang.com/',          //房子
      banner: 'http://images.taohaifang.com/',               //轮播
      encImg: 'http://images.taohaifang.com/'                //资讯百科
    },
		amap: {
			key: 'e551fa08715165f44c75d76eeb1dc46f'
		}
  }
})