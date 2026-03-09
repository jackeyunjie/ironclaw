import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Row,
  Col,
  Card,
  Statistic,
  List,
  Tag,
  Button,
  Spin,
  Empty,
  Progress,
  Timeline,
  Alert,
} from 'antd';
import {
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  RightOutlined,
  RiseOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { policyApi, enterpriseApi, applicationApi } from '../services/api';
import type { Policy, Enterprise, ApplicationTask } from '../types';

const Dashboard = () => {
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

  // 获取申报任务
  const { data: applications, isLoading: isLoadingApps } = useQuery({
    queryKey: ['applications', enterprise?.id],
    queryFn: () =>
      enterprise?.id
        ? applicationApi.getByEnterprise(enterprise.id)
        : Promise.resolve({ data: { items: [] } }),
    enabled: !!enterprise?.id,
  });

  // 政策类别分布数据
  const categoryData = matchedPolicies?.data?.items
    ? Object.entries(
        matchedPolicies.data.items.reduce((acc: any, policy: Policy) => {
          acc[policy.category] = (acc[policy.category] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value }))
    : [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

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

  const getProgressPercent = (status: string) => {
    const progressMap: Record<string, number> = {
      '待开始': 0,
      '准备中': 25,
      '审核中': 50,
      '已提交': 75,
      '已通过': 100,
    };
    return progressMap[status] || 0;
  };

  const pendingApplications = applications?.data?.items?.filter(
    (app: ApplicationTask) => app.status !== '已通过' && app.status !== '未通过'
  ) || [];

  return (
    <div>
      {/* 欢迎语 */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>
          欢迎回来，{enterprise?.name || '企业用户'}
          <Tag color="blue" style={{ marginLeft: 12 }}>{enterprise?.industry || '科技行业'}</Tag>
        </h2>
        <p style={{ color: '#8c8c8c', marginTop: 8 }}>
          今天有 {closingPolicies?.data?.length || 0} 条政策即将截止，请及时关注
        </p>
      </div>

      {/* 紧急提醒 */}
      {closingPolicies?.data?.length > 0 && (
        <Alert
          message="申报提醒"
          description={`有 ${closingPolicies.data.length} 条政策将在7天内截止申报，请尽快完成材料准备`}
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          action={
            <Button size="small" danger onClick={() => navigate('/policies?status=即将截止')}>
              立即查看
            </Button>
          }
          style={{ marginBottom: 24 }}
        />
      )}

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="匹配政策"
              value={matchedPolicies?.data?.items?.length || 0}
              prefix={<FileTextOutlined />}
              suffix="项"
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: 8, color: '#52c41a', fontSize: 12 }}>
              <RiseOutlined /> 较上周 +12%
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="即将截止"
              value={closingPolicies?.data?.length || 0}
              prefix={<ClockCircleOutlined />}
              suffix="项"
              valueStyle={{ color: '#fa8c16' }}
            />
            <div style={{ marginTop: 8, color: '#fa8c16', fontSize: 12 }}>
              需立即关注
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="申报中"
              value={pendingApplications.length}
              prefix={<CheckCircleOutlined />}
              suffix="项"
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ marginTop: 8, color: '#8c8c8c', fontSize: 12 }}>
              平均进度 {Math.round(
                pendingApplications.reduce((sum: number, app: ApplicationTask) =>
                  sum + getProgressPercent(app.status), 0
                ) / (pendingApplications.length || 1)
              )}%
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="累计获批"
              value={enterprise?.totalApprovedAmount || 0}
              prefix={<DollarOutlined />}
              suffix="万元"
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ marginTop: 8, color: '#52c41a', fontSize: 12 }}>
              <RiseOutlined /> 今年 +85万
            </div>
          </Card>
        </Col>
      </Row>

      {/* 数据可视化和列表 */}
      <Row gutter={16}>
        {/* 政策类别分布 */}
        <Col xs={24} lg={8} style={{ marginBottom: 16 }}>
          <Card title="政策类别分布" style={{ height: 400 }}>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="暂无数据" style={{ marginTop: 100 }} />
            )}
          </Card>
        </Col>

        {/* 推荐政策 */}
        <Col xs={24} lg={8} style={{ marginBottom: 16 }}>
          <Card
            title="为您推荐"
            extra={
              <Button type="link" onClick={() => navigate('/policies')}>
                查看更多 <RightOutlined />
              </Button>
            }
            style={{ height: 400, overflow: 'auto' }}
          >
            {isLoadingMatched ? (
              <Spin />
            ) : matchedPolicies?.data?.items?.length > 0 ? (
              <List
                dataSource={matchedPolicies.data.items.slice(0, 5)}
                renderItem={(policy: Policy) => (
                  <List.Item
                    actions={[
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
                        <div style={{ fontSize: 13 }}>
                          {policy.name}
                          {policy.matchScore && (
                            <Tag color="blue" style={{ marginLeft: 8 }}>
                              {policy.matchScore}分
                            </Tag>
                          )}
                        </div>
                      }
                      description={
                        <Tag size="small">{policy.category}</Tag>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无匹配政策" />
            )}
          </Card>
        </Col>

        {/* 即将截止 */}
        <Col xs={24} lg={8} style={{ marginBottom: 16 }}>
          <Card
            title="即将截止"
            extra={
              <Button type="link" onClick={() => navigate('/policies?status=即将截止')}>
                查看更多 <RightOutlined />
              </Button>
            }
            style={{ height: 400, overflow: 'auto' }}
          >
            {isLoadingClosing ? (
              <Spin />
            ) : closingPolicies?.data?.length > 0 ? (
              <List
                dataSource={closingPolicies.data.slice(0, 5)}
                renderItem={(policy: Policy) => (
                  <List.Item
                    actions={[
                      <Button
                        type="primary"
                        size="small"
                        danger
                        onClick={() => navigate(`/policies/${policy.id}`)}
                      >
                        申报
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <div style={{ fontSize: 13 }}>{policy.name}</div>
                      }
                      description={
                        <span style={{ color: '#fa8c16', fontSize: 12 }}>
                          <ClockCircleOutlined /> 剩余 {getDaysRemaining(policy.applyEndDate)}
                        </span>
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

      {/* 申报进度 */}
      {pendingApplications.length > 0 && (
        <Card title="申报进度跟踪" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            {pendingApplications.slice(0, 4).map((app: ApplicationTask) => (
              <Col xs={24} sm={12} lg={6} key={app.id}>
                <Card size="small" style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 500, marginBottom: 8 }}>
                    {app.policyName || '政策申报'}
                  </div>
                  <Progress
                    percent={getProgressPercent(app.status)}
                    status={app.status === '已驳回' ? 'exception' : 'active'}
                  />
                  <div style={{ color: '#8c8c8c', fontSize: 12, marginTop: 8 }}>
                    状态：{app.status}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
