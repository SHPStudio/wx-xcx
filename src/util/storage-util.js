// 统一存储工具类
import wepy from 'wepy';

export default {
  getFromStorage(key, successFuc) {
    wx.getStorage({
      key: key,
      success(res) {
        console.log("成功从本地存储读取数据" + JSON.stringify(res))
        successFuc(res.data)
      },
      fail(res) {
        console.log("从本地存储读取数据失败" + JSON.stringify(res))
        successFuc(null)
      }
    })
  },
  setToStorage(key, data) {
    wx.setStorage({
      key: key,
      data: data,
      success(res) {
        console.log("存储调用成功" + JSON.stringify(res))
      },
      fail(res) {
        console.log("存储调用失败" + JSON.stringify(res))
      }
    })
  },

  getFromStorageSync(key) {
    return wx.getStorageSync(key)
  },
  setToStorageSync(key, data) {
    wx.setStorageSync(key, data)
  },

  setUserInfoToStorage(key, data) {
    var _this = this;
    wx.setStorage({
      key: key,
      data: data,
      success(res) {
        console.log("存储用户调用成功" + JSON.stringify(res))
        _this.globalData.eventBus.emit("getuser");
      },
      fail(res) {
        console.log("存储用户调用失败" + JSON.stringify(res))
      }
    })
  },

  getCodeAndLogin(sunFuc) {
    let _this = this;
    // 1.请求code
    wepy.login({
      success(res) {
        console.log("获取code: " + JSON.stringify(res))
        let code = res.code;
        // 1.请求sessionkey
        wepy.request({
          url: _this.globalData.backUrl + "login/login",
          data: code,
          method: "POST",
          success(res) {
            _this.setToStorageSync(_this.globalData.userInfoSessionKey, res.data);
            // _this.globalData.eventBus.emit("loginsuccess");
            sunFuc(true)
          },
          fail(res) {
            sunFuc(false)
          }
        })
      }
    })
  },
  login(sucFuc) {
    // 1.检查sessionkey
    let _this = this;
    this.getFromStorage(this.globalData.userInfoSessionKey, (sessionKey) => {
      if (null == sessionKey) {
        console.log("本地没有sessionkey,请求code")
        _this.getCodeAndLogin(sucFuc)
      }else {
        // 2.存在登录成功
        wepy.request({
          url: _this.globalData.backUrl + "login/getSecurity",
          data: sessionKey.sessionId,
          method: 'POST',
          success(res) {
            if (res.data) {
              console.log("sessionkey生效")
              sucFuc(true)
            }else {
              console.log("sessionkey失效")
              _this.getCodeAndLogin(sucFuc)
            }
          },
          fail(res) {
            sucFuc(false)
          }
        })
      }
    })
  },
  commonRequest(url, data, successRes, loading) {
    if (loading) {
      wx.showLoading({title: "玩儿命加载中"})
    }
    //检查sessionKey
    this.login((res) => {
      if (res) {
        console.log("sessionKey检查成功")
        let method = data == null ? 'GET': "POST";
        wepy.request({
          url: url,
          data: data,
          method: method,
          success(res) {
            console.log("成功请求")
            if (loading) {
              wx.hideLoading();
            }
            successRes(res.data)
          },
          fail(res) {
            successRes(null)
          }
        })
      }else {
        wx.showToast({title: "请求失败，请稍后重试", icon:"none"})
      }
    })
  }
}
