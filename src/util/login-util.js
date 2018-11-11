import wepy from 'wepy'
import Util from './util'

export default {
  /**
   * 执行登录计划
   * @returns {Promise<void>}
   */
  async doLogin(thatParent) {
    console.log("进行登录", thatParent);
    let userSession = wx.getStorageSync(thatParent.globalData.userInfoSessionKey)
    console.log("session", userSession);
    if (null == userSession || userSession == "") {
      const code = await this.getCodeFromWx();
      console.log("获取code" + code);
      const sessionValue = await this.getSessionIdFromServer(code, thatParent)
      console.log("获取sessionValue:", sessionValue)
    }else {
      console.log("已存在登录信息")
    }
    return true
  },

  async getUserInfo(that, useAutorize=true) {
    console.log("开始获取用户信息")
    let userInfo = wx.getStorageSync(that.$parent.globalData.userInfoStorageKey)
    if (null == userInfo || userInfo == "") {
      let userSession = wx.getStorageSync(that.$parent.globalData.userInfoSessionKey)
      if (null == userSession || userSession == "") {
        console.log("获取用户信息时没有登录态信息 极少数情况")
        await this.doLogin(that.$parent)
        userSession = wx.getStorageSync(that.$parent.globalData.userInfoSessionKey)
      }

      if (userSession.level == "user") {
        // 请求服务器获取
        userInfo = await Util.commonRequest(that.$parent.globalData.backUrl + "user/getUserInfo",null,false, that.$parent, true);
      }else {
        // 检查是否授权
        let isAuthorize = await this.checkAuthorize();
        if (isAuthorize) {
          // 已授权静默获取
          userInfo = await this.getUserInfoSlience()
        }else {
          // 弹窗授权
          if (useAutorize) {
            userInfo = await this.getUserInfoPopModal(that)
          }
        }
      }
    }
    wx.setStorageSync(that.$parent.globalData.userInfoStorageKey, userInfo)
    return userInfo;
  },

  /**
   * 从微信服务器获取登录code
   * @returns {Promise<any>}
   */
  getCodeFromWx() {
    return new Promise((resolve, reject) => {
      console.log("调用getCodeFromWx")
      wepy.login({
        success(res) {
          if(res.code) {
            resolve(res.code)
          }else {
            resolve(null)
          }
        },
        fail(res) {
          console.log("wx.login fail: ", res)
          reject("wx.login error");
        }
      })
    })
  },

  getSessionIdFromServer(code, thatParent) {
    if (code == null)
      return null;

    return new Promise((resolve,reject) => {
      console.log("调用getSessionIdFromServer", code, thatParent)
      wepy.request({
        url: thatParent.globalData.backUrl + "login/login",
        data: code,
        method: "POST",
        success(res) {
          try {
            if (res && res.data) {
              let userInfo = res.data.userInfo;
              res.data.userInfo = null;
              let sessionValue = res.data;
              wx.setStorageSync(thatParent.globalData.userInfoSessionKey, sessionValue);
              if (null != userInfo) {
                wx.setStorageSync(thatParent.globalData.userInfoStorageKey, userInfo)
              }
              resolve(res.data);
            } else {
              console.log("调用getSessionIdFromServer fail :", res)
              resolve(null)
            }
          } catch (e) {
            console.log("调用getSessionIdFromServer fail :", e)
            resolve(null)
          }
        },
        fail(res) {
          console.log("server.login error:", res);
          reject("server.login error");
        }
      })
    })
  },

  checkAuthorize() {
    return new Promise(resolve => {
      wx.getSetting({
        success(res) {
          let authSetting = res.authSetting;
          resolve(authSetting["scope.userInfo"])
        }
      })
    })
  },

  getUserInfoSlience() {
    return new Promise(resolve => {
      wx.getUserInfo({
        success(res) {
          resolve(res.userInfo)
        }
      })
    })
  },

  getUserInfoPopModal(that) {
    return new Promise((resolve,reject) => {
      reject("userPopModal")
    })
  }

}
