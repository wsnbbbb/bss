/**
 * 全栈几乎不会发生改变的系统字典配置文件
 * 也可以写根据字典值需要进行映射的颜色等配置
 * 每个字典配置，要写上对应字典获取的接口
 * 用户字典必须调接口获取，不允许写死
 * 配置字典时，注意不要重复配置，系统字典接口作为是否重复的标准
 * 系统字典在数据库的表位置：boss_auth_db 下t_bss_dict表中
 * 配置时，加上配置人员姓名，便于修改配置沟通; 示例：描述:机房属性; key_type:attribute;配置人：杨素敏
 * 方便修改的时候全局操作，不要修改key，例如SYS_DICT_COMMON
 * stores=>dict 动态获取的系统字典先不动它，只是使用的时候我们用这个文件配置的系统字典
*/

/**
 * 全站公共字典
 */

export const SYS_DICT_COMMON = {
  // 描述:布尔值; key_type:boolean;配置人：杨素敏
  bool: {
    1: '是',
    0: '否',
  },

  /**
   * 描述:币种; key_type:currency;配置人：杨素敏
   */
  currency: {
    1: "人民币",
    2: "美元",
  },
};


/**
 * 资源模块公共字典
 */
export const SYS_DICT_COMMON_RESOURCE = {

};


/**
 * 机房
 */
export const SYS_DICT_HOUSE = {
  // 描述:机房属性; key_type:house_attr;配置人：杨素敏
  house_attr: {
    0: 'DC',
    1: 'POP',
  },
};

/**
 * 机柜
 */
export const SYS_DICT_CABINET = {
  // 描述:机柜属性; key_type:cabinet_attribute;配置人：杨素敏
  cabinet_attribute: {
    1: "托管机柜",
    6: "其他机柜",
    7: "虚拟机柜",
    2: "普通机柜",
    0: "核心机柜",
    3: "站群机柜",
    4: "母机机柜",
    5: "大带宽机柜",
  },

  // 描述:机柜状态; key_type:cabinet_status;配置人：杨素敏
  cabinet_status: {
    0: {
      text: "已购未分配",
      color: '#35b5eb'
    },
    1: {
      text: "已分配未使用",
      color: '#ff9600'
    },
    2: {
      text: "已启用未分配",
      color: '#449d44'
    },
    3: {
      text: "已使用",
      color: '#ec4b4b'
    }
  },
  // 描述:机柜类型; key_type:cabinet_type;配置人：杨素敏
  cabinet_type: {
    0: "机柜",
    1: "障碍物",
  },
  // 描述:U位状态; key_type:uw_status;配置人：杨素敏
  uw_status: {
    0: {
      text: "占用",
      color: '#f5222d' // 红色
    },
    1: {
      text: "可用",
      color: '#52c41a' // 绿色
    },
    3: {
      text: "已预约",
      color: '#fadb14' // 黄色
    },
  },
};

/**
 * 网络设备
 */
export const SYS_DICT_NET_DEVICE = {
  // 描述:设备类型; key_type:re_facility;配置人：杨素敏
  re_facility: {
    0: "交换机",
    1: "路由器",
    5: "其他设备",
    3: "防火墙",
    4: "ATS",
  },
  // 描述:U位设备类型; key_type:uw_facility;配置人：杨素敏
  uw_facility: {
    1: "通用服务器",
    2: "机柜空间",
    3: "节点服务器",
    4: "网络设备",
  },
};

/**
 * 网络设备端口
 */
export const SYS_DICT_PORT = {
  // 描述:端口状态; key_type:port_use;杨素敏
  port_use: {
    1: {
      text: "可用",
      color: '#52c41a' // 绿色
    },
    2: {
      text: "已用",
      color: '#f5222d' // 红色
    },
    3: {
      text: "故障",
      color: '#f50', // 橙红色
    },
  },
  // 描述:端口类型; key_type:port_type;杨素敏
  port_type: {
    0: "电口",
    1: "光口",
    2: "虚拟口(用于租赁服务器)",
  },
};

/**
 * 外机
 */
export const SYS_DICT_NODEMASTER = {
  // 描述:外机节点状态; key_type:machine_node_state;配置人：杨素敏
  machine_node_state: {
    0: {
      text: "可用",
      color: '#52c41a' // 绿色
    },
    1: {
      text: "占用",
      color: '#f5222d' // 红色
    },
  },
  // 描述:外机主表销售状态(根据下面的节点计算出来的状态); key_type:node_server_market;配置人：杨素敏
  node_server_market: {
    0: {
      text: "未售",
      color: '#52c41a' // 绿色
    },
    1: {
      text: "已售",
      color: '#f5222d' // 红色
    },
  }
};


/**
 * 服务器
 */
export const SYS_DICT_SERVER = {
  // 描述:设备类型; key_type:se_unittype;杨素敏
  se_unittype: {
    1: "通用服务器",
    2: "节点服务器",
  },
  // 描述:服务器销售状态; key_type:market;杨素敏
  market: {
    1: {
      text: "未售",
      color: '#52c41a' // 绿色
    },
    2: {
      text: "已售",
      color: '#f5222d' // 红色
    },
    6: {
      text: "退定中",
      color: '#fadb14' // 黄色
    },
  },
  // 描述:服务器状态; key_type:server_status;杨素敏
  server_status: {
    1: {
      text: "开机",
      color: '#f5222d' // 红色
    },
    2: {
      text: "关机",
      color: '#52c41a' // 绿色
    },
    3: {
      text: "故障中",
      color: '#f50', // 橙红色
    },
    4: {
      text: "保留",
      color: '#fadb14' // 黄色
    },
  },
  // 描述:发布状态; key_type:releaseStatus;杨素敏：考虑提升到资源的公共字典里，因为固件和服务器都在使用
  releaseStatus: {
    0: "已发布",
    1: "未发布",
  },
  // 描述:显示类型; key_type:show_type;杨素敏：考虑提升到资源的公共字典里，因为固件和服务器都在使用
  show_type: {
    0: "外显",
    1: "内显",
  },
  // 描述:服务器用途; key_type:server_useage;杨素敏
  server_useage: {
    1: "服务器",
    2: "防火墙",
  },
};

/**
 * 服务器固件
 */
export const SYS_DICT_SERVERPART = {
  // 描述:内存规格; key_type:mem_spec;杨素敏
  mem_spec: {
    1: "HM",
    2: "FM",
    3: "UNKNOWN",
  },
  // 描述:内存类型; key_type:memory_type;杨素敏
  memory_type: {
    1: "DDR3",
    2: "DDR4",
    3: "UNKNOWN",
  },
  // 描述:内存校验; key_type:mem_verify;杨素敏
  mem_verify: {
    1: "ECC",
    2: "RECC",
    3: "UNKNOWN",
  },
  // 描述:硬盘接口类型; key_type:disk_interface_type;杨素敏
  disk_interface_type: {
    0: "SATA",
    1: "SAS",
    2: "UNKNOWN",
  },
  // 描述:硬盘类型简称; key_type:disk_short;杨素敏
  disk_short: {
    0: "HDD",
    1: "SSD",
    2: "UNKNOWN",
  },
  // 描述:硬盘类型; key_type:disk_type;杨素敏
  disk_type: {
    0: "机械硬盘",
    1: "固态硬盘",
    2: "未知",
  },
  // 描述:硬盘用途; key_type:use_type;陈浪
  use_type: {
    1: "桌面级",
    2: "企业级",
  },
  // 描述:硬盘规格; key_type:server_disk_spec;陈浪
  server_disk_spec: {
    1: "2.5",
    2: "3.5",
    3: "UNKNOWN",
  },
  // 描述:Raid卡类型; key_type:raid_type;杨素敏
  raid_type: {
    1: "独立",
    2: "集成",
  },
  // 描述:配件模块的发布状态; key_type:releaseStatus;陈浪
  releaseStatus: {
    0: "已发布",
    1: "未发布",
  },
  // 描述:配件模块的来源; key_type:source;陈浪
  source: {
    1: "采购",
    2: "拆机",
    3: "客户",
  },
  // 描述:配件模块的资源归属; key_type:resource_attribution;陈浪
  resource_attribution: {
    1: "公用",
    2: "专用",
  },
  // 描述:配件模块的显示类型; key_type:show_type;陈浪
  show_type: {
    0: "外显",
    1: "内显",
  },
  // 描述:配件模块的显示类型; key_type:parts_res_status;陈浪
  parts_res_status: {
    0: {
      text: "未使用",
      color: '#87d068'
    },
    1: {
      text: "已使用",
      color: '#108ee9'
    },
    2: {
      text: "故障",
      color: '#f50'
    },
    3: {
      text: "异常待检测",
      color: '#2db7f5'
    },
  },
};

/**
 * ip资源
 */
export const SYS_DICT_IP = {

  /**
   * 描述:主产品; key_type:master_product;配置人：罗鑫
   */
  products: {
    0: '服务器租赁',
    1: '服务器托管',
  },

  /**
   * 描述:业务类型; key_type:business_type;配置人：罗鑫
   */
  business_type: {
    1: '普通',
    2: '站群',
    3: '母机',
    4: '增强型',
    5: '大带宽'
  },

  /**
   * 描述:带宽类型; key_type:bandwidth_type 用户表;配置人：罗鑫
   */
  // bandwidthType: {
  //   0: '联通带宽',
  //   4: '移动带宽',
  //   2: '电信带宽',
  // },

  /**
   * 描述:ip来源; key_type:ip_source;配置人：罗鑫
   */
  ip_source: {
    1: '本地',
    2: '国际',
  },

  /**
   * 描述:锁定状态; key_type:ip_is_lock;配置人：罗鑫
   */
  is_lock: {
    0: '未锁定',
    1: '已锁定',
  },

  /**
   * 描述:ip适用客户类型; key_type:ip_customer_type;配置人：罗鑫
   */
  ip_customer_type: {
    0: '行业',
    1: '渠道',
  },

  /**
   * 描述:ip防御类型; key_type:ip_defense_type;配置人：罗鑫
   */
  ip_defense_type: {
    0: '牵引',
    1: '常驻',
  },

  /**
   * 描述:显示方式; key_type:show_type;配置人：罗鑫
   */
  show_type: {
    0: '外显',
    1: '内显',
  },


  /**
   * 描述:布尔值; key_type:boolean;配置人：罗鑫
   */
  boolean: {
    1: '是',
    0: '否'
  },

  /**
   * 描述:ip分类; key_type:ip_type;配置人：罗鑫
   */
  ip_type: {
    1: '单IP',
    2: '段IP',
    3: '网络IP',
    4: '广播IP',
  },

  /**
   * 描述:ip分类; key_type:ip_type;配置人：罗鑫
   */
  ip_type2: {
    1: '单IP',
    2: '段IP',
  },

  /**
   * 描述:资源状态; key_type:ip_res_status; 列表展示 配置人：罗鑫
   */
  ip_res_status: {
    0: {
      text: '未使用',
      color: '#52c41a' // 绿色
    },
    1: {
      text: '已使用',
      color: '#f5222d' // 红色
    },
    2: {
      text: '不可用',
      color: '#1890ff' // 蓝色
    },
    4: {
      text: '上架处理中',
      color: '#69c0ff' // 黄色
    },
    3: {
      text: '预留中',
      color: '#fadb14' // 黄色
    }
  },

  /**
   * 描述:资源状态; key_type:ip_res_status; 下拉选择 配置人：罗鑫
   */
  ip_res_statusSlect: {
    0: '未使用',
    // 1: '已使用',
    2: '不可用',
    // 4: '上架处理中',
    3: '预留中'
  },

    /**
   * 描述:资源状态; key_type:ip_res_status; ip详情编辑 配置人：罗鑫
   */
  ip_res_statusSlect2: {
    0: '未使用',
    1: '已使用',
    2: '不可用',
    4: '上架处理中',
    3: '预留中'
  },

  /**
   * 描述:特殊状态; key_type:special_status; 列表展示 配置人：罗鑫
   */
  special_status: {
    0: '正常',
    3: '处理中',
    4: '停用',
    6: '后续跟进',
    8: '爆红',
    9: '检测中'
  },

  /**
   * 描述:特殊状态; key_type:special_status; 下拉选择 配置人：罗鑫
   */
  special_statusSlect: {
    0: '正常',
    3: '处理中',
    4: '停用',
    6: '后续跟进',
    8: '爆红',
    // 9: '检测中'
  },

  /**
   * 描述:黑名单特殊状态; key_type:special_status;配置人：罗鑫
   */
  blank_status: {
    3: '处理中',
    4: '停用',
    6: '后续跟进',
    8: '爆红',
  },

  /**
   * 描述:取消黑名单特殊状态; key_type:special_status;配置人：罗鑫
   */
  removeBlank_status: {
    0: '正常',
    // 9: '检测中'
  },

};

/**
 * 后台用户管理中心
 */
export const SYS_DICT_CUSTOMER = {

  /**
   * 描述:认证类型; key_type:auth_type;配置人：罗鑫
   */
  auth_type: {
    1: "个人认证",
    5: "企业认证"
  },

  /**
   * 描述:认证方式; key_type:auth_way;配置人：罗鑫
   */
  auth_way: {
    2: "支付宝认证",
    3: "微信认证",
    4: "人工认证",
  },

  /**
   * 描述:认证状态; key_type:auth_status;配置人：罗鑫
   */
  auth_status: {
    1: "认证成功",
    2: "认证失败",
    3: "审核中",
    // 4: "未认证"
  },

  /**
   * 描述:认证状态; key_type:auth_status;配置人：罗鑫
   */
  auth_status2: {
    1: "认证成功",
    2: "认证失败",
    3: "审核中",
    4: "未认证"
  },


  /**
   * 描述:协议类型; key_type:protocol_type;配置人：罗鑫
   */
  protocol_type: {
    3: "入网安全责任书",
    2: "隐私政策",
    4: "合同模板",
    1: "服务协议"
  },

  /**
   * 描述:客户账户状态; key_type:customer_account_status;配置人：罗鑫
   */
  customer_account_status: {
    1: "禁用",
    2: "正常",
  },

  /**
   * 描述:客户账户状态; key_type:customer_account_status; 添加用户下拉选择 配置人：罗鑫
   */
  customer_add_status: {
    1: "禁用",
    2: "正常",
    // 3: "新用户",
    // 4: "停用"
  },

  /**
   * 描述:客户付费类型; key_type:customer_pay_type;配置人：罗鑫
   */
  customer_pay_type: {
    1: "预付费",
    2: "后付费",
  },

  /**
   * 描述:客户注册IP来源; key_type:customer_ip_source;配置人：罗鑫
   */
  customer_ip_source: {
    2:	"中国港澳",
    4:	"海外",
    3:	"中国台湾",
    1:	"中国大陆",
  },

  /**
   * 描述:证件类型; key_type:certificate_type;配置人：罗鑫
   */
  certificate_type: {
    1: "身份证",
    2: "驾驶证",
    3: "护照",
    4: "港澳居民来往内地通行证",
    5: "台湾居民来往内地通行证"
  },

  /**
   * 描述:销售类型; key_type:customer_sale_type;配置人：罗鑫
   */
  customer_sale_type: {
    1: "销售",
    2: "销售支持"
  },

  /**
   * 描述:身份证期限状态; key_type:customer_period_status;配置人：罗鑫
   */
  customer_period_status: {
    1: "长期",
    2: "固定期限"
  },
/**
   * 描述:客户标签; key_type:customer_lable_type;配置人：罗鑫
   */
  customer_lable_type:{
    1: "新注册",
    2: "新购",
    3:"复购"
  }
};

/**
 * 产品模块系统
 */

export const SYS_DICT_PRODUCT = {

  /**
   * 描述:管理的产品类别; key_type:product_category_type;配置人：杨素敏
   */
  product_category_type: {
    1: "资源类",
    2: "服务类",
    3: "解决方案类",
  },

  /**
   * 描述:付费模式; key_type:pay_model;配置人：杨素敏
   */
  pay_model: {
    1: "一次性付费",
    2: "包年包月",
    // 3: "按流量计费",
  },

  /**
   * 描述:客户付费类型; key_type:customer_pay_type;配置人：杨素敏
   */
  customer_pay_type: {
    1: "预付费",
    // 2: "后付费",
  },

  /**
   * 描述:最小资源配置; key_type:product_resource_config;配置人：杨素敏
   */
  product_resource_config: {
    1: "机箱",
    2: "CPU",
    3: "内存",
    4: "硬盘",
    5: "IP",
    6: "Raid卡",
    7: "带宽",
  },
  // 针对最小资源进行分类
  product_resource_config_classify: [
    {
      title: '硬件资源',
      value: 'hardware',
      children: [
        {
          title: 'CPU',
          value: '2',
        },
        {
          title: '内存',
          value: '3',
        },
        {
          title: '硬盘',
          value: '4',
        },
        {
          title: 'Raid卡',
          value: '6',
        },
        {
          title: '机箱',
          value: '1',
        },
      ],
    },
    {
      title: '网络资源',
      value: 'network',
      children: [
        {
          title: 'IP',
          value: '5',
        },
        {
          title: '带宽',
          value: '7',
        },
      ],
    },
  ],
  // 机箱的价格表类型; key_type:product_crate_price_type;配置：陈浪
  product_crate_price_type: {
    1: "服务器类型",
    2: "内存扩展",
    3: "硬盘扩展",
    4: "raid卡支持",
    5: "网卡"
  },
  // 产品状态; key_type:product_master_status; 配置：陈浪
  product_master_status: {
    0: "待审核",
    1: "审核中",
    2: "审核完成",
    3: "审核挂起",
    4: "审核未通过",
    5: "上架",
    6: "下架",
  }
};
