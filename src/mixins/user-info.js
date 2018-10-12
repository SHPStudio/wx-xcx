import wepy from 'wepy'

export default class UserInfoMixin extends wepy.mixin {
  data = {
    mixin: 'This is mixin data.',
    userInfoStorageKey: "userInfo"
  }
  methods = {

  }
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
  }
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
  }
}
