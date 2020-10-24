/**
 * 页面路由配置
 */
import Loadable from 'react-loadable';
import DelayLoading from '@src/components/Loading';
// import UserAdmin from '@src/pages/System/UserAdmin';
const UserAdmin = Loadable({ loader: () => import('@src/pages/System/UserAdmin'), loading: DelayLoading });
// import RoleAdmin from '@src/pages/System/RoleAdmin';
const RoleAdmin = Loadable({ loader: () => import('@src/pages/System/RoleAdmin'), loading: DelayLoading });
// 机房机柜
// import ResourcesArea from '@src/pages/resources/Area';
const ResourcesArea = Loadable({ loader: () => import('@src/pages/resources/Area'), loading: DelayLoading });
// import ResourcesHouse from '@src/pages/resources/House';
const ResourcesHouse = Loadable({ loader: () => import('@src/pages/resources/House'), loading: DelayLoading });
// import ResourcesCabinet from '@src/pages/resources/cabinet';
const ResourcesCabinet = Loadable({ loader: () => import('@src/pages/resources/cabinet'), loading: DelayLoading });
// 服务器管理模块
// import ResourcesServer from '@src/pages/resources/Server';
const ResourcesServer = Loadable({ loader: () => import('@src/pages/resources/Server'), loading: DelayLoading });
// import RsOutsideMachine from '@src/pages/resources/OutsideMachine';
const RsOutsideMachine = Loadable({ loader: () => import('@src/pages/resources/OutsideMachine'), loading: DelayLoading });
// 服务器固件
// import ResourcesRamType from '@src/pages/resources/SeverPartsRamType';
const ResourcesRamType = Loadable({ loader: () => import('@src/pages/resources/SeverPartsRamType'), loading: DelayLoading });
// import ResourcesRamList from '@src/pages/resources/SeverPartsRamList';
const ResourcesRamList = Loadable({ loader: () => import('@src/pages/resources/SeverPartsRamList'), loading: DelayLoading });
// import ResourcesCpuType from '@src/pages/resources/SeverPartsCpuType';
const ResourcesCpuType = Loadable({ loader: () => import('@src/pages/resources/SeverPartsCpuType'), loading: DelayLoading });
// import ResourcesCpuList from '@src/pages/resources/SeverPartsCpuList';
const ResourcesCpuList = Loadable({ loader: () => import('@src/pages/resources/SeverPartsCpuList'), loading: DelayLoading });
// import ResourcesHdType from '@src/pages/resources/SeverPartsHdType';
const ResourcesHdType = Loadable({ loader: () => import('@src/pages/resources/SeverPartsHdType'), loading: DelayLoading });
// import ResourcesHdList from '@src/pages/resources/SeverPartsHdList';
const ResourcesHdList = Loadable({ loader: () => import('@src/pages/resources/SeverPartsHdList'), loading: DelayLoading });
// import ResourcesRaidType from '@src/pages/resources/SeverPartsRaidType';
const ResourcesRaidType = Loadable({ loader: () => import('@src/pages/resources/SeverPartsRaidType'), loading: DelayLoading });
// import ResourcesRaidList from '@src/pages/resources/SeverPartsRaidList';
const ResourcesRaidList = Loadable({ loader: () => import('@src/pages/resources/SeverPartsRaidList'), loading: DelayLoading });
// IP资源
// import ResourcesIP from '@src/pages/resources/IP';
const ResourcesIP = Loadable({ loader: () => import('@src/pages/resources/IP'), loading: DelayLoading });
// import DetailsIP from '@src/pages/resources/IpDetails';
const DetailsIP = Loadable({ loader: () => import('@src/pages/resources/IpDetails'), loading: DelayLoading });
// import IpBlackList from '@src/pages/resources/IpBlackList';
const IpBlackList = Loadable({ loader: () => import('@src/pages/resources/IpBlackList'), loading: DelayLoading });

// import RegionMap from '@src/pages/resources/House/RegionMap';
const RegionMap = Loadable({ loader: () => import('@src/pages/resources/House/RegionMap'), loading: DelayLoading });
// import ResourcesUBitManage from '@src/pages/resources/Cabinet/UBitManage';
const ResourcesUBitManage = Loadable({ loader: () => import('@src/pages/resources/Cabinet/UBitManage'), loading: DelayLoading });
// import RsNetworkDevices from '@src/pages/resources/NetworkDevices';
const RsNetworkDevices = Loadable({ loader: () => import('@src/pages/resources/NetworkDevices'), loading: DelayLoading });
// import RsPortTemp from '@src/pages/resources/PortTemplate/List';
const RsPortTemp = Loadable({ loader: () => import('@src/pages/resources/PortTemplate/List'), loading: DelayLoading });
// 数据同步
// import ProductServerlist from '@src/pages/Datacompaty/ProductServerlist';
const ProductServerlist = Loadable({ loader: () => import('@src/pages/Datacompaty/ProductServerlist'), loading: DelayLoading });
// import Parentlist from '@src/pages/Datacompaty/Parentlist';
const Parentlist = Loadable({ loader: () => import('@src/pages/Datacompaty/Parentlist'), loading: DelayLoading });
// import ParmobanServerlist from '@src/pages/Datacompaty/ParmobanServerlist';
const ParmobanServerlist = Loadable({ loader: () => import('@src/pages/Datacompaty/ParmobanServerlist'), loading: DelayLoading });
// import PartTypelist from '@src/pages/Datacompaty/PartTypelist';
const PartTypelist = Loadable({ loader: () => import('@src/pages/Datacompaty/PartTypelist'), loading: DelayLoading });
// 字典管理
// import DictManage from '@src/pages/Dictmanage';
const DictManage = Loadable({ loader: () => import('@src/pages/Dictmanage'), loading: DelayLoading });
// 后台用户管理中心
// import AgreementTemplate from '@src/pages/CustomerManage/AgreementTemplate';
const AgreementTemplate = Loadable({ loader: () => import('@src/pages/CustomerManage/AgreementTemplate'), loading: DelayLoading });
// import RealName from '@src/pages/CustomerManage/RealName';
const RealName = Loadable({ loader: () => import('@src/pages/CustomerManage/RealName'), loading: DelayLoading });
// import CustomerInformation from '@src/pages/CustomerManage/CustomerInformation';
const CustomerInformation = Loadable({ loader: () => import('@src/pages/CustomerManage/CustomerInformation'), loading: DelayLoading });
// import SalesAndsupport from '@src/pages/CustomerManage/SalesAndsupport';
const SalesAndsupport = Loadable({ loader: () => import('@src/pages/CustomerManage/SalesAndsupport'), loading: DelayLoading });
// import ClientAgent from '@src/pages/CustomerManage/ClientAgent';
const ClientAgent = Loadable({ loader: () => import('@src/pages/CustomerManage/ClientAgent'), loading: DelayLoading });

// 交易系统
// import TradingModel from '@src/pages/Transaction/TradingModel';
const TradingModel = Loadable({ loader: () => import('@src/pages/Transaction/TradingModel'), loading: DelayLoading });
// import OrderList from '@src/pages/Transaction/OrderList';
const OrderList = Loadable({ loader: () => import('@src/pages/Transaction/OrderList'), loading: DelayLoading });
// import OrderList from '@src/pages/Transaction/Invoice';
const Invoice = Loadable({ loader: () => import('@src/pages/Transaction/Invoice'), loading: DelayLoading });


// 产品管理
import ProManage from '@src/pages/Products/ProductManage';
// 机箱价格管理
import ProPriceServerBox from '@src/pages/Products/Prices/ServerBox';
// const ProPriceServerBox  = Loadable({loader: () => import('@src/pages/Products/Prices/ServerBox'), loading: DelayLoading});
// 硬盘价格管理
// import ProPriceHardDisk from '@src/pages/Products/Prices/HardDisk';
const ProPriceHardDisk = Loadable({ loader: () => import('@src/pages/Products/Prices/HardDisk'), loading: DelayLoading });
// 内存价格管理
import ProPriceRam from '@src/pages/Products/Prices/Ram';
// const ProPriceRam  = Loadable({loader: () => import('@src/pages/Products/Prices/Ram'), loading: DelayLoading});
// cpu价格管理
import ProPriceCpu from '@src/pages/Products/Prices/Cpu';
// const ProPriceCpu  = Loadable({loader: () => import('@src/pages/Products/Prices/Cpu'), loading: DelayLoading});
// Raid价格管理
import ProPriceRaid from '@src/pages/Products/Prices/Raid';
// const ProPriceRaid  = Loadable({loader: () => import('@src/pages/Products/Prices/Raid'), loading: DelayLoading});
// 机柜价格管理
import ProPriceCabinet from '@src/pages/Products/Prices/Cabinet';
// const ProPriceCabinet  = Loadable({loader: () => import('@src/pages/Products/Prices/Cabinet'), loading: DelayLoading});
// 机柜价格管理
import ProPriceServerPrice from '@src/pages/Products/Prices/ServerPrice';
// const ProPriceServerPrice  = Loadable({loader: () => import('@src/pages/Products/Prices/ServerPrice'), loading: DelayLoading});
// 机柜价格管理
import ProCreatRes from '@src/pages/Products/Creation/Resource';
// const ProCreatRes  = Loadable({loader: () => import('@src/pages/Products/Creation/Resource'), loading: DelayLoading});
// Ip价格管理
import ProPriceIp from '@src/pages/Products/Prices/Ip';
// const ProPriceIp = Loadable({loader: () => import('@src/pages/Products/Prices/Ip'), loading: DelayLoading});
// 带宽价格管理
import ProPriceBandWidth from '@src/pages/Products/Prices/Bandwidth';
const Home         = Loadable({loader: () => import('@src/pages/Home'), loading: DelayLoading});
// 类目管理
// import CategoryManage from '@src/pages/Products/Category';
const CategoryManage = Loadable({loader: () => import('@src/pages/Products/Category'), loading: DelayLoading});
const configs = [
  { name: '控制台', component: Home, exact: true, path: '/home', Authority: ['ALL'] },
  // 用户管理模块
  { name: '用户列表', component: UserAdmin, exact: true, path: '/user/list', Authority: ['user-view'] },
  { name: '角色管理', component: RoleAdmin, exact: true, path: '/user/role', Authority: ['role-view'] },
  // 资源模块
  { name: '区域管理', component: ResourcesArea, exact: true, path: '/resources/manage/area', Authority: ['area-view'] },
  { name: '机房管理', component: ResourcesHouse, exact: true, path: '/resources/manage/house', Authority: ['house-view'] },
  { name: '机柜分布图', component: RegionMap, exact: true, path: '/resources/manage/house/map', Authority: ['cabinet-u-view'] },
  { name: '机柜', component: ResourcesCabinet, exact: true, path: '/resources/manage/cabinet', Authority: ['cabinet-u-view'] },
  { name: '机柜U位管理', component: ResourcesUBitManage, path: '/resources/manage/cabinet/:id', Authority: ['cabinet-u-view'] },
  { name: '网络设备管理', component: RsNetworkDevices, path: '/resources/networkdevices/manage', Authority: ['network-devices-view'] },
  { name: '端口模板管理', component: RsPortTemp, path: '/resources/networkdevices/porttemp', Authority: ['network-devices-view'] },
  { name: '服务器外机管理', component: RsOutsideMachine, path: '/resources/server/outsidemachine', Authority: ['node-server-view'] },
  { name: '服务器管理', component: ResourcesServer, path: '/resources/server/manage', Authority: ['server-view'] },
  { name: '内存型号', component: ResourcesRamType, exact: true, path: '/resources/severparts/ramtype', Authority: ['memorymodel-view'] },
  { name: '内存列表', component: ResourcesRamList, exact: true, path: '/resources/severparts/ramlist', Authority: ['memorydetail-view'] },
  { name: '硬盘型号', component: ResourcesHdType, exact: true, path: '/resources/severparts/hdtype', Authority: ['diskmodel-view'] },
  { name: '硬盘列表', component: ResourcesHdList, exact: true, path: '/resources/severparts/hdlist', Authority: ['diskdetail-view'] },
  { name: 'CPU型号', component: ResourcesCpuType, exact: true, path: '/resources/severparts/cputype', Authority: ['cpumodel-view'] },
  { name: 'CPU列表', component: ResourcesCpuList, exact: true, path: '/resources/severparts/cpulist', Authority: ['cpudetail-view'] },
  { name: 'RAID型号', component: ResourcesRaidType, exact: true, path: '/resources/severparts/raidtype', Authority: ['raidModel-view'] },
  { name: 'RAID列表', component: ResourcesRaidList, exact: true, path: '/resources/severparts/raidlist', Authority: ['raiddetail-view'] },
  { name: '产品组服务器配件同步', component: ProductServerlist, exact: true, path: '/datacompaty/productserverlist', Authority: ['ALL'] },
  { name: '父模板列表', component: Parentlist, exact: true, path: '/datacompaty/parentlist', Authority: ['ALL'] },
  { name: '父模板子模板服务器', component: ParmobanServerlist, exact: true, path: '/datacompaty/parmobanserverlist', Authority: ['ALL'] },
  { name: 'IP资源', component: ResourcesIP, exact: true, path: '/resources/IP/resource', Authority: ['ipSegment-view'] },
  { name: 'IP详情', component: DetailsIP, exact: true, path: '/resources/IP/details', Authority: ['ipAddr-view'] },
  { name: '配件类型配件同步', component: PartTypelist, exact: true, path: '/datacompaty/parttypelist', Authority: ['ALL'] },
  { name: '字典管理', component: DictManage, exact: true, path: '/dict/manage', Authority: ['ALL'] },
  { name: 'IP黑名单', component: IpBlackList, exact: true, path: '/resources/Ip/blacklist', Authority: ['ipBlackList-view'] },
  // 用户后台管理中心
  { name: '协议模板管理', component: AgreementTemplate, exact: true, path: '/customermanage/agreement', Authority: ['protocol-view'] },
  { name: '实名认证列表', component: RealName, exact: true, path: '/customermanage/realname', Authority: ['customerAuth-view'] },
  { name: '客户信息管理', component: CustomerInformation, exact: true, path: '/customermanage/information', Authority: ['customerInfo-view'] },
  { name: '销售和销售支持管理', component: SalesAndsupport, exact: true, path: '/customermanage/sales', Authority: ['salePersonnel-view'] },
  { name: '客户代理等级设置', component: ClientAgent, exact: true, path: '/customermanage/agentlevel', Authority: ['agencyLevel-view'] },
  // 交易系统
  { name: '交易模式', component: TradingModel, exact: true, path: '/transaction/tradingmodel', Authority: ['ALL'] },
  { name: '订单列表', component: OrderList, exact: true, path: '/transaction/ordermanage/list', Authority: ['ALL'] },
  { name: '发票管理', component: Invoice, exact: true, path: '/transaction/invoicemanage', Authority: ['ALL'] },

  // 产品模块
  {name: '服务器价格查询', component: ProPriceServerPrice, exact: true, path: '/products/prices/serverprice', Authority: ['ALL']},
  {name: '硬盘价格管理', component: ProPriceHardDisk, exact: true, path: '/products/prices/hardware/harddisk', Authority: ['ALL']},
  {name: '内存价格管理', component: ProPriceRam, exact: true, path: '/products/prices/hardware/ram', Authority: ['ALL']},
  {name: '类目管理', component: CategoryManage, exact: true, path: '/products/category', Authority: ['ALL']},
  {name: 'CPU价格管理', component: ProPriceCpu, exact: true, path: '/products/prices/hardware/Cpu', Authority: ['ALL']},
  {name: 'CPU价格管理', component: ProPriceCpu, exact: true, path: '/products/prices/hardware/cpu', Authority: ['ALL']},
  {name: '机箱价格管理', component: ProPriceServerBox, exact: true, path: '/products/prices/hardware/serverbox', Authority: ['ALL']},
  {name: '机柜价格管理', component: ProPriceCabinet, exact: true, path: '/products/prices/hardware/cabinet', Authority: ['ALL']},
  {name: 'RAID价格管理', component: ProPriceRaid, exact: true, path: '/products/prices/hardware/raid', Authority: ['ALL']},
  {name: 'IP价格管理', component: ProPriceIp, exact: true, path: '/products/prices/network/ip', Authority: ['ALL']},
  {name: '带宽价格管理', component: ProPriceBandWidth, exact: true, path: '/products/prices/network/bandwidth', Authority: ['ALL']},
  // 产品创建
  {name: '资源型产品创建', component: ProCreatRes, exact: true, path: '/products/creation/resource', Authority: ['ALL']},
  // 产品管理
  {name: '产品管理', component: ProManage, exact: true, path: '/products/manage', Authority: ['ALL']},
];
// 用于选项卡显示
const pathConfig = [

  /** 用户模块00xxxx */
  { code: '000000', name: '控制台', path: '/home' },
  // 用户管理模块0001xx
  { name: '用户管理', path: '/user' },
  { code: '000102', name: '用户列表', path: '/user/list' },
  { code: '000103', name: '角色管理', path: '/user/role' },
  // 用户字典管理0002xx
  { name: '用户字典管理', path: '/dict' },
  { code: '000201', name: '字典管理', path: '/dict/manage' },

  /**  资源模块 01xxxx */
  { name: '资源管理', path: '/resources' },
  // 机房机柜管理 0101xx
  { name: '机房机柜管理', path: '/resources/manage' },
  { code: '010101', name: '地区管理', path: '/resources/manage/area' },
  { code: '010102', name: '机房管理', path: '/resources/manage/house' },
  { code: '', name: '机柜分布图', path: '/resources/manage/house/map' },
  { code: '010103', name: '机柜管理', path: '/resources/manage/cabinet' },
  { code: '', name: '机柜U位管理', path: '/resources/manage/cabinet/:id' },
  // 网络设备0102xx
  { name: '网络设备管理', path: '/resources/networkdevices' },
  { code: '010201', name: '网络设备管理', path: '/resources/networkdevices/manage' },
  { code: '010202', name: '端口模板管理', path: '/resources/networkdevices/porttemp' },
  // 服务器管理0103xx
  { name: '服务器管理', path: '/resources/server' }, // 用户动态生成面包屑使用
  { code: '010301', name: '服务器外机管理', path: '/resources/server/outsidemachine' },
  { code: '010302', name: '服务器管理', path: '/resources/server/manage' },
  // 服务器固件管理0104xx
  { name: '服务器固件管理', path: '/resources/severparts' },
  { code: '010401', name: '内存型号', path: '/resources/severparts/ramtype' },
  { code: '010402', name: '内存列表', path: '/resources/severparts/ramlist' },
  { code: '010403', name: '硬盘型号', path: '/resources/severparts/hdtype' },
  { code: '010404', name: '硬盘列表', path: '/resources/severparts/hdlist' },
  { code: '010405', name: 'CPU型号', path: '/resources/severparts/cputype' },
  { code: '010406', name: 'CPU列表', path: '/resources/severparts/cpulist' },
  { code: '010407', name: 'RAID型号', path: '/resources/severparts/raidtype' },
  { code: '010408', name: 'RAID列表', path: '/resources/severparts/raidlist' },
  // ip黑名单0105xx
  { name: 'IP管理', path: '/resources/Ip' },
  { code: '010501', name: 'IP黑名单', path: '/resources/Ip/blacklist' },
  { code: '010502', name: 'IP资源', path: '/resources/IP/resource' },
  { code: '010503', name: 'IP详情', path: '/resources/IP/details' },
  // 数据兼容0199xx
  { name: '产品组服务器配件同步', path: '/datacompaty' },
  { code: '019901', name: '产品组服务器配件同步', path: '/datacompaty/productserverlist' },
  { code: '019902', name: '父模板列表', path: '/datacompaty/parentlist' },
  { code: '019903', name: '父模板子模板服务器', path: '/datacompaty/parmobanserverlist' },
  { code: '019904', name: '配件类型配件同步', path: '/datacompaty/parttypelist' },
  // 客户管理中心 02xxxx
  { name: '客户管理中心', path: '/customermanage' },
  { code: '020101', name: '协议模板管理', path: '/customermanage/agreement' },
  { code: '020102', name: '实名认证列表', path: '/customermanage/realname' },
  { code: '020103', name: '客户信息管理', path: '/customermanage/information' },
  { code: '020104', name: '销售和销售支持管理', path: '/customermanage/sales' },
  { code: '020105', name: '客户代理等级设置', path: '/customermanage/agentlevel' },
  // 交易系统
  { name: '交易系统', path: '/transaction' },
  { code: '', name: '交易模式', path: '/transaction/tradingmodel' },
  { code: '', name: '订单列表', path: '/transaction/ordermanage/list' },
  { code: '', name: '发票管理', path: '/transaction/invoicemanage' },

  // 产品管理
  {name: '产品管理', path: '/products'},
  {code: '', name: '内存价格管理',  path: '/products/prices/hardware/ram'},
  {code: '030100', name: '类目管理', path: '/products/category'},
  {code: '030101', name: '资源型产品创建', path: '/products/creation/resource'},
  {code: '030203', name: '机箱价格管理',  path: '/products/prices/hardware/serverbox'},
  {code: '030201', name: '内存价格管理',  path: '/products/prices/hardware/ram'},
  {code: '030202', name: 'CPU价格管理',  path: '/products/prices/hardware/cpu'},
  {code: '030203', name: '硬盘价格管理',  path: '/products/prices/hardware/harddisk'},
  {code: '030204', name: 'RAID价格管理',  path: '/products/prices/hardware/raid'},
  {code: '030205', name: '机柜价格管理',  path: '/products/prices/hardware/cabinet'},
  {code: '030206', name: '服务器价格查询',  path: '/products/prices/serverprice'},
  {code: '030207', name: 'ip价格管理',  path: '/products/prices/network/ip'},
  {code: '030208', name: '带宽价格管理',  path: '/products/prices/network/bandwidth'},
  {code: '030209', name: '产品管理', path: '/products/manage'},
];

export default {
  routerConfig: configs,
  pathConfig: pathConfig,
  getPathInfo: (name, value) => {
    let index = _.findIndex(pathConfig, (item) => item[name] == value);
    if (index == -1) {
      return {};
    }
    return pathConfig[index];

  }
};
