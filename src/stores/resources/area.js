import { observable, action, computed, runInAction, flow} from 'mobx';
import { message } from 'antd';
import tools from '@src/util/tools';
import _ from 'lodash';
import {ApiService as Fetchapi} from '@src/util/fetch-api'; // 自己写的工具函数，封装了请求数据的通用接口

/** 处理原始数据，将原始数据处理为层级关系 **/

function makeSourceData (data) {
  const d = _.cloneDeep(data);
  // 按照sort排序
  d.sort((a, b) => a.sort - b.sort);
  const sourceData = tools.dataToJson(null, d, null, '-1') || [];
  // const sourceData2 = tools.dataToJson(null, d, null);
  return sourceData;
}
class AreaList {
  @observable areaList = []; // 地区数据原始数据
  @observable areaTreeList = []; // 地区数据原始数据 树形结构
  @observable houseTreeList = []; // 机房数据 树形结构
  @observable houseList = []; // 机房数据原始数据
  @observable regionList = []; // 所有区域原始数据
  @observable vareaList = []; // 所有区域视图信息
  @observable rootAreaList = []; // 顶级地区
  // @observable areaTreeList2 = [];// 机房不含根节点的树形结构
  @action setAreaData = (list) => {
    this.areaList = list;
    this.rootAreaList = _.filter(list, (area) => area.parId == 0);
    this.areaTreeList = makeSourceData(list);
  }
  @action setHouseData = (list) => {
    let house = [];
    _.map(list, (item) => {
      house.push({
        id: item.id,
        name: item.name,
        localInfo: item.localInfo, // 机房所在地区
        fullName: `${item.localInfo}-${item.name}` // 地区和机房拼接
      });
    });
    this.houseTreeList = list;
    this.houseList = house;
  }
  @action setRegionData = (list) => {
    list.sort((a, b) => a.districtName - b.districtName);
    this.regionList = list;
  }
  @action setVarea = (list) => {
    // list.sort((a, b) => a.districtName - b.districtName);
    this.vareaList = list;
  }

  /**
   * 获取区域
   */
  fetchArea = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/product/area?showRoot=1`);
        const data = response.data.data;
        this.setAreaData(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

  /**
   * 获取机房
   */
  fetchHouse = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/product/house`);
        const data = response.data.data;
        this.setHouseData(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

  /**
   * 获取区域
   */
  fetchRegion = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/product/floor`);
        const data = response.data.data;
        this.setRegionData(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

  /**
   * 获取区域视图
   */
  fetchVarea = flow(
    function * () {
      try {
        // const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/product/varea/list?type=region`);
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/product/varea/list?menType=region`);
        const data = response.data.data;
        this.setVarea(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

}

const AreaResouse = new AreaList();
export default AreaResouse;
