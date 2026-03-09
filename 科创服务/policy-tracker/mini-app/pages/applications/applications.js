const app = getApp();

Page({
  data: {
    loading: true,
    applications: [],
    activeTab: 'active',
    enterpriseId: null
  },

  onLoad() {
    this.loadEnterprise();
  },

  onShow() {
    if (this.data.enterpriseId) {
      this.loadApplications();
    }
  },

  onPullDownRefresh() {
    this.loadApplications().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  async loadEnterprise() {
    try {
      const userInfo = app.globalData.userInfo;
      if (!userInfo) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }

      const res = await app.request({
        url: `/enterprises/user/${userInfo.id}`
      });

      if (res.data) {
        this.setData({
          enterpriseId: res.data.id
        });
        this.loadApplications();
      }
    } catch (error) {
      console.error('获取企业信息失败:', error);
    }
  },

  async loadApplications() {
    if (!this.data.enterpriseId) return;

    this.setData({ loading: true });

    try {
      const res = await app.request({
        url: '/applications',
        data: {
          enterpriseId: this.data.enterpriseId
        }
      });

      const applications = (res.data?.items || []).map(item => {
        return {
          ...item,
          progressPercent: this.getProgressPercent(item.status),
          statusText: this.getStatusText(item.status),
          statusColor: this.getStatusColor(item.status)
        };
      });

      this.setData({
        applications: applications,
        loading: false
      });
    } catch (error) {
      console.error('获取申报任务失败:', error);
      this.setData({ loading: false });
      app.showError('加载失败');
    }
  },

  getProgressPercent(status) {
    const progressMap = {
      '待开始': 0,
      '准备中': 25,
      '审核中': 50,
      '待提交': 75,
      '已提交': 80,
      '已通过': 100,
      '未通过': 100,
      '已过期': 100
    };
    return progressMap[status] || 0;
  },

  getStatusText(status) {
    const textMap = {
      '待开始': '待开始',
      '准备中': '准备中',
      '审核中': '审核中',
      '待提交': '待提交',
      '已提交': '已提交',
      '已通过': '已通过',
      '未通过': '未通过',
      '已过期': '已过期'
    };
    return textMap[status] || status;
  },

  getStatusColor(status) {
    const colorMap = {
      '待开始': '#999',
      '准备中': '#1890ff',
      '审核中': '#faad14',
      '待提交': '#722ed1',
      '已提交': '#13c2c2',
      '已通过': '#52c41a',
      '未通过': '#ff4d4f',
      '已过期': '#bfbfbf'
    };
    return colorMap[status] || '#999';
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  getFilteredApplications() {
    const { applications, activeTab } = this.data;
    if (activeTab === 'active') {
      return applications.filter(app =>
        app.status !== '已通过' &&
        app.status !== '未通过' &&
        app.status !== '已过期'
      );
    } else {
      return applications.filter(app =>
        app.status === '已通过' ||
        app.status === '未通过' ||
        app.status === '已过期'
      );
    }
  },

  goToDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/application-detail/application-detail?id=${id}`
    });
  },

  goToPolicy(e) {
    const { policyId } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/policy-detail/policy-detail?id=${policyId}`
    });
  }
});
