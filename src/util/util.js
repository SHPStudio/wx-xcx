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
      this.showCustomLoading("玩儿命加载中")
    }
    let result = await this.request(url, data);

    if (result === 'notlogin') {
      console.log("没有登录")
      wx.removeStorageSync(thatParent.globalData.userInfoSessionKey);
      await LoginUtil.doLogin(thatParent);
      result = await this.request(url, data)
    }

    return result;

  },

  async commonUploadImg(url, file, thatParent) {
    thatParent.showCustomLoading("处理中....")
    let result = await this.upload(url, file);

    if (result === 'notlogin') {
      console.log("上传图片没有登录");
      wx.removeStorageSync(thatParent.globalData.userInfoSessionKey)
      await LoginUtil.doLogin(thatParent)
      result = await this.upload(url, file)
    }

    wx.hideLoading();
    return result;
  },

  request(url, data) {
    return new Promise((resolve,reject) => {
      let method = data == null ? "GET" : "POST";
      wepy.request({
        url: url,
        data: data,
        method: method,
        success(res) {
          resolve(res.data)
        },
        fail(res) {
          console.log("request error :" ,res);
          reject("request error")
        }
      })
    })
  },

  upload(url, file) {
    return new Promise((resolve,reject) => {
      wepy.uploadFile({
        url: url,
        filePath: file,
        name: 'file',
        success(res) {
          console.log("wx.uploadFile success:", res);
          resolve(res.data)
        },
        fail(res) {
          console.log("wx.uploadFile error", res);
          reject("wx.uploadFile error");
        }
      })
    })
  },

  processErrorMessage(error, content, goPage=true) {
    console.log(error);
    if (goPage) {
      if (error === "userPopModal") {
        console.log(error);
        wx.navigateTo({url: "/pages/authorizepage"});
      }else {
        // wx.navigateTo({url: "/pages/errorpage"});
        content.$invoke("loading", "showNetworkError");
      }
    }else {
      wx.showToast({'title': "系统异常请稍后重试！", duration: 2000, icon: "none"})
    }
  }
}
