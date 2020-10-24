
// 用户管理模块状态管理
import { observable, action, computed, runInAction} from 'mobx';
import {ApiService as Fetchapi} from '@src/util/fetch-api'; // 自己写的工具函数，封装了请求数据的通用接口
import { message } from 'antd';
import http from '@src/util/http';
class AuthManage {
  @observable powerTreeData = [] // 分配权限treeTable组件所需原始数据
  @observable powers = [] // 分配权限treeTable组件所需原始数据
  @observable region = [] // 区域信息

  /**
   * 获取地区信息
   * **/
  @action getAreas = async (params = {}) => {
    try {
      console.log(params);
      const res = await http.get(`${BSS_ADMIN_URL}/api/product/area`, {params: params});
      // if (res.data.code === 20000) {
      //   this.region = res.data.data;
      //   console.log('this.region', this.region);
      // }
      return res.data;
    } catch (err) {
      message.error("网络错误，请重试");
    }
  };

  /**
   * 添加角色
   * **/
  @action addRole = async (params = {}) => {
    try {
      const res = await http.post(`${BSS_ADMIN_URL}/api/user/role/add`, params);
      return res.data;
    } catch (err) {
      message.error("网络错误，请重试");
    }
  };

  /**
   * 修改角色
   * **/
  @action upRole = async (id, params) => {
    try {
      const res = await http.put(`${BSS_ADMIN_URL}/api/user/role/update/${id}/`, params);
      return res.data;
    } catch (err) {
      message.error("网络错误，请重试");
    }
  };

  /**
   * 删除角色
   * **/
  @action delRole = async (id) => {
    try {
      const res = await http.delete(`${BSS_ADMIN_URL}/api/user/role/delete/${id}/`);
      return res.data;
    } catch (err) {
      message.error("网络错误，请重试");
    }
  };

}

let authManage = new AuthManage();
export default authManage;
