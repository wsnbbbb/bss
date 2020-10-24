/** 这个文件中封装了一些常用的工具函数 **/
import _ from 'lodash';
import React from 'react';
import { Modal, Tag } from 'antd';
import Axios from 'axios';
import { User } from './user';
import { getEmptyImage } from 'react-dnd-html5-backend';
const tools = {

  /**
    保留N位小数
    最终返回的是字符串
    若转换失败，返回参数原值
    @params
      str - 数字或字符串
      x   - 保留几位小数点
  */
  pointX (str, x = 0) {
    if (!str && str !== 0) {
      return str;
    }
    const temp = Number(str);
    if (temp === 0) {
      return temp.toFixed(x);
    }
    return temp ? temp.toFixed(x) : str;
  },

  /**
     去掉字符串两端空格
  */
  trim (str) {
    const reg = /^\s*|\s*$/g;
    return str.replace(reg, '');
  },

  /**
    给字符串打马赛克
    如：将123456转换为1****6，最多将字符串中间6个字符变成*
    如果字符串长度小于等于2，将不会有效果
  */
  addMosaic (str) {
    const s = String(str);
    const lenth = s.length;
    const howmuch = (() => {
      if (s.length <= 2) {
        return s.length;
      }
      const l = s.length - 2;
      if (l <= 6) {
        return l;
      }
      return 6;
    })();
    const start = Math.floor((lenth - howmuch) / 2);
    const ret = s.split('').map((v, i) => {
      if (i >= start && i < start + howmuch) {
        return '*';
      }
      return v;
    });
    return ret.join('');
  },

  /**
   * 验证字符串
   * 只能为字母、数字、下划线
   * 可以为空
   * **/
  checkStr (str) {
    if (str === '') {
      return true;
    }
    const rex = /^[_a-zA-Z0-9]+$/;
    return rex.test(str);
  },

  /**
   * 验证字符串
   * 只能为数字
   * 可以为空
   * **/
  checkNumber (str) {
    if (!str) {
      return true;
    }
    const rex = /^\d*$/;
    return rex.test(str);
  },

  // 格式化金额
  formatterMoney (value) {
    retrurn `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  // 只能输入数字
  parserNumber (value) {
    retrurn `$ ${value}`.replace(/\$\s?|(,*)/g, '');
  },

  /**
    字符串加密
    简单的加密方法
  */
  compile (code) {
    let c = String.fromCharCode(code.charCodeAt(0) + code.length);
    for (let i = 1; i < code.length; i++) {
      c += String.fromCharCode(code.charCodeAt(i) + code.charCodeAt(i - 1));
    }
    return c;
  },

  /**
    字符串解谜
    对应上面的字符串加密方法
  */
  uncompile (code) {
    let c = String.fromCharCode(code.charCodeAt(0) - code.length);
    for (let i = 1; i < code.length; i++) {
      c += String.fromCharCode(code.charCodeAt(i) - c.charCodeAt(i - 1));
    }
    return c;
  },

  /**
   * 清除一个对象中值为undefined 和 null的属性
   * 0 算有效值
   * **/
  clearNull (obj) {
    if (obj == undefined) {
      return {};
    }
    const temp = {};
    Object.keys(obj).forEach((item) => {
      if (obj[item] !== undefined && obj[item] !== null) {
        temp[item] = obj[item];
      }
    });
    return temp;
  },

  /**
   * 清除一个对象中值为undefined 和 null 和 ''的属性
   * 主要用于查询条件(清除筛选条件后，值为'')
   * **/
  clearEmpty  (obj) {
    if (obj == undefined) {
      return {};
    }
    const temp = {};
    Object.keys(obj).forEach((item) => {
      if (obj[item] !== undefined && obj[item] !== null && obj[item] !== '') {
        temp[item] = obj[item];
      }
    });
    return temp;
  },
  // 空值校验 主要用于必填参数校验 校验值是否为 undefined null 和空字符串
  isEmpty (val) {
    if (val == undefined || val == null || val == '' || (_.isString(val) && val.trim() == '')) {
      return true;
    }
    return false;
  },

  /**
   * 工具递归将扁平数据转换为层级数据
   * 思路：1.将parId为0的顶级元素取出来
   * 2.递归的将元素下挂的子元素取出挂在children下
   */
  dataToJson (one, data, key, parid = '0') {
    let kids;
    if (!one) {
      // 第1次递归取出顶级元素
      kids = data.filter((item) => item.parId === parid);
    } else {
      kids = data.filter((item) => item.parId === one.id);
    }
    kids.forEach((item) => (item.children = this.dataToJson(item, data)));
    return kids.length ? kids : null;
  },
  // 生成机构树
  formatTree (arr) {
    let copyedObj = _.cloneDeep(arr);  // 深拷贝源数据
    return copyedObj.filter((parent) => {
      let findChildren = copyedObj.filter((child) => parent.id === child.parId);
      findChildren.length > 0 ? parent.children = findChildren : parent.children = [];
      return parent.parId == 0;   // 返回顶层，依据实际情况判断这里的返回值
    });
  },


  /** 处理原始数据，将原始数据处理为层级关系
   * 主要用于地区数据的处理
   * **/
  makeSourceData (data) {
    const d = _.cloneDeep(data);
    // 按照sort排序
    d.sort((a, b) => a.sort - b.sort);
    const sourceData = this.dataToJson(null, d) || [];
    return sourceData;
  },

  // 防抖函数
  debounce (fn, wait) {
    let timeout = null;
    return function (input) {
      input.persist();
      if (timeout !== null) {clearTimeout(timeout);}
      timeout = setTimeout(fn, wait, input);
    };
  },

  // 判断接口返回状态成功为true 不成功为false
  hasStatusOk (res) {
    if (res.code === 20000) {
      return true;
    } else {
      return false;
    }
  },
  // 自动关闭的反馈提示
  auto_close_result (state, title, message) {
    let secondsToGo = 30;
    let modal;
    if (state == 'ok') {
      modal = Modal.success({
        title: title,
        content: message,
      });
    } else {
      modal = Modal.error({
        title: title,
        content: message,
      });

    }
    const timer = setInterval(() => {
      secondsToGo -= 1;
      modal.update({
        content: message,
      });
    }, 1000);
    setTimeout(() => {
      clearInterval(timer);
      modal.destroy();
    }, secondsToGo * 1000);
  },

  // 处理接口返回200状态码下的失败信息
  dealFail (res) {
  // 正常返回进入异常处理的情况下处理
    switch (res.code) {
    // 错误，需要前端提示信息message
    case 20010:
      Modal.error({
        title: '操作失败',
        content: res.message,
      });
      break;
      // 错误，表示json格式的的字符串
    case 20011:
      if (_.isString(res.message)) {
        Modal.error({
          title: '操作失败',
          // content: (<ul>{_.map(JSON.parse(res.message), (key, value) => <li> {value}:{key} </li>)}</ul>),
          content: res.message,
        });
      } else {
        Modal.error({
          title: '操作失败',
          content: (<ul>{_.map(res.message, (key, value) => <li> {value}:{key} </li>)}</ul>),
        });
      }
      break;
      // 权限不足
    case 20020:
      Modal.error({
        title: '操作失败',
        content: "你的权限不足，请联系管理员开通权限",
      });
      break;
      // 权限不足
    case 20030:
      Modal.error({
        title: '操作失败',
        content: '资源已经存在',
      });
      break;
      // 权限不足
    case 20040:
      Modal.error({
        title: '操作失败',
        content: '资源为空',
      });
      break;
    case 99999:
      Modal.error({
        title: '操作失败',
        content: res.message,
      });
      break;
    };
  },

  // 自动关闭的反馈提示
  autoCloseResult (state, title, message) {
    let secondsToGo = 30;
    let modal;
    if (state == 'ok') {
      modal = Modal.success({
        title: title,
        content: message,
      });
    } else {
      modal = Modal.error({
        title: title,
        content: message,
      });
    }
    const timer = setInterval(() => {
      secondsToGo -= 1;
      modal.update({
        content: message,
      });
    }, 1000);
    setTimeout(() => {
      clearInterval(timer);
      modal.destroy();
    }, secondsToGo * 1000);
  },

  // 查询参数格式化
  parseQueryString (url) {
    const obj = {};
    if (url.indexOf('?') !== -1) {
      const str = url.split('?')[1];
      const strs = str.split('&');
      strs.map((item, i) => {
        const arr = strs[i].split('=');
        obj[arr[0]] = arr[1];
      });
    }
    return obj;
  },

  /**
   *新窗口打开连接
   * @param {跳转地址} url
   * @param {是否新窗口打开} target ：_blank | _self
   */
  handleOpenWindow (url, target) {
    const link = document.createElement('a');
    link.style.display = 'none';
    link.target = target || '_self';
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // 下载
  download (url, param = {}) {
    event.preventDefault();// 使a自带的方法失效，即无法调整到href中的URL
    Axios({
      method: 'get',
      url: url,
      responseType: 'blob',
      headers: {
        'Authorization': 'token ' + User.getToken(),
      },
      params: this.clearEmpty(param)
    }).then((res) => {
      const link = document.createElement('a');
      let blob = new Blob([res.data], {type: 'application/octet-stream'});
      let fileName = decodeURI(res.headers['filename']);
      link.style.display = 'none';
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
      .catch((error) => {
        console.log(error);
      });
  },
  // 时间转换工具
  getTime (time) {
    let d = new Date(time);
    let times = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ';
    return times;
  },

  // 用户权限判断
  permission (arr) {
    if (arr[0] == 'ALL') { // 不设置权限的模块
      return true;
    }
    let permissions = [];
    if (!this.isEmpty(localStorage.getItem('permission'))) {
      permissions = JSON.parse(localStorage.getItem('permission')) || [];
    } else if (!this.isEmpty(sessionStorage.getItem('permission'))) {
      localStorage.setItem('permission', sessionStorage.getItem('permission'));
      permissions = JSON.parse(sessionStorage.getItem('permission')) || [];
    }
    let flag = false;
    // 如果用户没有权限
    if (permissions.length == 0) {
      return false;
    }
    // 如果菜单权限配置的是数组，存在一个就返回真
    for (let i = 0; i < arr.length; i++) {
      if (permissions.includes(arr[i])) {
        flag = true;
        break;
      }
    }
    return flag;
  },

  // 下拉搜索，根据下拉框的内容进行搜索
  filterOption (input, option) {
    let letter  = _.join(option.children, '').toLowerCase();
    let val = input.toLowerCase();
    let par = new RegExp(val);
    return par.test(letter);
  },

  // 返回带状态颜色的字典值
  renderStatus (sys_dict_obj, key) {
    let color = '#ccc'; // 未知状态的颜色
    let text1 = 'UNKNOW'; // 未知状态的文本
    if (sys_dict_obj[key]) {
      color = sys_dict_obj[key].color;
      text1 = sys_dict_obj[key].text;
    }
    return <Tag color={color}>{text1}</Tag>;
  },

  /**
   * 根据级联元素的最后一个值。获取上级的数据id
   * 返回值为数组
   * @param {array} data
   * @param {string} lastkey
   */
  getCascaderValues (data, lastkey, result) {
    if (!lastkey) {
      return [];
    }
    result.push(lastkey);
    for (let i = 0; i < data.length; i++) {
      // console.log(data[i]);
      if (data[i].id == lastkey) {
        if (data[i].parId == 0) {
          return result;
        } else {
          return this.getCascaderValues(data, data[i].parId, result);
        }
      }
    }
  }

};

export default tools;
