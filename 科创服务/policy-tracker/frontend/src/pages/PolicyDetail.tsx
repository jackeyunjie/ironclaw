import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Timeline,
  List,
  Spin,
  message,
  Space,
  Divider,
  Alert,
} from 'antd';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  FileTextOutlined,
  GiftOutlined,
  CheckCircleOutlined,
  BankOutlined,
  LinkOutlined,
  StarOutlined,
  StarFilled,
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { policyApi, enterpriseApi } from '../services/api';
import type { Policy, Enterprise } from '../types';

const PolicyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [enterprise, setEnterprise] = useState<Enterprise | null>(null);
  const [isTracked, setIsTracked] = useState(false);

  const { data: policyData, isLoading } = useQuery({
    queryKey: ['policy', id],
    queryFn: () => policyApi.getById(id!),
    enabled: !!id,
  });

  const policy: Policy | undefined = policyData?.data;

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      enterpriseApi.getByUserId(user.id).then((res: any) => {
        if (res.data) {
          setEnterprise(res.data);
          setIsTracked(res.data.trackedPolicyIds?.includes(id!) || false);
        }
      });
    }
  }, [id]);

  const handleTrackPolicy = async () => {
    if (!enterprise) {
      message.warning('请先完善企业信息');
      return;
    }
    try {
      if (isTracked) {
        await enterpriseApi.untrackPolicy(enterprise.id, id!);
        setIsTracked(false);
        message.success('已取消关注');
      } else {
        await enterpriseApi.trackPolicy(enterprise.id, id!);
        setIsTracked(true);
        message.success('关注成功');
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

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
    return days > 0 ? days : 0;
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!policy) {
    return <div>政策不存在</div>;
  }

  const daysRemaining = getDaysRemaining(policy.applyEndDate);

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/policies')}
        style={{ marginBottom: 16 }}
      >
        返回列表
      </Button>

      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 24,
          }}
        >
          <div>
            <h1 style={{ margin: 0, marginBottom: 16 }}>{policy.name}</h1>
            <Space>
              <Tag color={getStatusColor(policy.status)}>{policy.status}</Tag>
              <Tag>{policy.category}</Tag>
              <Tag color="blue">{policy.level}</Tag>
              {policy.code && <Tag>编号：{policy.code}</Tag>}
            </Space>
          </div>
          <Space>
            <Button
              icon={isTracked ? <StarFilled /> : <StarOutlined />}
              onClick={handleTrackPolicy}
            >
              {isTracked ? '已关注' : '关注政策'}
            </Button>
            {policy.status !== '已截止' && (
              <Button type="primary" size="large">
                立即申报
              </Button>
            )}
          </Space>
        </div>

        {daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0 && (
          <Alert
            message={`距离申报截止还有 ${daysRemaining} 天，请尽快准备材料`}
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Descriptions bordered column={2}>
          <Descriptions.Item label="发布部门">
            <BankOutlined /> {policy.department}
          </Descriptions.Item>
          <Descriptions.Item label="发布日期">
            <CalendarOutlined />{' '}
            {policy.publishDate
              ? new Date(policy.publishDate).toLocaleDateString()
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="申报开始">
            {policy.applyStartDate
              ? new Date(policy.applyStartDate).toLocaleDateString()
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="申报截止">
            {policy.applyEndDate
              ? new Date(policy.applyEndDate).toLocaleDateString()
              : '-'}
          </Descriptions.Item>
          {policy.officialUrl && (
            <Descriptions.Item label="官方链接" span={2}>
              <a
                href={policy.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkOutlined /> 查看官方通知
              </a>
            </Descriptions.Item>
          )}
        </Descriptions>

        <Divider />

        <h3>
          <FileTextOutlined /> 政策简介
        </h3>
        <p style={{ lineHeight: 1.8, color: '#595959' }}>
          {policy.description || '暂无简介'}
        </p>

        {policy.eligibility && policy.eligibility.length > 0 && (
          <>
            <Divider />
            <h3>
              <CheckCircleOutlined /> 申报条件
            </h3>
            <ul style={{ lineHeight: 2 }}>
              {policy.eligibility.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </>
        )}

        {policy.benefits && policy.benefits.length > 0 && (
          <>
            <Divider />
            <h3>
              <GiftOutlined /> 政策奖励
            </h3>
            <List
              dataSource={policy.benefits}
              renderItem={(benefit) => (
                <List.Item>
                  <Card style={{ width: '100%', background: '#f6ffed' }}>
                    <div style={{ color: '#52c41a', fontWeight: 500 }}>
                      {benefit.type}
                    </div>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 'bold',
                        color: '#389e0d',
                        margin: '8px 0',
                      }}
                    >
                      {benefit.amount}
                    </div>
                    <div style={{ color: '#8c8c8c' }}>{benefit.description}</div>
                  </Card>
                </List.Item>
              )}
            />
          </>
        )}

        {policy.materials && policy.materials.length > 0 && (
          <>
            <Divider />
            <h3>
              <FileTextOutlined /> 所需材料
            </h3>
            <List
              bordered
              dataSource={policy.materials}
              renderItem={(material, index) => (
                <List.Item>
                  <Space>
                    <span>{index + 1}.</span>
                    <span style={{ fontWeight: 500 }}>{material.name}</span>
                    {material.required && <Tag color="red">必需</Tag>}
                    {!material.required && <Tag>可选</Tag>}
                  </Space>
                  <div style={{ color: '#8c8c8c', marginTop: 4 }}>
                    {material.description}
                  </div>
                </List.Item>
              )}
            />
          </>
        )}

        {policy.process && policy.process.length > 0 && (
          <>
            <Divider />
            <h3>申报流程</h3>
            <Timeline
              items={policy.process.map((step) => ({
                children: (
                  <div>
                    <div style={{ fontWeight: 500 }}>{step.title}</div>
                    <div style={{ color: '#8c8c8c' }}>{step.description}</div>
                  </div>
                ),
              }))}
            />
          </>
        )}
      </Card>
    </div>
  );
};

export default PolicyDetail;