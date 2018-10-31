import wepy from 'wepy'
import LoginUtil from './login-util'

export default {
  async commonRequest(url, data, loading, that) {
    if (loading) {
      wx.showLoading({title: "玩儿命加载中"})
    }
    let result = await this.request(url, data);

    if (result === 'notlogin') {
      console.log("没有登录")
      wx.removeStorageSync(that.globalData.userInfoSessionKey)
      await LoginUtil.doLogin(that)
      result = await this.request(url, data)
    }

    return result;

  },

  request(url, data) {
    return new Promise(resolve => {
      let method = data == null ? "GET" : "POST";
      wepy.request({
        url: url,
        data: data,
        method: method,
        success(res) {
          resolve(res.data)
        }
      })
    })
  }
}
