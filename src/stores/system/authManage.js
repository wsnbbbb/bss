
// 用户管理模块状态管理
import { observable, action, computed, runInAction} from 'mobx';
import {ApiService as Fetchapi} from '@src/util/fetch-api'; // 自己写的工具函数，封装了请求数据的通用接口
import { message } from 'antd';
import http from '@src/util/http';
import tools from '@src/util/tools';
import qs from 'qs';
class AuthManage {
  @observable powerTreeData = [] // 分配权限treeTable组件所需原始数据
  @observable powers = [] // 分配权限treeTable组件所需原始数据
  @observable userMenus = [] // 拥有的菜单


  /**
   * 分页查询角色数据
   * **/
  @action getRoles = async (params = {}) => {
    try {
      const res = await http.get(`${BSS_ADMIN_URL}/api/user/role`, {params: params});
      return res.data;
    } catch (err) {
      message.error("网络错误，请重试");
    }
  };
  // 获取单条角色信息
  @action getRoles2 = async (id, params = {}) => {
    try {
      // console.log(params);
      const res = await http.get(`${BSS_ADMIN_URL}/api/user/role/${id}/get`, {params: params});
      return res.data;
    } catch (err) {
      message.error("网络错误，请重试");
    }
  };
  // 获取单条用户信息
  @action getUser = async (id, params = {}) => {
    try {
      // console.log(params);
      const res = await http.get(`${BSS_ADMIN_URL}/api/user/manage/${id}/get`, {params: params});
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
      const res = await http.put(`${BSS_ADMIN_URL}/api/user/role/${id}/update/`, params);
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
      const res = await http.delete(`${BSS_ADMIN_URL}/api/user/role/${id}/delete/`);
      return res.data;
    } catch (err) {
      message.error("网络错误，请重试");
    }
  };

  /**
   * 获取所有权限数据
   * **/
  @action getAllPower = async (params = {}) => {
    try {
      const res = await http.get(`${BSS_ADMIN_URL}/api/user/permissions`, {
        params: params
      });
      return res.data;
    } catch (err) {
      message.error("网络错误，请重试");
    }
  };

  /**
   * 通过角色ID给指定角色设置菜单及权限
   * **/
  @action setPowersByRoleId = async (id, params = {}) => {
  };

  /**
   * 条件分页查询用户列表
   * **/
  @action getUserList = async (params = {}) => {
    try {
      const res = await http.get(`${BSS_ADMIN_URL}/api/user/manage`, {params: params});
      // console.log(res.data);
      return res.data;
    } catch (err) {
      message.error("网络错误，请重试");
    }
  };
  // 获取机构树
  @action getDeptLists = async (params = {}) => {
    try {
      const res = await http.get(`${BSS_ADMIN_URL}/api/user/dept`, {params: params});
      return res.data;
    } catch (err) {
      message.error("网络错误，请重试");
    }
  };

  /**
   * 添加用户
   * **/
  @action addUser = async (params = {}) => {
    try {
      const res = await http.post(`${BSS_ADMIN_URL}/api/user/manage/add`, params);
      return res.data;
    } catch (err) {
      message.error("网络错误，请重试");
    }
  };

  /**
   * 修改用户
   * **/
  @action upUser = async (id, params = {}) => {
    try {
      const res = await http.put(`${BSS_ADMIN_URL}/api/user/manage/${id}/update`, params);
      return res.data;
    } catch (err) {
      message.error("网络错误，请重试");
    }
  };

  /**
   * 删除用户
   * **/
  @action delUser = async (id) => {
    try {
      const res = await http.delete(`${BSS_ADMIN_URL}/api/user/manage/${id}/delete`);
      return res.data;
    } catch (err) {
      message.error("网络错误，请重试");
    }
  };

  /**
   * 给用户分配角色
   * **/
  @action setUserRoles = async (id, params = {}) => {
    try {
      const res = await http.put(`${BSS_ADMIN_URL}/api/user/manage/${id}/roles`, params);
      return res.data;
    } catch (err) {
      message.error("网络错误，请重试");
    }
  };

  /**
   * 改变用户状态
   * **/
  @action setUseStatus = async (id, params = {}) => {
    try {
      const res = await http.put(`${BSS_ADMIN_URL}/api/user/manage/${id}/status`, params);
      return res.data;
    } catch (err) {
      message.error("网络错误，请重试");
    }
  };

  /**
   * 退出登录
   * **/
  @action logOut = async (params = {}) => {
    try {
      const res = await http.get(`http://10.2.5.205:8081/api/user/logout`, params);
      return res.data;
    } catch (err) {
      message.error("网络错误，请重试");
    }
  };

}

let authManage = new AuthManage();
export default authManage;
