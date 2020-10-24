import { observable, action, computed, runInAction, flow} from 'mobx';
import { message } from 'antd';
import tools from '@src/util/tools';
import _ from 'lodash';
import {ApiService as Fetchapi} from '@src/util/fetch-api'; // 自己写的工具函数，封装了请求数据的通用接口

/** 处理原始数据，将原始数据处理为层级关系 **/

function makeSourceData (data) {
  const d = _.cloneDeep(data);
  const sourceData = tools.dataToJson(null, d, null, '0') || [];
  return sourceData;
}
class CategoryList {
  @observable categoryList = []; // 业务（类目）
  @observable categoryTreeList = []; // 类目 树形结构
  @observable rootCategoryList = []; // 一级类目
  @action setCategoryData = (list) => {
    this.categoryList = list;
    this.rootCategoryList = _.filter(list, (category) => category.parId == 0);
    this.categoryTreeList = makeSourceData(list);
  }

  /**
   * 获取区域
   */
  fetchCategory = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/goods/category`);
        const data = response.data.data;
        this.setCategoryData(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

}

const CategoryProduct = new CategoryList();
export default CategoryProduct;
