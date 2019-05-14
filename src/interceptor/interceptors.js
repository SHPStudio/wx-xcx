// 统一拦截器
export default {
  request: {
    // 发出请求时的回调函数
    config (p) {
      // 对所有request请求中的OBJECT参数对象统一附加时间戳属性
      let url = p.url;
      if (!url.includes("login")) {//登录是要获取登录信息，其他的时候已经处于登陆状态了，不需要在获取，如果url有登录信息就
        let session = wx.getStorageSync(this.globalData.userInfoSessionKey);
        console.log(session)
        p.header = {sessionId: session.sessionId}
      }
      // 必须返回OBJECT参数对象，否则无法发送请求到服务端
      return p;
    },

    // 请求成功后的回调函数
    success (p) {
      // 可以在这里对收到的响应数据对象进行加工处理
      // 必须返回响应数据对象，否则后续无法对响应数据进行处理
      return p;
    },

    //请求失败后的回调函数
    fail (p) {
      console.log('request fail: ', p);
      // 必须返回响应数据对象，否则后续无法对响应数据进行处理
      return p;
    },

    // 请求完成时的回调函数(请求成功或失败都会被执行)
    complete (p) {
    }
  },
  uploadFile: {
    // 发出请求时的回调函数
    config (p) {
      // 对所有request请求中的OBJECT参数对象统一附加时间戳属性
      let url = p.url;
      if (!url.includes("login")) {
        let session = wx.getStorageSync(this.globalData.userInfoSessionKey);
        console.log(session)
        p.header = {sessionId: session.sessionId}
      }
      // 必须返回OBJECT参数对象，否则无法发送请求到服务端
      return p;
    },

    // 请求成功后的回调函数
    success (p) {
      // 可以在这里对收到的响应数据对象进行加工处理
      // 必须返回响应数据对象，否则后续无法对响应数据进行处理
      return p;
    },

    //请求失败后的回调函数
    fail (p) {
      console.log('uploadFile fail: ', p);
      // 必须返回响应数据对象，否则后续无法对响应数据进行处理
      return p;
    }
  }
}
