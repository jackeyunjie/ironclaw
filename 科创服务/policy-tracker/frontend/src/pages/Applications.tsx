import { useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Progress,
  Space,
  Empty,
  Steps,
  Timeline,
} from 'antd';
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  EditOutlined,
} from '@ant-design/icons';
import type { ApplicationTask } from '../types';

const { Step } = Steps;

const Applications = () => {
  const [selectedTask, setSelectedTask] = useState<ApplicationTask | null>(null);

  // 模拟数据
  const tasks: ApplicationTask[] = [
    {
      id: '1',
      enterpriseId: '1',
      policyId: '1',
      status: '准备中',
      progress: 60,
      materials: [
        { materialId: '1', name: '营业执照', status: 'uploaded' },
        { materialId: '2', name: '财务报表', status: 'uploaded' },
        { materialId: '3', name: '项目计划书', status: 'pending' },
      ],
      startedAt: '2026-02-15',
      createdAt: '2026-02-15',
      updatedAt: '2026-02-20',
    },
    {
      id: '2',
      enterpriseId: '1',
      policyId: '2',
      status: '审核中',
      progress: 80,
      materials: [
        { materialId: '1', name: '营业执照', status: 'uploaded' },
        { materialId: '2', name: '审计报告', status: 'uploaded' },
      ],
      startedAt: '2026-01-10',
      submittedAt: '2026-01-20',
      createdAt: '2026-01-10',
      updatedAt: '2026-02-01',
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      待开始: 'default',
      准备中: 'processing',
      审核中: 'warning',
      已提交: 'success',
      已通过: 'success',
      未通过: 'error',
      已过期: 'default',
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      待开始: <ClockCircleOutlined />,
      准备中: <EditOutlined />,
      审核中: <FileTextOutlined />,
      已提交: <CheckCircleOutlined />,
      已通过: <CheckCircleOutlined />,
      未通过: <CloseCircleOutlined />,
      已过期: <ClockCircleOutlined />,
    };
    return icons[status] || null;
  };

  const columns = [
    {
      title: '申报项目',
      dataIndex: 'policyId',
      key: 'policyId',
      render: (policyId: string) => `政策项目 ${policyId}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <Progress percent={progress} size="small" />
      ),
    },
    {
      title: '开始时间',
      dataIndex: 'startedAt',
      key: 'startedAt',
      render: (date: string) => (date ? new Date(date).toLocaleDateString() : '-'),
    },
    {
      title: '提交时间',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (date: string) => (date ? new Date(date).toLocaleDateString() : '-'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ApplicationTask) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => setSelectedTask(record)}
          >
            查看
          </Button>
          {record.status === '准备中' && (
            <Button type="primary" size="small">
              继续申报
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const getCurrentStep = (status: string) => {
    const steps: Record<string, number> = {
      待开始: 0,
      准备中: 1,
      审核中: 2,
      已提交: 3,
      已通过: 4,
      未通过: 4,
    };
    return steps[status] || 0;
  };

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>申报管理</h2>

      {!selectedTask ? (
        <>
          {/* 状态统计 */}
          <Card style={{ marginBottom: 24 }}>
            <Space size="large">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#1890ff' }}>
                  {tasks.length}
                </div>
                <div style={{ color: '#8c8c8c' }}>全部申报</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#fa8c16' }}>
                  {tasks.filter((t) => ['待开始', '准备中'].includes(t.status)).length}
                </div>
                <div style={{ color: '#8c8c8c' }}>进行中</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#52c41a' }}>
                  {tasks.filter((t) => t.status === '已通过').length}
                </div>
                <div style={{ color: '#8c8c8c' }}>已通过</div>
              </div>
            </Space>
          </Card>

          {/* 申报列表 */}
          <Card title="申报记录">
            {tasks.length > 0 ? (
              <Table
                columns={columns}
                dataSource={tasks}
                rowKey="id"
                pagination={false}
              />
            ) : (
              <Empty description="暂无申报记录" />
            )}
          </Card>
        </>
      ) : (
        <Card
          title="申报详情"
          extra={
            <Button onClick={() => setSelectedTask(null)}>返回列表</Button>
          }
        >
          <Steps
            current={getCurrentStep(selectedTask.status)}
            status={selectedTask.status === '未通过' ? 'error' : 'process'}
            style={{ marginBottom: 32 }}
          >
            <Step title="待开始" description="准备申报材料" />
            <Step title="准备中" description="上传所需材料" />
            <Step title="审核中" description="等待审核结果" />
            <Step title="已提交" description="提交申报材料" />
            <Step
              title={selectedTask.status === '未通过' ? '未通过' : '已通过'}
              description={
                selectedTask.status === '已通过'
                  ? `获批金额：${selectedTask.approvedAmount}万元`
                  : selectedTask.resultComment || '等待结果'
              }
            />
          </Steps>

          <h3 style={{ marginBottom: 16 }}>材料清单</h3>
          <Timeline
            items={
              selectedTask.materials?.map((material) => ({
                color:
                  material.status === 'uploaded'
                    ? 'green'
                    : material.status === 'verified'
                    ? 'blue'
                    : 'gray',
                children: (
                  <div>
                    <div style={{ fontWeight: 500 }}>{material.name}</div>
                    <div>
                      <Tag
                        color={
                          material.status === 'uploaded'
                            ? 'success'
                            : material.status === 'verified'
                            ? 'processing'
                            : 'default'
                        }
                      >
                        {material.status === 'uploaded'
                          ? '已上传'
                          : material.status === 'verified'
                          ? '已审核'
                          : '待上传'}
                      </Tag>
                    </div>
                  </div>
                ),
              })) || []
            }
          />

          {selectedTask.status === '准备中' && (
            <div style={{ marginTop: 24 }}>
              <Button type="primary" size="large">
                上传材料
              </Button>
              <Button style={{ marginLeft: 16 }} size="large">
                提交申报
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default Applications;