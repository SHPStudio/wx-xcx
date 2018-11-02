import wepy from 'wepy'
import LoginUtil from './login-util'

export default {

  showErrorToast(msg, time=2000) {
    wx.showToast({'title': msg, duration: time, icon: "none"})
  },
  showSuccessToast(msg, time=2000) {
    wx.showToast({'title': msg, duration: time, icon: "success"})
  },
  showCustomLoading(msg, mask=true) {
    wx.showLoading({title: msg, mask: mask})
  },

  async commonRequest(url, data, loading, thatParent) {
    if (loading) {
      wx.showLoading({title: "玩儿命加载中"})
    }
    let result = await this.request(url, data);

    if (result === 'notlogin') {
      console.log("没有登录")
      wx.removeStorageSync(thatParent.globalData.userInfoSessionKey)
      await LoginUtil.doLogin(thatParent)
      result = await this.request(url, data)
    }

    return result;

  },

  async commonUploadImg(url, file, that) {
    that.$parent.showCustomLoading("处理中....")
    let result = await this.upload(url, file);

    if (result === 'notlogin') {
      console.log("上传图片没有登录");
      wx.removeStorageSync(that.globalData.userInfoSessionKey)
      await LoginUtil.doLogin(that)
      result = await this.upload(url, file)
    }

    wx.hideLoading();
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
        },
        fail(res) {
          resolve(null)
        }
      })
    })
  },

  upload(url, file) {
    return new Promise(resolve => {
      wepy.uploadFile({
        url: url,
        filePath: file,
        name: 'file',
        success(res) {
          resolve(res.data)
        },
        fail(res) {
          resolve(null)
        }
      })
    })
  }
}
