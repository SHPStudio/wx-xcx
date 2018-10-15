import wepy from 'wepy'

export default class extends wepy.mixin {
  data = {
  }
  methods = {

  }

  getUserInfo() {
    this.$invoke('zanDialog', 'showZanDialog', {
      title: '认证',
      content: '请先认证信息',
      buttons:[
        {
          text: '取消',
          type: 'cancel'
        },
        {
          text: '授权',
          type: 'xxxx',
          opentype: "getUserInfo"
        }
      ]
    }).then((e) => {
      //把信息存到本地缓存里
      this.$parent.setUserInfoToStorage(this.$parent.globalData.userInfoStorageKey, e.detail.userInfo)
    }).catch(() => {
      console.log('=== dialog ===', 'type: cancel')
    })
  }
  getUserSetting() {
    var _this = this;
    wx.getSetting({
      success(res) {
        let authSetting = res.authSetting;
        if (authSetting["scope.userInfo"]) {
          // 1.已经授权过默认获取用户信息
          _this.getUserInfoSlience()
        }else {
          // 2.如果没有需要授权
          _this.getUserInfo()
        }
      }
    })
  }

  getUserInfoSlience() {
    var _this = this;
    wx.getUserInfo({
      success(res) {
        console.log("静默获取用户信息:" + JSON.stringify(res.userInfo))
        _this.$parent.setUserInfoToStorage(_this.$parent.globalData.userInfoStorageKey, res.userInfo);
      }
    })
  }

  onLoad() {
    var _this = this;
    // 1. 先检查缓存中存不存在
    _this.$parent.getFromStorage(_this.$parent.globalData.userInfoStorageKey,(res) => {
      if (res == null) {
        console.log("未授权开始执行授权处理")
        // 获取授权设置
        _this.getUserSetting()
      }else {
        console.log("已有授权信息进行登录")
        _this.$parent.globalData.eventBus.emit("getuser");
      }
    });
  }
}
