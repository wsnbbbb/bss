/**
 * 菜单配置
 */
export default [
  {
    name: '资源管理',
    path: '/resources',
    icon: 'yonghu',
    Authority: ['area-view', 'house-view', 'cabinet-u-view',
      'network-devices-view', 'node-server-view', 'server-view',
      'memorymodel-view', 'memorydetail-view', 'diskmodel-view', 'diskdetail-view', 'cpumodel-view', 'cpudetail-view', 'raidModel-view', 'raiddetail-view',
      'ipSegment-view', 'ipAddr-view', 'ipBlackList-view'],
    subRoute: [{
      name: '机房机柜管理',
      path: '/resources/manage',
      Authority: ['area-view', 'house-view', 'cabinet-u-view'],
      subRoute: [{
        name: '地区管理',
        path: '/resources/manage/area',
        Authority: ['area-view']
      }, {
        name: '机房管理',
        path: '/resources/manage/house',
        Authority: ['house-view']
      }, {
        name: '机柜管理',
        path: '/resources/manage/cabinet',
        Authority: ['cabinet-u-view']
      }]
    }, {
      name: '网络设备',
      path: '/resources/networkdevices',
      Authority: ['network-devices-view'],
      subRoute: [{
        name: '网络设备管理',
        path: '/resources/networkdevices/manage',
        Authority: ['network-devices-view']
      }, {
        name: '端口模板管理',
        path: '/resources/networkdevices/porttemp',
        Authority: ['network-devices-view']
      }]
    }, {
      name: '服务器管理',
      path: '/resources/server',
      Authority: ['node-server-view', 'server-view'],
      subRoute: [{
        name: '外机列表',
        path: '/resources/server/outsidemachine',
        Authority: ['node-server-view']
      }, {
        name: '服务器列表',
        path: '/resources/server/manage',
        Authority: ['server-view']
      }]
    }, {
      name: '服务器配件管理',
      path: '/resources/severparts',
      Authority: ['memorymodel-view', 'memorydetail-view', 'diskmodel-view', 'diskdetail-view', 'cpumodel-view', 'cpudetail-view', 'raidModel-view', 'raiddetail-view'],
      subRoute: [{
        name: '内存型号',
        path: '/resources/severparts/ramtype',
        Authority: ['memorymodel-view']
      },
      {
        name: '内存列表',
        path: '/resources/severparts/ramlist',
        Authority: ['memorydetail-view']
      },
      {
        name: '硬盘型号',
        path: '/resources/severparts/hdtype',
        Authority: ['diskmodel-view']
      },
      {
        name: '硬盘列表',
        path: '/resources/severparts/hdlist',
        Authority: ['diskdetail-view']
      },
      {
        name: 'CPU型号',
        path: '/resources/severparts/cputype',
        Authority: ['cpumodel-view']
      },
      {
        name: 'CPU列表',
        path: '/resources/severparts/cpulist',
        Authority: ['cpudetail-view']
      },
      {
        name: 'RAID卡型号',
        path: '/resources/severparts/raidtype',
        Authority: ['raidModel-view']
      },
      {
        name: 'RAID卡列表',
        path: '/resources/severparts/raidlist',
        Authority: ['raiddetail-view']
      },
      ]
    },
    {
      name: 'IP资源管理',
      path: '/resources/IP',
      Authority: ['ipSegment-view', 'ipAddr-view', 'ipBlackList-view'],
      subRoute: [{
        name: 'IP资源',
        path: '/resources/IP/resource',
        Authority: ['ipSegment-view'],
      }, {
        name: 'IP详情',
        path: '/resources/IP/details',
        Authority: ['ipAddr-view'],
      },
      {
        name: 'IP黑名单',
        path: '/resources/Ip/blacklist',
        Authority: ['ipBlackList-view'],
      },
      ]
    }]
  },
  {
    name: '产品管理',
    path: '/products',
    Authority: ['ALL'],
    subRoute: [
      {
        name: '类目管理',
        path: '/products/category',
        Authority: ['ALL']
      },
      {
        name: '产品管理',
        path: '/products/manage',
        Authority: ['ALL']
      },
      {
        name: '产品创建',
        path: '/products/creation',
        Authority: ['ALL'],
        subRoute: [
          {
            name: '资源型产品',
            path: '/products/creation/resource',
            Authority: ['ALL']
          },
          {
            name: '解决方案型产品',
            path: '/products/creation/solution',
            Authority: ['ALL']
          },
        ]
      },
      {
        name: '价格管理',
        path: '/products/prices',
        Authority: ['ALL'],
        subRoute: [
          {
            name: '服务器价格查询',
            path: '/products/prices/serverprice',
            Authority: ['ALL']
          },
          {
            name: '硬件资源',
            path: '/products/prices/hardware',
            Authority: ['ALL'],
            subRoute: [
              {
                name: '机箱价格管理',
                path: '/products/prices/hardware/serverbox',
                Authority: ['ALL']
              },
              {
                name: '内存价格管理',
                path: '/products/prices/hardware/ram',
                Authority: ['ALL']
              },
              {
                name: 'CPU价格管理',
                path: '/products/prices/hardware/cpu',
                Authority: ['ALL']
              },
              {
                name: '硬盘价格管理',
                path: '/products/prices/hardware/harddisk',
                Authority: ['ALL']
              },
              {
                name: 'RAID价格管理',
                path: '/products/prices/hardware/raid',
                Authority: ['ALL']
              },
              {
                name: '机柜价格管理',
                path: '/products/prices/hardware/cabinet',
                Authority: ['ALL']
              },
            ]
          },
          {
            name: '网络资源',
            path: '/products/prices/network',
            Authority: ['ALL'],
            subRoute: [
              {
                name: 'IP价格管理',
                path: '/products/prices/network/ip',
                Authority: ['ALL']
              },
              {
                name: '带宽价格管理',
                path: '/products/prices/network/bandwidth',
                Authority: ['ALL']
              },
            ]
          },
        ]
      },
    ]
  },
  {
    name: '交易系统',
    path: '/transaction',
    Authority: ['ALL'],
    subRoute: [{
      name: '交易模式',
      path: '/transaction/tradingmodel',
      Authority: ['ALL']
    },
    {
      name: '订单管理',
      path: '/transaction/ordermanage',
      Authority: ['ALL'],
      subRoute: [
        //   {
        //   name: '异常订单',
        //   path: '/transaction/ordermanage/abnormal',
        //   Authority: ['ALL']
        //  },
        {
          name: '订单列表',
          path: '/transaction/ordermanage/list',
          Authority: ['ALL']
        }]
    },
    {
      name: '发票管理',
      path: '/transaction/invoicemanage',
      Authority: ['ALL']
    },
      // {
      //   name: '账单管理',
      //   path: '/transaction/billmanage',
      //   Authority: ['ALL'],
      //   subRoute: [
      //     {
      //     name: '异常账单',
      //     path: '/transaction/billmanage/abnormal',
      //     Authority: ['ALL']
      //    },
      //    {
      //     name: '账单列表',
      //     path: '/transaction/billmanage/list',
      //     Authority: ['ALL']
      //   }]
      // },
    ]
  },
  {
    name: '客户管理中心',
    path: '/customermanage',
    Authority: ['protocol-view', 'customerAuth-view', 'customerInfo-view', 'salePersonnel-view', 'agencyLevel-view'],
    subRoute: [{
      name: '协议模板管理',
      path: '/customermanage/agreement',
      Authority: ['protocol-view']
    },
    {
      name: '实名认证列表',
      path: '/customermanage/realname',
      Authority: ['customerAuth-view']
    },
    {
      name: '客户信息管理',
      path: '/customermanage/information',
      Authority: ['customerInfo-view']
    },
    {
      name: '销售和销售支持管理',
      path: '/customermanage/sales',
      Authority: ['salePersonnel-view']
    },
    {
      name: '客户代理等级设置',
      path: '/customermanage/agentlevel',
      Authority: ['agencyLevel-view']
    }]
  },
  {
    name: '用户管理',
    path: '/user',
    icon: 'yonghu',
    Authority: ['user-view', 'role-view'],
    subRoute: [{
      name: '部门与员工管理',
      path: '/user/list',
      Authority: ['user-view']
    }, {
      name: '角色权限管理',
      path: '/user/role',
      Authority: ['role-view']
    }]
  },
  {
    name: '数据兼容',
    path: '/datacompaty',
    icon: 'yonghu',
    Authority: ['ALL'],
    subRoute: [{
      name: '产品组服务器配件同步',
      path: '/datacompaty/productserverlist',
      Authority: ['ALL']
    },
    {
      name: '父模板列表',
      path: '/datacompaty/parentlist',
      Authority: ['ALL']
    },
    {
      name: '父模板子模板服务器',
      path: '/datacompaty/parmobanserverlist',
      Authority: ['ALL']
    },
    {
      name: '配件类型配件同步',
      path: '/datacompaty/parttypelist',
      Authority: ['ALL']
    }]
  },
  {
    name: '字典管理',
    path: '/dict',
    Authority: ['ALL'],
    subRoute: [{
      name: '字典',
      path: '/dict/manage',
      Authority: ['ALL']
    },
    ]
  },
];
