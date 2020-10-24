
// 汇总store
// 整个项目公共部分
import root from './root';
// 用户模块管理相关
import system from './system';
// 资源模块
import resources from './resources';
// 产品模块
import product from './product';
// 用户字典模块
import dict from './dict';

const store = {
  root,
  ...system,
  ...resources,
  ...product,
  ...dict,
};
export default store;

