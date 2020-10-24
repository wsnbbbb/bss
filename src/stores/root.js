// app全局性状态管理
import { observable, action, computed, runInAction} from 'mobx';
import {ApiService as Fetchapi} from '@src/util/fetch-api'; // 自己写的工具函数，封装了请求数据的通用接口
import Axios from 'axios';
import {Modal} from 'antd';
import http from '@src/util/http';
import qs from 'qs';
class AppStore {
  @observable language = 'ch';// 语言
  @observable sidemenuExpanded = true; // 左侧菜单展开
  @observable userInfo ={}; // 用户信息
  @observable roles = []; // 当前用户拥有的所有角色
  @observable powers = []; // 当前用户拥有的权限code列表，页面中的按钮的权限控制将根据此数据源判断

  // 修改语言
  @computed  get changeLang () {
    console.log('ernter changelang');
    this.language = language;
    console.log(this.language);
  };

  set changeLang (language) {
    this.language = language;
    console.log(this.language);
  }

  /**
   * 列表数据
   * @payload
   * **/
  @action getData = async (payload) => {
    try {
      const res = await Fetchapi.getTopicsList(payload);
      runInAction(() => {
        this.list = res.data;
      });
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * 登录
   * @payload: { username, password }
   * **/
  @action onLogin = async (payload) => {
    console.log(Fetchapi.newAxios);
    try {
      const res = await Axios.post(`${BSS_ADMIN_URL}/api/user/login`, qs.stringify(payload));
      return res.data;
    } catch (err) {
      Modal.error('网络错误，请重试');
    }
  };

  /**
   * 退出登录
   * @payload: null
   * **/
  @action onLogout = async () => {
    try {
      await Fetchapi.newFetch('mockapi/logout', payload);
      return 'success';
    } catch (err) {
      Modal.error('网络错误，请重试');
    }
  };

  /**
   * 设置用户信息
   * @payload: userinfo
   * **/
  @action setUserInfo = (payload) => {
    this.userinfo = payload.userInfo;
    this.menus = payload.menus;
    this.roles = payload.roles;
    this.powers = payload.powers.map((item) => item.code);
  };

  /**
   * 获取头部用户消息
   * @payload: { username, password }
   * **/
  @action getNews = async (payload) => {
    try {
      const res = await Fetchapi.newFetch('mockapi/getnews', payload);
      return res.data;
    } catch (err) {
      Modal.error('网络错误，请重试');
    }
  };

  /**
   * 删除头部用户消息
   * @payload: { type }
   * **/
  @action clearNews = async (payload) => {
    try {
      const res = await Fetchapi.newFetch('mockapi/clearnews', payload);
      return res.data;
    } catch (err) {
      Modal.error('网络错误，请重试');
    }
  };

  /**
   * 获取用户消息的总数
   * @payload: { type }
   * **/
  @action getNewsTotal = async (payload) => {
    try {
      const res = await Fetchapi.newFetch('mockapi/getnewstotal', payload);
      return res.data;
    } catch (err) {
      Modal.error('网络错误，请重试');
    }
  };

  /**
   * 获取所有收藏菜单
   * **/
  @action getMenus = async (params = {}) => {
    try {
      const res = await Fetchapi.newFetch("mockapi/getmenus", params);
      return res.data;
    } catch (err) {
      message.error("网络错误，请重试");
    }
  };

  /**
   * 添加收藏菜单
   * @params: {
      'name',
      'url',
      'icon',
      'desc',
    * }
  * **/
  @action addMenu = async (params = {}) => {
    try {
      const res = await Fetchapi.newFetch("mockapi/addmenu", params);
      return res.data;
    } catch (err) {
      message.error("网络错误，请重试");
    }
  };

  /**
   * 修改收藏菜单
   * **/
  @action upMenu = async (params = {}) => {
    try {
      const res = await Fetchapi.newFetch("mockapi/upmenu", params);
      return res.data;
    } catch (err) {
      message.error("网络错误，请重试");
    }
  };
}

let root = new AppStore();
export default root;
