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
      // 从微信获取code
      const code = await this.getCodeFromWx();
      console.log("获取code" + code);
      // 吧code传给开发服务器
      const sessionValue = await this.getSessionIdFromServer(code, thatParent)
      console.log("获取sessionValue:", sessionValue)
    }else {
      console.log("已存在登录信息")
    }
    return true
  },

  async getUserInfo(that, useAutorize=true) {
    console.log("开始获取用户信息")
    console.log("检查是否有用户信息")
    let userInfo = await Util.commonRequest(that.$parent.globalData.backUrl + "user/getUserInfo",null,false, that.$parent);
    console.log("用户信息：", userInfo)
    if (userInfo == null || userInfo === "") {
      console.log("没有用户信息，检查是否有授权");
      // 检查是否授权
      let isAuthorize = await this.checkAuthorize();
      if (isAuthorize) {
        let tempUserInfo = wx.getStorageSync(that.$parent.globalData.userInfoStorageKey);
        if (tempUserInfo != null && tempUserInfo != "") {
          console.log("从缓存中读取")
          return tempUserInfo;
        }
        // 已授权静默获取
        userInfo = await this.getUserInfoSlience()
        wx.setStorageSync(that.$parent.globalData.userInfoStorageKey, userInfo);
      }else {
        // 弹窗授权
        if (useAutorize) {
          userInfo = await this.getUserInfoPopModal(that)
          wx.setStorageSync(that.$parent.globalData.userInfoStorageKey, userInfo);
        }
      }
    }
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
              res.data.userInfo = null;
              let sessionValue = res.data;
              wx.setStorageSync(thatParent.globalData.userInfoSessionKey, sessionValue);
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
