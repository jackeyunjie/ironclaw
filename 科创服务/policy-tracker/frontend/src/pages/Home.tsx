import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Row, Col, Card, Statistic, List, Tag, Button, Spin, Empty } from 'antd';
import {
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { policyApi, enterpriseApi } from '../services/api';
import type { Policy, Enterprise } from '../types';

const Home = () => {
  const navigate = useNavigate();
  const [enterprise, setEnterprise] = useState<Enterprise | null>(null);

  // 获取企业信息
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      enterpriseApi.getByUserId(user.id).then((res: any) => {
        if (res.data) {
          setEnterprise(res.data);
        }
      });
    }
  }, []);

  // 获取匹配的政策
  const { data: matchedPolicies, isLoading: isLoadingMatched } = useQuery({
    queryKey: ['matchedPolicies', enterprise?.id],
    queryFn: () =>
      enterprise?.id
        ? policyApi.matchPolicies(enterprise.id, 5)
        : Promise.resolve({ data: { items: [] } }),
    enabled: !!enterprise?.id,
  });

  // 获取即将截止的政策
  const { data: closingPolicies, isLoading: isLoadingClosing } = useQuery({
    queryKey: ['closingPolicies'],
    queryFn: () => policyApi.getClosing(7),
  });

  // 获取即将开始的政策
  const { data: upcomingPolicies, isLoading: isLoadingUpcoming } = useQuery({
    queryKey: ['upcomingPolicies'],
    queryFn: () => policyApi.getUpcoming(7),
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      即将开始: 'blue',
      申报中: 'green',
      即将截止: 'orange',
      已截止: 'default',
    };
    return colors[status] || 'default';
  };

  const getDaysRemaining = (endDate?: string) => {
    if (!endDate) return null;
    const days = Math.ceil(
      (new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return days > 0 ? `${days}天` : '已截止';
  };

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>欢迎回来，{enterprise?.name || '企业用户'}</h2>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="匹配政策"
              value={matchedPolicies?.data?.items?.length || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="即将截止"
              value={closingPolicies?.data?.length || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="申报中"
              value={0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="累计获批"
              value={0}
              prefix={<DollarOutlined />}
              suffix="万元"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 推荐政策 */}
      <Row gutter={16}>
        <Col xs={24} lg={12} style={{ marginBottom: 16 }}>
          <Card
            title="为您推荐"
            extra={
              <Button type="link" onClick={() => navigate('/policies')}>
                查看更多 <RightOutlined />
              </Button>
            }
          >
            {isLoadingMatched ? (
              <Spin />
            ) : matchedPolicies?.data?.items?.length > 0 ? (
              <List
                dataSource={matchedPolicies.data.items}
                renderItem={(policy: Policy) => (
                  <List.Item
                    actions={[
                      <Tag color={getStatusColor(policy.status)}>{policy.status}</Tag>,
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => navigate(`/policies/${policy.id}`)}
                      >
                        查看
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>{policy.name}</span>
                          {policy.matchScore && (
                            <Tag color="blue">匹配度 {policy.matchScore}分</Tag>
                          )}
                        </div>
                      }
                      description={
                        <div>
                          <Tag>{policy.category}</Tag>
                          <Tag>{policy.level}</Tag>
                          {policy.applyEndDate && (
                            <span style={{ color: '#fa8c16', marginLeft: 8 }}>
                              剩余 {getDaysRemaining(policy.applyEndDate)}
                            </span>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无匹配政策，请完善企业信息" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="即将截止"
            extra={
              <Button type="link" onClick={() => navigate('/policies')}>
                查看更多 <RightOutlined />
              </Button>
            }
          >
            {isLoadingClosing ? (
              <Spin />
            ) : closingPolicies?.data?.length > 0 ? (
              <List
                dataSource={closingPolicies.data}
                renderItem={(policy: Policy) => (
                  <List.Item
                    actions={[
                      <Button
                        type="primary"
                        size="small"
                        danger
                        onClick={() => navigate(`/policies/${policy.id}`)}
                      >
                        立即申报
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={policy.name}
                      description={
                        <div>
                          <Tag>{policy.category}</Tag>
                          <span style={{ color: '#fa8c16' }}>
                            <ClockCircleOutlined /> 剩余{' '}
                            {getDaysRemaining(policy.applyEndDate)}
                          </span>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无即将截止的政策" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;