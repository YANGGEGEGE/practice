/**
 * 告警规则配置
 * 所有告警规则集中管理，方便后续扩展
 */

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  level: 'critical' | 'timeSensitive' | 'normal';
  quietHours?: {
    start: number; // 小时 (0-23)
    end: number; // 小时 (0-23)
    timezone: string; // 时区，如 'Asia/Shanghai'
  };
}

export interface PriceChangeRule extends AlertRule {
  type: 'priceChange';
  threshold: number; // 百分比，如 5 表示 5%
  timeWindow: number; // 时间窗口（分钟）
  cooldown: number; // 冷却时间（分钟），避免重复告警
}

export interface MarginRatioRule extends AlertRule {
  type: 'marginRatio';
  threshold: number; // 百分比，如 20 表示 20%
  operator: 'lt' | 'lte' | 'gt' | 'gte'; // 小于、小于等于、大于、大于等于
  cooldown: number; // 冷却时间（分钟）
}

export interface PositionSizeRule extends AlertRule {
  type: 'positionSize';
  threshold: number; // 持仓价值（USDT）
  operator: 'lt' | 'lte' | 'gt' | 'gte';
  cooldown: number;
}

export interface PnlRule extends AlertRule {
  type: 'pnl';
  threshold: number; // 盈亏金额（USDT）
  operator: 'lt' | 'lte' | 'gt' | 'gte';
  cooldown: number;
}

export type AlertRuleConfig = PriceChangeRule | MarginRatioRule | PositionSizeRule | PnlRule;

/**
 * 默认告警规则
 */
export const DEFAULT_ALERT_RULES: AlertRuleConfig[] = [
  // 规则1: 5分钟内价格涨跌5%
  {
    id: 'price-change-5min-5pct',
    name: '价格剧烈波动告警',
    description: '持仓代币5分钟内价格涨跌超过5%',
    type: 'priceChange',
    enabled: true,
    level: 'critical',
    threshold: 5,
    timeWindow: 5,
    cooldown: 15, // 15分钟内不重复告警同一个币种
    quietHours: {
      start: 2, // 凌晨2点
      end: 6, // 早上6点
      timezone: 'Asia/Shanghai', // 北京时间
    },
  },

  // 规则2: 保证金率低于20%
  {
    id: 'margin-ratio-low-20pct',
    name: '保证金率过低告警',
    description: '保证金率低于或等于20%，有强平风险',
    type: 'marginRatio',
    enabled: true,
    level: 'critical',
    threshold: 20,
    operator: 'lte',
    cooldown: 10, // 10分钟内不重复告警
    quietHours: {
      start: 2,
      end: 5, // 凌晨2-5点
      timezone: 'Asia/Shanghai',
    },
  },

  // 规则3: 单个持仓价值过大（示例，默认禁用）
  {
    id: 'position-size-large',
    name: '单个持仓过大告警',
    description: '单个持仓价值超过10000 USDT',
    type: 'positionSize',
    enabled: false,
    level: 'timeSensitive',
    threshold: 10000,
    operator: 'gte',
    cooldown: 30,
    quietHours: {
      start: 2,
      end: 6,
      timezone: 'Asia/Shanghai',
    },
  },

  // 规则4: 总未实现盈亏过低（示例，默认禁用）
  {
    id: 'pnl-loss-large',
    name: '亏损过大告警',
    description: '总未实现盈亏低于-1000 USDT',
    type: 'pnl',
    enabled: false,
    level: 'timeSensitive',
    threshold: -1000,
    operator: 'lte',
    cooldown: 30,
    quietHours: {
      start: 2,
      end: 6,
      timezone: 'Asia/Shanghai',
    },
  },
];

/**
 * 检查当前时间是否在静默时段
 */
export function isInQuietHours(rule: AlertRuleConfig): boolean {
  if (!rule.quietHours) {
    return false;
  }

  const now = new Date();
  const { start, end, timezone } = rule.quietHours;

  // 转换为指定时区的小时数
  const hour = parseInt(
    now.toLocaleString('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    }),
  );

  // 处理跨天的情况
  if (start < end) {
    // 如: 2-6点
    return hour >= start && hour < end;
  } else {
    // 如: 22-2点（跨午夜）
    return hour >= start || hour < end;
  }
}

/**
 * 获取所有启用的规则
 */
export function getEnabledRules(): AlertRuleConfig[] {
  return DEFAULT_ALERT_RULES.filter((rule) => rule.enabled);
}

/**
 * 根据ID获取规则
 */
export function getRuleById(id: string): AlertRuleConfig | undefined {
  return DEFAULT_ALERT_RULES.find((rule) => rule.id === id);
}
