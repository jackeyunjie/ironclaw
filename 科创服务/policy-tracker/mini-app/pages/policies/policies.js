const app = getApp();

Page({
  data: {
    loading: false,
    keyword: '',
    policies: [],
    page: 1,
    limit: 10,
    hasMore: true,
    
    // 筛选
    showFilterPopup: false,
    categories: ['国家高新技术企业', '专精特新', '研发补贴', '人才政策', '融资支持', '税收优惠', '知识产权', '其他'],
    levels: ['国家级', '省级', '市级', '区级'],
    statuses: ['即将开始', '申报中', '即将截止'],
    selectedCategory: '',
    selectedLevel: '',
    selectedStatus: '',
    selectedFilters: []
  },

  onLoad() {
    this.loadPolicies();
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMore();
    }
  },

  onPullDownRefresh() {
    this.setData({ page: 1, policies: [], hasMore: true });
    this.loadPolicies().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  async loadPolicies() {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    
    try {
      const params = {
        page: this.data.page,
        limit: this.data.limit,
        ...(this.data.keyword && { keyword: this.data.keyword }),
        ...(this.data.selectedCategory && { category: this.data.selectedCategory }),
        ...(this.data.selectedLevel && { level: this.data.selectedLevel }),
        ...(this.data.selectedStatus && { status: this.data.selectedStatus })
      };
      
      const res = await app.request({
        url: '/policies',
        data: params
      });
      
      const policies = (res.data?.items || []).map(policy => {
        return {
          ...policy,
          daysRemaining: this.calculateDaysRemaining(policy.applyEndDate)
        };
      });
      
      this.setData({
        policies: this.data.page === 1 ? policies : [...this.data.policies, ...policies],
        hasMore: policies.length === this.data.limit
      });
    } catch (error) {
      console.error('加载政策失败:', error);
      app.showError('加载失败');
    } finally {
      this.setData({ loading: false });
    }
  },

  loadMore() {
    this.setData({ page: this.data.page + 1 });
    this.loadPolicies();
  },

  calculateDaysRemaining(endDate) {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  },

  onKeywordInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch() {
    this.setData({ page: 1, policies: [], hasMore: true });
    this.loadPolicies();
  },

  // 筛选相关
  showFilter() {
    this.setData({ showFilterPopup: true });
  },

  hideFilter() {
    this.setData({ showFilterPopup: false });
  },

  stopPropagation() {
    // 阻止事件冒泡
  },

  selectCategory(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({
      selectedCategory: this.data.selectedCategory === value ? '' : value
    });
  },

  selectLevel(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({
      selectedLevel: this.data.selectedLevel === value ? '' : value
    });
  },

  selectStatus(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({
      selectedStatus: this.data.selectedStatus === value ? '' : value
    });
  },

  resetFilter() {
    this.setData({
      selectedCategory: '',
      selectedLevel: '',
      selectedStatus: ''
    });
  },

  confirmFilter() {
    const filters = [];
    if (this.data.selectedCategory) filters.push(this.data.selectedCategory);
    if (this.data.selectedLevel) filters.push(this.data.selectedLevel);
    if (this.data.selectedStatus) filters.push(this.data.selectedStatus);
    
    this.setData({
      selectedFilters: filters,
      showFilterPopup: false,
      page: 1,
      policies: [],
      hasMore: true
    });
    
    this.loadPolicies();
  },

  removeFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    const newFilters = this.data.selectedFilters.filter(f => f !== filter);
    
    // 更新对应的筛选条件
    if (this.data.categories.includes(filter)) {
      this.setData({ selectedCategory: '' });
    } else if (this.data.levels.includes(filter)) {
      this.setData({ selectedLevel: '' });
    } else if (this.data.statuses.includes(filter)) {
      this.setData({ selectedStatus: '' });
    }
    
    this.setData({
      selectedFilters: newFilters,
      page: 1,
      policies: [],
      hasMore: true
    });
    
    this.loadPolicies();
  },

  clearFilters() {
    this.setData({
      selectedCategory: '',
      selectedLevel: '',
      selectedStatus: '',
      selectedFilters: [],
      page: 1,
      policies: [],
      hasMore: true
    });
    
    this.loadPolicies();
  },

  goToDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/policy-detail/policy-detail?id=${id}`
    });
  }
});