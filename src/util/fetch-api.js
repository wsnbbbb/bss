import reqwest from 'reqwest'; // 封装了ajax请求的库
import axios from 'axios'; // 封装了fetch请求的库
import _ from 'lodash';
import {Modal} from 'antd';
import qs from 'qs';
import http from './http';

// 调mockapi
const baseUrl = "http://localhost:8889";
export class ApiService {
  // ajax请求
  static newPost (url, bodyObj = {}) {
    return reqwest({
      url: `${baseUrl}/${url}`, // URL
      method: 'post', // 请求方式
      contentType: 'application/json;charset=utf-8', // 消息主体数据类型 JSON
      crossOrigin: true, // 开启CORS跨域
      withCredentials: true, // 请求头中是否带cookie，有利于后端开发保持他们需要的session
      data: JSON.stringify(bodyObj), // 参数，弄成json字符串
      type: 'json' // 参数类型JSON
    });
  }
  // ajax请求
  static newGet (url, bodyObj = {}) {
    return reqwest({
      url: `${baseUrl}/${url}`, // URL
      method: 'get', // 请求方式
      contentType: 'application/json;charset=utf-8', // 消息主体数据类型 JSON
      crossOrigin: true, // 开启CORS跨域
      // withCredentials: true, // 请求头中是否带cookie，有利于后端开发保持他们需要的session
      // data: JSON.stringify(bodyObj), // 参数，弄成json字符串
      type: 'json' // 参数类型JSON
    });
  }
  // fetch请求
  static newFetch (url, bodyObj = {}) {
    return http.post(`${baseUrl}/${url}`, qs.stringify(bodyObj), {
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    });
  }
  // fetch请求
  static newFetchPost (url, bodyObj = {}) {
    return http.post(`${url}`, bodyObj);
  }
  // fetch请求
  static newFetchGet (url, paramsObj) {
    return http.get(`${url}`, {params: paramsObj});
  }
  // fetch请求
  static newPut (url, bodyObj = {}) {
    return http.post(`${baseUrl}/${url}`, qs.stringify(bodyObj), {
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    });
  }
}
