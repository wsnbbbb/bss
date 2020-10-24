import Cookies from 'js-cookies';
import tools from './tools';
window.Cookies = Cookies;
export const User = {
  getInfo: () => {
    if (!tools.isEmpty(localStorage.getItem('user'))) {
      return JSON.parse(localStorage.getItem('user'));
    }
    if (!tools.isEmpty(sessionStorage.getItem('user'))) {
      return JSON.parse(sessionStorage.getItem('user'));
    }
    return {};
  },
  setInfo: (value) => {
    sessionStorage.setItem('user', JSON.stringify(value));
    localStorage.setItem('user', JSON.stringify(value));
  },
  setToken: (value) => {
    // Cookies.setItem('autoToken', `${value}`);
    // Cookies.setItem('token', `${value}`);
    localStorage.setItem('autoToken', `${value}`);
  },
  getToken: () => localStorage.getItem('autoToken'),
  // if (Cookies.getItem('autoToken')) {
  //   return Cookies.getItem('autoToken');
  // }
  // if (Cookies.getItem('token')) {
  //   return Cookies.getItem('token');
  // }

  getUserName: () => {
    if (!tools.isEmpty(localStorage.getItem('user'))) {
      return JSON.parse(localStorage.getItem('user')) && JSON.parse(localStorage.getItem('user')).loginName;
    } else if (!tools.isEmpty(sessionStorage.getItem('user'))) {
      return JSON.parse(sessionStorage.getItem('user')) && JSON.parse(sessionStorage.getItem('user')).loginName;
    }
    return '';
  },
  // 用户权限
  getPermission: () => {
    let permissions = [];
    if (!tools.isEmpty(localStorage.getItem('permission'))) {
      permissions = JSON.parse(localStorage.getItem('permission')) || [];
    } else if (!tools.isEmpty(sessionStorage.getItem('permission'))) {
      localStorage.setItem('permission', sessionStorage.getItem('permission'));
      permissions = JSON.parse(sessionStorage.getItem('permission')) || [];
    }
    return permissions;
  },
  setPermission: (value) => {
    sessionStorage.setItem('permission', JSON.stringify(value));
    localStorage.setItem('permission', JSON.stringify(value));
  },
  hasPermission: (des) => {
    let permissions = [];
    if (!tools.isEmpty(localStorage.getItem('permission'))) {
      permissions = JSON.parse(localStorage.getItem('permission')) || [];
    } else if (!tools.isEmpty(sessionStorage.getItem('permission'))) {
      localStorage.setItem('permission', sessionStorage.getItem('permission'));
      permissions = JSON.parse(sessionStorage.getItem('permission')) || [];
    }
    return permissions.includes(des);
  }
};
