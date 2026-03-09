import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  message,
  Row,
  Col,
  Statistic,
  Divider,
  Spin,
  Empty,
  Tag,
} from 'antd';
import {
  BankOutlined,
  TeamOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  EditOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { enterpriseApi } from '../services/api';
import type { Enterprise } from '../types';

const { Option } = Select;

const EnterprisePage = () => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const { data: enterpriseData, isLoading } = useQuery({
    queryKey: ['enterprise', user?.id],
    queryFn: () => enterpriseApi.getByUserId(user!.id),
    enabled: !!user?.id,
  });

  const enterprise: Enterprise | undefined = enterpriseData?.data;

  const updateMutation = useMutation({
    mutationFn: (values: any) =>
      enterprise
        ? enterpriseApi.update(enterprise.id, values)
        : enterpriseApi.create({ ...values, userId: user?.id }),
    onSuccess: () => {
      message.success(enterprise ? '更新成功' : '创建成功');
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['enterprise'] });
    },
    onError: () => {
      message.error('操作失败');
    },
  });

  const handleSubmit = async (values: any) => {
    updateMutation.mutate(values);
  };

  useEffect(() => {
    if (enterprise) {
      form.setFieldsValue(enterprise);
    }
  }, [enterprise, form]);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>企业信息</h2>

      {enterprise && !isEditing ? (
        <>
          {/* 统计概览 */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="企业规模"
                  value={enterprise.scale}
                  prefix={<TeamOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="年营收"
                  value={enterprise.annualRevenue || 0}
                  prefix={<DollarOutlined />}
                  suffix="万元"
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="已有资质"
                  value={enterprise.qualifications?.length || 0}
                  prefix={<CheckCircleOutlined />}
                  suffix="项"
                />
              </Card>
            </Col>
          </Row>

          {/* 企业详情 */}
          <Card
            title={
              <span>
                <BankOutlined /> {enterprise.name}
              </span>
            }
            extra={
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setIsEditing(true)}
              >
                编辑信息
              </Button>
            }
          >
            <Row gutter={[32, 16]}>
              <Col xs={24} sm={12}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: '#8c8c8c', marginBottom: 4 }}>
                    统一社会信用代码
                  </div>
                  <div style={{ fontSize: 16 }}>{enterprise.creditCode}</div>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: '#8c8c8c', marginBottom: 4 }}>所属行业</div>
                  <div style={{ fontSize: 16 }}>{enterprise.industry || '-'}</div>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: '#8c8c8c', marginBottom: 4 }}>注册日期</div>
                  <div style={{ fontSize: 16 }}>
                    {enterprise.registerDate
                      ? new Date(enterprise.registerDate).toLocaleDateString()
                      : '-'}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: '#8c8c8c', marginBottom: 4 }}>注册资本</div>
                  <div style={{ fontSize: 16 }}>
                    {enterprise.registerCapital
                      ? `${enterprise.registerCapital}万元`
                      : '-'}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: '#8c8c8c', marginBottom: 4 }}>员工人数</div>
                  <div style={{ fontSize: 16 }}>
                    {enterprise.employees ? `${enterprise.employees}人` : '-'}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: '#8c8c8c', marginBottom: 4 }}>研发占比</div>
                  <div style={{ fontSize: 16 }}>
                    {enterprise.rdRatio ? `${enterprise.rdRatio}%` : '-'}
                  </div>
                </div>
              </Col>
            </Row>

            <Divider />

            <div style={{ marginBottom: 16 }}>
              <div style={{ color: '#8c8c8c', marginBottom: 8 }}>已有资质</div>
              <div>
                {enterprise.qualifications && enterprise.qualifications.length > 0 ? (
                  enterprise.qualifications.map((qual, index) => (
                    <Tag key={index} color="blue" style={{ marginBottom: 8 }}>
                      {qual}
                    </Tag>
                  ))
                ) : (
                  <span style={{ color: '#8c8c8c' }}>暂无资质</span>
                )}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ color: '#8c8c8c', marginBottom: 8 }}>知识产权</div>
              <Row gutter={16}>
                <Col>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                      {enterprise.intellectualProperty?.patents || 0}
                    </div>
                    <div style={{ color: '#8c8c8c' }}>专利</div>
                  </div>
                </Col>
                <Col>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                      {enterprise.intellectualProperty?.softwareCopyrights || 0}
                    </div>
                    <div style={{ color: '#8c8c8c' }}>软著</div>
                  </div>
                </Col>
                <Col>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#722ed1' }}>
                      {enterprise.intellectualProperty?.trademarks || 0}
                    </div>
                    <div style={{ color: '#8c8c8c' }}>商标</div>
                  </div>
                </Col>
              </Row>
            </div>

            <Divider />

            <div>
              <div style={{ color: '#8c8c8c', marginBottom: 8 }}>联系人信息</div>
              <Row gutter={[32, 16]}>
                <Col xs={24} sm={8}>
                  <div>
                    <span style={{ color: '#8c8c8c' }}>姓名：</span>
                    {enterprise.contactName || '-'}
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div>
                    <span style={{ color: '#8c8c8c' }}>电话：</span>
                    {enterprise.contactPhone || '-'}
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div>
                    <span style={{ color: '#8c8c8c' }}>邮箱：</span>
                    {enterprise.contactEmail || '-'}
                  </div>
                </Col>
              </Row>
            </div>
          </Card>
        </>
      ) : (
        <Card
          title={enterprise ? '编辑企业信息' : '完善企业信息'}
          extra={
            enterprise && (
              <Button onClick={() => setIsEditing(false)}>取消</Button>
            )
          }
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={enterprise || { scale: '小型企业' }}
          >
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="企业名称"
                  name="name"
                  rules={[{ required: true, message: '请输入企业名称' }]}
                >
                  <Input placeholder="请输入企业全称" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="统一社会信用代码"
                  name="creditCode"
                  rules={[{ required: true, message: '请输入统一社会信用代码' }]}
                >
                  <Input placeholder="请输入18位统一社会信用代码" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item label="所属行业" name="industry">
                  <Input placeholder="请输入所属行业" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="企业规模" name="scale">
                  <Select>
                    <Option value="微型企业">微型企业</Option>
                    <Option value="小型企业">小型企业</Option>
                    <Option value="中型企业">中型企业</Option>
                    <Option value="大型企业">大型企业</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item label="注册资本（万元）" name="registerCapital">
                  <Input type="number" placeholder="请输入注册资本" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="员工人数" name="employees">
                  <Input type="number" placeholder="请输入员工人数" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item label="年营收（万元）" name="annualRevenue">
                  <Input type="number" placeholder="请输入年营收" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="研发费用（万元）" name="rdExpense">
                  <Input type="number" placeholder="请输入研发费用" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item label="联系人姓名" name="contactName">
                  <Input placeholder="请输入联系人姓名" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="联系人电话" name="contactPhone">
                  <Input placeholder="请输入联系人电话" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="联系人邮箱" name="contactEmail">
              <Input placeholder="请输入联系人邮箱" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={updateMutation.isPending}
                size="large"
              >
                {enterprise ? '保存修改' : '创建企业'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}
    </div>
  );
};

export default EnterprisePage;