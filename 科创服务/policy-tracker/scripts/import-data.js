#!/usr/bin/env node
/**
 * 数据导入脚本
 * 用于将种子数据导入数据库
 */

const { DataSource } = require('typeorm');
const { Policy } = require('../backend/dist/entities/policy.entity');
const { policies } = require('./seed-policies');

async function importData() {
  // 创建数据库连接
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'policy_tracker',
    entities: [Policy],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('数据库连接成功');

    const policyRepository = dataSource.getRepository(Policy);
    let imported = 0;
    let updated = 0;

    for (const policyData of policies) {
      // 检查是否已存在
      const existing = await policyRepository.findOne({
        where: { code: policyData.code },
      });

      // 处理日期字段
      const data = {
        ...policyData,
        applyStartDate: policyData.applyStartDate ? new Date(policyData.applyStartDate) : null,
        applyEndDate: policyData.applyEndDate ? new Date(policyData.applyEndDate) : null,
        validUntil: policyData.validUntil ? new Date(policyData.validUntil) : null,
        status: '即将开始',
        isActive: true,
        viewCount: 0,
        applyCount: 0,
      };

      if (existing) {
        // 更新现有政策
        Object.assign(existing, data);
        await policyRepository.save(existing);
        console.log(`更新政策: ${policyData.name}`);
        updated++;
      } else {
        // 创建新政策
        const policy = policyRepository.create(data);
        await policyRepository.save(policy);
        console.log(`导入政策: ${policyData.name}`);
        imported++;
      }
    }

    console.log(`\n导入完成: 新增 ${imported} 条, 更新 ${updated} 条`);
  } catch (error) {
    console.error('导入失败:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

// 运行导入
importData();
