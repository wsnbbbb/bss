/**
 * 全站通用变量
 */

//  表单样式
export const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 }
  }
};

export const formItemLayout3 = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 5 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 }
  }
};

export const formItemLayout4 = {
  labelCol: {
    xl: { span: 14 },
    md: { span: 14 },
    xs: { span: 24 },
    sm: { span: 12 }
  },
  wrapperCol: {
    xl: { span: 10 },
    md: { span: 10 },
    xs: { span: 24 },
    sm: { span: 12 }
  }
};

export const formItemLayout5 = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 15 }
  }
};

//  一排一个与一排两个保持一致
export const formItemLayout2 = {
  labelCol: {
    xl: { span: 3 },
    lg: { span: 3 },
    md: { span: 6 },
    xs: { span: 6 },
    sm: { span: 6 }
  },
  wrapperCol: {
    xl: { span: 20 },
    lg: { span: 20 },
    md: { span: 18 },
    xs: { span: 18 },
    sm: { span: 18 }
  }
};
// 分页默认配置
export const pageConfig = {
  defaultCurrent: 1,
  defaultPageSize: 5,
  pageSizeOptions: ["5", "10", "20", "50", "100"],
};

// 机构树顶级机构id值
export const orgTreeDefault = {
  id: '1',
};

// 机柜不同状态颜色值
export const UBitStatus = {
  0: {
    text: '占用',
    color: '#ec4b4b'
  },
  1: {
    text: '可用',
    color: '#449d44'
  },
  3: {
    text: '已预约',
    color: '#35b5eb'
  },
};
// 服务器类型，因为在逻辑的强关联性，不从接口获取
export const serverTypes = {
  1: '通用服务器',
  2: '节点服务器',
};

// 防御峰值
export const apex = {
  0: 'G',
  1: 'T',
};

// 计费周期单位
export const timeUnit = {
  d: '天',
  h: '小时',
};

// 订单类型
export const orderType = {
  "0101": "新订单",
  "0102": "续费订单",
  "0103": "升级单",
  "0104": "降级单",
  "0105": "退订单",
  "0106": "加购单",
  "0107": "一次性订单",
  "0108": "减购单"
};

// 订单状态
export const orderStatus = {
  "0201": "待支付",
  "0202": "交易完成",
  "0203": "处理中",
  "0204": "已取消",
  "0205": "已过期",
  "0206": "交易失败",
  "0207": "支付成功",
  "0208": "退款中",
  "0209": "退款成功"
};

// 模式类型
export const modeType = {
  "0301": "预付费",
  "0302": "后付费",
};

