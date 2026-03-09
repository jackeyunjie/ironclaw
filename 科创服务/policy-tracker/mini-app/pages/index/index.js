const app = getApp();

Page({
  data: {
    loading: true,
    enterpriseName: '',
    enterpriseScale: '',
    matchedCount: 0,
    closingCount: 0,
    applyingCount: 0,
    matchedPolicies: [],
    closingPolicies: [],
    enterpriseId: null
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    // 每次显示页面时刷新数据
    if (this.data.enterpriseId) {
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
        // 未登录，跳转到登录页
        return;
      }

      // 获取企业信息
      await this.loadEnterprise(userInfo.id);
      
      // 获取统计数据
      await this.loadStatistics();
      
      // 获取推荐政策
      await this.loadMatchedPolicies();
      
      // 获取即将截止的政策
      await this.loadClosingPolicies();
      
    } catch (error) {
      console.error('加载数据失败:', error);
      app.showError('加载失败');
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
          enterpriseId: res.data.id,
          enterpriseName: res.data.name,
          enterpriseScale: res.data.scale
        });
      }
    } catch (error) {
      console.error('获取企业信息失败:', error);
    }
  },

  async loadStatistics() {
    if (!this.data.enterpriseId) return;
    
    try {
      const res = await app.request({
        url: `/enterprises/${this.data.enterpriseId}/statistics`
      });
      
      this.setData({
        applyingCount: res.data?.pendingApplications || 0
      });
    } catch (error) {
      console.error('获取统计失败:', error);
    }
  },

  async loadMatchedPolicies() {
    if (!this.data.enterpriseId) return;
    
    try {
      const res = await app.request({
        url: '/policies/match',
        data: {
          enterpriseId: this.data.enterpriseId,
          limit: 5
        }
      });
      
      const policies = (res.data?.items || []).map(policy => {
        return {
          ...policy,
          daysRemaining: this.calculateDaysRemaining(policy.applyEndDate)
        };
      });
      
      this.setData({
        matchedPolicies: policies,
        matchedCount: res.data?.total || 0
      });
    } catch (error) {
      console.error('获取匹配政策失败:', error);
    }
  },

  async loadClosingPolicies() {
    try {
      const res = await app.request({
        url: '/policies/closing',
        data: { days: 7 }
      });
      
      const policies = (res.data || []).map(policy => {
        return {
          ...policy,
          daysRemaining: this.calculateDaysRemaining(policy.applyEndDate)
        };
      });
      
      this.setData({
        closingPolicies: policies.slice(0, 3),
        closingCount: res.data?.length || 0
      });
    } catch (error) {
      console.error('获取即将截止政策失败:', error);
    }
  },

  calculateDaysRemaining(endDate) {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  },

  goToPolicies() {
    wx.switchTab({
      url: '/pages/policies/policies'
    });
  },

  goToPolicyDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/policy-detail/policy-detail?id=${id}`
    });
  },

  goToEnterprise() {
    wx.switchTab({
      url: '/pages/enterprise/enterprise'
    });
  }
});