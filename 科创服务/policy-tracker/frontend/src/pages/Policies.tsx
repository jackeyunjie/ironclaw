import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  List,
  Tag,
  Button,
  Input,
  Select,
  Space,
  Pagination,
  Spin,
  Empty,
  Badge,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { policyApi } from '../services/api';
import type { Policy } from '../types';

const { Option } = Select;

const Policies = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    keyword: '',
    category: undefined,
    level: undefined,
    status: undefined,
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['policies', filters],
    queryFn: () => policyApi.getList(filters),
  });

  const policies = data?.data?.items || [];
  const total = data?.data?.total || 0;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      即将开始: 'blue',
      申报中: 'green',
      即将截止: 'orange',
      已截止: 'default',
    };
    return colors[status] || 'default';
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { status: 'processing' | 'success' | 'warning' | 'default'; text: string }> = {
      即将开始: { status: 'processing', text: '即将开始' },
      申报中: { status: 'success', text: '申报中' },
      即将截止: { status: 'warning', text: '即将截止' },
      已截止: { status: 'default', text: '已截止' },
    };
    return statusMap[status] || { status: 'default', text: status };
  };

  const getDaysRemaining = (endDate?: string) => {
    if (!endDate) return null;
    const days = Math.ceil(
      (new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return days > 0 ? `${days}天` : '已截止';
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const categories = [
    '国家高新技术企业',
    '专精特新',
    '研发补贴',
    '人才政策',
    '融资支持',
    '税收优惠',
    '知识产权',
    '其他',
  ];

  const levels = ['国家级', '省级', '市级', '区级'];

  const statuses = ['即将开始', '申报中', '即将截止'];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>政策中心</h2>

      {/* 筛选栏 */}
      <Card style={{ marginBottom: 24 }}>
        <Space wrap>
          <Input
            placeholder="搜索政策名称"
            prefix={<SearchOutlined />}
            value={filters.keyword}
            onChange={(e) => handleFilterChange('keyword', e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            placeholder="政策类别"
            value={filters.category}
            onChange={(value) => handleFilterChange('category', value)}
            style={{ width: 150 }}
            allowClear
          >
            {categories.map((cat) => (
              <Option key={cat} value={cat}>
                {cat}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="政策级别"
            value={filters.level}
            onChange={(value) => handleFilterChange('level', value)}
            style={{ width: 120 }}
            allowClear
          >
            {levels.map((level) => (
              <Option key={level} value={level}>
                {level}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="申报状态"
            value={filters.status}
            onChange={(value) => handleFilterChange('status', value)}
            style={{ width: 120 }}
            allowClear
          >
            {statuses.map((status) => (
              <Option key={status} value={status}>
                {status}
              </Option>
            ))}
          </Select>
          <Button icon={<FilterOutlined />}>更多筛选</Button>
        </Space>
      </Card>

      {/* 政策列表 */}
      <Spin spinning={isLoading}>
        {policies.length > 0 ? (
          <>
            <List
              grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3 }}
              dataSource={policies}
              renderItem={(policy: Policy) => (
                <List.Item>
                  <Card
                    className="policy-card"
                    hoverable
                    actions={[
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/policies/${policy.id}`)}
                      >
                        查看详情
                      </Button>,
                      policy.status !== '已截止' && (
                        <Button
                          type="primary"
                          onClick={() => navigate(`/policies/${policy.id}`)}
                        >
                          立即申报
                        </Button>
                      ),
                    ].filter(Boolean)}
                  >
                    <Card.Meta
                      title={
                        <div style={{ marginBottom: 8 }}>
                          <Badge
                            status={getStatusBadge(policy.status).status as any}
                            text={getStatusBadge(policy.status).text}
                            style={{ marginBottom: 8 }}
                          />
                          <div
                            style={{
                              fontSize: 16,
                              fontWeight: 500,
                              lineHeight: 1.4,
                            }}
                          >
                            {policy.name}
                          </div>
                        </div>
                      }
                      description={
                        <div>
                          <div style={{ marginBottom: 8 }}>
                            <Tag>{policy.category}</Tag>
                            <Tag color="blue">{policy.level}</Tag>
                          </div>
                          <div
                            style={{
                              color: '#8c8c8c',
                              fontSize: 13,
                              marginBottom: 8,
                            }}
                          >
                            发布部门：{policy.department}
                          </div>
                          {policy.applyEndDate && (
                            <div
                              style={{
                                color:
                                  policy.status === '即将截止'
                                    ? '#fa8c16'
                                    : '#52c41a',
                                fontSize: 13,
                              }}
                            >
                              <ClockCircleOutlined /> 申报截止：
                              {new Date(policy.applyEndDate).toLocaleDateString()}
                              {policy.status !== '已截止' && (
                                <span style={{ marginLeft: 8 }}>
                                  (剩余 {getDaysRemaining(policy.applyEndDate)})
                                </span>
                              )}
                            </div>
                          )}
                          {policy.benefits && policy.benefits.length > 0 && (
                            <div
                              style={{
                                marginTop: 8,
                                padding: '8px 12px',
                                background: '#f6ffed',
                                borderRadius: 4,
                                color: '#52c41a',
                                fontSize: 13,
                              }}
                            >
                              💰 {policy.benefits[0].type}：
                              {policy.benefits[0].amount}
                            </div>
                          )}
                        </div>
                      }
                    />
                  </Card>
                </List.Item>
              )}
            />
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Pagination
                current={filters.page}
                pageSize={filters.limit}
                total={total}
                onChange={(page) => handleFilterChange('page', page)}
                showSizeChanger
                showTotal={(total) => `共 ${total} 条`}
              />
            </div>
          </>
        ) : (
          <Empty description="暂无政策数据" />
        )}
      </Spin>
    </div>
  );
};

export default Policies;