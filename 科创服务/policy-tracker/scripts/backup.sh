#!/bin/bash
# 备份脚本
# 用法: ./backup.sh [backup_dir]

BACKUP_DIR=${1:-"./backups"}
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="policy_tracker_backup_${DATE}"

# 创建备份目录
mkdir -p "${BACKUP_DIR}"

echo "开始备份..."
echo "备份目录: ${BACKUP_DIR}"
echo "备份名称: ${BACKUP_NAME}"

# 备份数据库
echo "备份数据库..."
docker-compose exec -T postgres pg_dump -U postgres policy_tracker > "${BACKUP_DIR}/${BACKUP_NAME}.sql"

# 备份文件存储
echo "备份文件存储..."
docker-compose exec -T minio mc mirror local/policy-tracker "${BACKUP_DIR}/${BACKUP_NAME}_files"

# 压缩备份
echo "压缩备份..."
cd "${BACKUP_DIR}"
tar -czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}.sql" "${BACKUP_NAME}_files"

# 删除原始文件
rm -rf "${BACKUP_NAME}.sql" "${BACKUP_NAME}_files"

# 清理旧备份（保留最近7天）
echo "清理旧备份..."
find . -name "policy_tracker_backup_*.tar.gz" -mtime +7 -delete

echo "备份完成: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
