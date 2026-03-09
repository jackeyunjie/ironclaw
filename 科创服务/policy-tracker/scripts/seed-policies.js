/**
 * 政策数据种子脚本
 * 用于导入初始政策数据
 */

const policies = [
  {
    name: '2026年国家高新技术企业认定',
    code: 'GX2026001',
    category: '国家高新技术企业',
    level: '国家级',
    department: '科技部火炬中心',
    description: '组织开展2026年度国家高新技术企业认定工作，支持企业享受税收优惠政策',
    eligibility: [
      '在中国境内（不含港、澳、台地区）注册成立一年以上的居民企业',
      '拥有核心自主知识产权，对其主要产品（服务）的核心技术拥有自主知识产权',
      '技术属于《国家重点支持的高新技术领域》规定的范围',
      '科技人员占企业当年职工总数的比例不低于10%',
      '近三个会计年度的研究开发费用总额占同期销售收入总额的比例符合要求',
      '近一年高新技术产品（服务）收入占企业同期总收入的比例不低于60%'
    ],
    benefits: [
      { type: '税收优惠', amount: '所得税减按15%', description: '企业所得税税率从25%降至15%' },
      { type: '资质认定', amount: '', description: '获得国家级高新技术企业资质证书' }
    ],
    materials: [
      { name: '高新技术企业认定申请书', required: true, description: '在线填写后导出打印，加盖公章' },
      { name: '营业执照副本', required: true, description: '复印件加盖公章' },
      { name: '知识产权证书', required: true, description: '专利证书、软件著作权证书等' },
      { name: '研发费用专项审计报告', required: true, description: '具有资质的中介机构出具' },
      { name: '高新技术产品收入专项审计报告', required: true, description: '具有资质的中介机构出具' },
      { name: '企业职工和科技人员情况说明', required: true, description: '包括在职、兼职和临时聘用人员' }
    ],
    applyStartDate: '2026-03-01',
    applyEndDate: '2026-09-30',
    validUntil: '2029-09-30',
    officialUrl: 'http://www.innocom.gov.cn/',
    region: '全国',
    industries: ['电子信息', '生物与新医药', '航空航天', '新材料', '高技术服务', '新能源与节能', '资源与环境', '先进制造与自动化']
  },
  {
    name: '北京市专精特新"小巨人"企业认定',
    code: 'ZJX2026001',
    category: '专精特新',
    level: '市级',
    department: '北京市经济和信息化局',
    description: '支持中小企业向专业化、精细化、特色化、新颖化方向发展，培育一批专精特新"小巨人"企业',
    eligibility: [
      '在北京市注册成立，具有独立法人资格',
      '从事特定细分市场时间达到2年以上',
      '上年度研发费用总额不低于100万元，且占营业收入总额比重不低于3%',
      '上年度营业收入总额在1000万元以上，或上年度营业收入总额在1000万元以下，但近2年新增股权融资总额达到2000万元以上',
      '评价得分达到60分以上或满足直通车条件'
    ],
    benefits: [
      { type: '资金奖励', amount: '最高100万元', description: '市级认定奖励50万元，国家级认定再奖励50万元' },
      { type: '政策支持', amount: '', description: '在融资服务、技术服务、创新驱动等方面给予优先支持' }
    ],
    materials: [
      { name: '专精特新企业申请书', required: true, description: '' },
      { name: '营业执照', required: true, description: '复印件加盖公章' },
      { name: '审计报告', required: true, description: '近两年财务审计报告' },
      { name: '研发证明', required: true, description: '研发费用专项审计报告' },
      { name: '知识产权证明', required: true, description: '专利、软著等证书' }
    ],
    applyStartDate: '2026-02-01',
    applyEndDate: '2026-04-30',
    validUntil: '2029-04-30',
    officialUrl: 'https://jxj.beijing.gov.cn/',
    region: '北京市',
    industries: ['制造业', '信息技术', '科技服务']
  },
  {
    name: '中关村科技型小微企业研发资金支持',
    code: 'ZGCKJ2026001',
    category: '研发补贴',
    level: '市级',
    department: '中关村科技园区管理委员会',
    description: '支持中关村科技型小微企业开展关键技术创新和成果转化',
    eligibility: [
      '在中关村示范区内注册的国家高新技术企业',
      '企业成立时间在5年以内',
      '上一会计年度营业收入在1000万元以下',
      '在关键核心技术领域开展研发'
    ],
    benefits: [
      { type: '资金支持', amount: '最高30万元', description: '根据研发投入给予一定比例支持' }
    ],
    materials: [
      { name: '项目申报书', required: true, description: '含项目技术方案、创新点' },
      { name: '营业执照', required: true, description: '' },
      { name: '高新证书', required: true, description: '国家高新技术企业证书' },
      { name: '财务报表', required: true, description: '上年度财务审计报告' }
    ],
    applyStartDate: '2026-04-01',
    applyEndDate: '2026-05-31',
    validUntil: '2026-12-31',
    officialUrl: 'https://zgw.beijing.gov.cn/',
    region: '中关村示范区',
    industries: ['人工智能', '生物医药', '集成电路', '新材料']
  },
  {
    name: '北京市人才引进落户支持政策',
    code: 'RCYJ2026001',
    category: '人才政策',
    level: '市级',
    department: '北京市人力资源和社会保障局',
    description: '支持高新技术企业引进急需紧缺人才，提供落户绿色通道',
    eligibility: [
      '在北京市高新技术企业工作满2年',
      '具有本科及以上学历',
      '年薪达到北京市社平工资一定倍数',
      '所从事工作属于企业核心技术岗位'
    ],
    benefits: [
      { type: '落户支持', amount: '', description: '符合条件的可申请办理北京市户口' },
      { type: '住房补贴', amount: '最高10万元', description: '首次购房或租房补贴' }
    ],
    materials: [
      { name: '人才引进申请表', required: true, description: '' },
      { name: '学历证明', required: true, description: '学位证书、学历认证' },
      { name: '劳动合同', required: true, description: '有效期内的劳动合同' },
      { name: '收入证明', required: true, description: '近两年收入证明或纳税证明' }
    ],
    applyStartDate: '2026-01-01',
    applyEndDate: '2026-12-31',
    validUntil: '2026-12-31',
    officialUrl: 'http://rsj.beijing.gov.cn/',
    region: '北京市',
    industries: ['高新技术']
  },
  {
    name: '海淀区科技企业房租补贴',
    code: 'HDKF2026001',
    category: '税收优惠',
    level: '区级',
    department: '海淀区科学技术委员会',
    description: '降低科技型企业运营成本，对符合条件的企业给予房租补贴',
    eligibility: [
      '在海淀区注册并纳税的科技型企业',
      '成立时间在5年以内',
      '属于人工智能、集成电路、生物医药等重点领域',
      '无不良信用记录'
    ],
    benefits: [
      { type: '房租补贴', amount: '最高500元/㎡/年', description: '补贴面积不超过500平方米' }
    ],
    materials: [
      { name: '补贴申请表', required: true, description: '' },
      { name: '租赁合同', required: true, description: '有效期内的房屋租赁合同' },
      { name: '付款凭证', required: true, description: '房租支付凭证、发票' },
      { name: '完税证明', required: true, description: '上年度完税证明' }
    ],
    applyStartDate: '2026-03-15',
    applyEndDate: '2026-06-30',
    validUntil: '2026-06-30',
    officialUrl: 'https://www.bjhd.gov.cn/',
    region: '海淀区',
    industries: ['人工智能', '集成电路', '生物医药', '软件信息']
  },
  {
    name: '北京市知识产权资助金',
    code: 'ZSCQ2026001',
    category: '知识产权',
    level: '市级',
    department: '北京市知识产权局',
    description: '鼓励企业加强知识产权创造和保护，对专利申请、授权给予资助',
    eligibility: [
      '在北京市注册的企业、事业单位、社会组织',
      '申请专利的第一权利人',
      '专利已获得授权',
      '无不良信用记录'
    ],
    benefits: [
      { type: '发明专利资助', amount: '5000元/件', description: '国内发明专利授权' },
      { type: '实用新型资助', amount: '1500元/件', description: '国内实用新型专利授权' },
      { type: 'PCT资助', amount: '1万元/件', description: '通过PCT途径向国外申请专利' }
    ],
    materials: [
      { name: '资助申请表', required: true, description: '' },
      { name: '专利证书', required: true, description: '专利授权证书复印件' },
      { name: '费用凭证', required: true, description: '官费缴纳凭证' },
      { name: '营业执照', required: true, description: '' }
    ],
    applyStartDate: '2026-03-01',
    applyEndDate: '2026-11-30',
    validUntil: '2026-11-30',
    officialUrl: 'http://zscqj.beijing.gov.cn/',
    region: '北京市',
    industries: ['全领域']
  }
];

module.exports = { policies };

// 如果使用直接运行
if (require.main === module) {
  console.log(`准备了 ${policies.length} 条政策数据`);
  console.log(JSON.stringify(policies, null, 2));
}
