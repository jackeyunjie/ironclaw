const app = getApp();

Page({
  data: {
    loading: true,
    userInfo: null,
    enterprise: null,
    statistics: {
      totalApplications: 0,
      approvedApplications: 0,
      totalApprovedAmount: 0,
      pendingApplications: 0
    }
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    if (this.data.userInfo) {
      this.loadData();
    }
  },

  onPullDownRefresh() {
    this.loadData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  async loadData() {
    this.setData({ loading: true });

    try {
      // 获取用户信息
      const userInfo = app.globalData.userInfo;
      if (!userInfo) {
        // 未登录，显示登录按钮
        this.setData({ loading: false });
        return;
      }

      this.setData({ userInfo });

      // 获取企业信息
      await this.loadEnterprise(userInfo.id);

      // 获取统计数据
      await this.loadStatistics();
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      this.setData({ loading: false });
    }
  },

  async loadEnterprise(userId) {
    try {
      const res = await app.request({
        url: `/enterprises/user/${userId}`
      });

      if (res.data) {
        this.setData({
          enterprise: res.data
        });
      }
    } catch (error) {
      console.error('获取企业信息失败:', error);
    }
  },

  async loadStatistics() {
    if (!this.data.enterprise) return;

    try {
      const res = await app.request({
        url: `/enterprises/${this.data.enterprise.id}/statistics`
      });

      if (res.data) {
        this.setData({
          statistics: res.data
        });
      }
    } catch (error) {
      console.error('获取统计失败:', error);
    }
  },

  // 微信登录
  wxLogin() {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        const userInfo = res.userInfo;
        // 调用后端登录接口
        this.doLogin(userInfo);
      }
    });
  },

  async doLogin(userInfo) {
    try {
      wx.login({
        success: async (loginRes) => {
          const res = await app.request({
            url: '/auth/wechat-login',
            method: 'POST',
            data: {
              code: loginRes.code,
              userInfo: userInfo
            }
          });

          if (res.data?.token) {
            wx.setStorageSync('token', res.data.token);
            app.globalData.userInfo = res.data.user;
            this.setData({ userInfo: res.data.user });
            this.loadData();
          }
        }
      });
    } catch (error) {
      console.error('登录失败:', error);
      app.showError('登录失败');
    }
  },

  // 编辑企业信息
  editEnterprise() {
    wx.navigateTo({
      url: '/pages/enterprise-edit/enterprise-edit'
    });
  },

  // 查看通知设置
  notificationSettings() {
    wx.navigateTo({
      url: '/pages/notification-settings/notification-settings'
    });
  },

  // 查看帮助
  showHelp() {
    wx.navigateTo({
      url: '/pages/help/help'
    });
  },

  // 联系我们
  contactUs() {
    wx.makePhoneCall({
      phoneNumber: '400-123-4567'
    });
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '退出后需要重新登录',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('token');
          app.globalData.userInfo = null;
          this.setData({
            userInfo: null,
            enterprise: null
          });
        }
      }
    });
  },

  // 查看申报统计
  viewApplications() {
    wx.switchTab({
      url: '/pages/applications/applications'
    });
  },

  // 查看已获批政策
  viewApproved() {
    wx.navigateTo({
      url: '/pages/applications/applications?status=approved'
    });
  }
});
