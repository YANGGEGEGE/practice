-- 初始化数据库
CREATE DATABASE IF NOT EXISTS crypto_sentinel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE crypto_sentinel;

-- 价格历史表
CREATE TABLE IF NOT EXISTS `price_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `symbol` varchar(20) NOT NULL COMMENT '交易对',
  `price` decimal(20,8) NOT NULL COMMENT '价格',
  `volume` decimal(20,8) DEFAULT NULL COMMENT '交易量',
  `timestamp` bigint NOT NULL COMMENT '时间戳',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_symbol_timestamp` (`symbol`, `timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='价格历史记录';

-- 告警历史表
CREATE TABLE IF NOT EXISTS `alert_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `symbol` varchar(20) NOT NULL COMMENT '交易对',
  `alertType` varchar(50) NOT NULL COMMENT '告警类型',
  `price` decimal(20,8) NOT NULL COMMENT '价格',
  `volatility` decimal(10,2) NOT NULL COMMENT '波动率',
  `timeframe` varchar(10) NOT NULL COMMENT '时间框架',
  `message` text COMMENT '告警消息',
  `sent` tinyint NOT NULL DEFAULT '1' COMMENT '是否已发送',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_symbol` (`symbol`),
  KEY `idx_created_at` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='告警历史记录';

-- 插入测试数据（可选）
-- INSERT INTO price_history (symbol, price, timestamp) VALUES ('BTCUSDT', 45000.00, UNIX_TIMESTAMP(NOW()) * 1000);

