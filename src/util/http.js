
import axios from 'axios';
import _ from 'lodash';
import {  Modal } from 'antd';
import {User} from "@src/util/user";
import tools from './tools';
export const timeout = '1000000'; // 接口超时限制(ms)
const { CancelToken } = axios;
let baseConfig = {
  // `url` is the server URL that will be used for the request
  url: '/',

  // `method` is the request method to be used when making the request
  method: 'post', // default

  // `baseURL` will be prepended to `url` unless `url` is absolute. It can be
  // convenient to set `baseURL` for an instance of axios to pass relative URLs to
  // methods of that instance.
  // baseURL: '',

  // `transformRequest` allows changes to the request data before it is sent to
  // the server This is only applicable for request methods 'PUT', 'POST', and
  // 'PATCH' The last function in the array must return a string or an instance of
  // Buffer, ArrayBuffer, FormData or Stream
  // transformRequest: [
  //   function transformRequest (data) {
  //     // Do whatever you want to transform the data
  //     return data;
  //   },
  // ],

  // `transformResponse` allows changes to the response data to be made before it
  // is passed to then/catch
  // transformResponse: [
  //   function transformResponse(data) {
  //     // Do whatever you want to transform the data
  //     return data;
  //   },
  // ],

  // `headers` are custom headers to be sent
  headers: {
    // 'Content-Type': 'text/plain',
    // 'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
    // 'Content-Type': 'application/x-www-form-urlencoded',
    // 'Authorization': sessionStorage.getItem('token') // headers塞token
  },

  // `params` are the URL parameters to be sent with the request Must be a plain
  // object or a URLSearchParams object
  params: {
    // ID: 12345,
  },

  // `paramsSerializer` is an optional function in charge of serializing `params`
  // (e.g. https://www.npmjs.com/package/qs, http://api.jquery.com/jquery.param/)
  // paramsSerializer(params) {   return Qs.stringify(params, { arrayFormat:
  // 'brackets' }); }, `data` is the data to be sent as the request body Only
  // applicable for request methods 'PUT', 'POST', and 'PATCH' When no
  // `transformRequest` is set, must be of one of the following types:
  // - string, plain object, ArrayBuffer, ArrayBufferView, URLSearchParams
  // - Browser only: FormData, File, Blob
  // - Node only: Stream, Buffer
  data: {
    // firstName: 'Fred',
  },

  // `timeout` specifies the number of milliseconds before the request times out.
  // If the request takes longer than `timeout`, the request will be aborted.
  timeout: '',

  // `withCredentials` indicates whether or not cross-site Access-Control requests
  // should be made using credentials
  // withCredentials: true, // default

  // `adapter` allows custom handling of requests which makes testing easier.
  // Return a promise and supply a valid response (see lib/adapters/README.md).
  // adapter(config) {   /* ... */ }, `auth` indicates that HTTP Basic auth should
  // be used, and supplies credentials. This will set an `Authorization` header,
  // overwriting any existing `Authorization` custom headers you have set using
  // `headers`. auth: {   username: 'janedoe',   password: 's00pers3cret', },
  // `responseType` indicates the type of data that the server will respond with
  // options are 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'
  responseType: 'json', // default

  // // `xsrfCookieName` is the name of the cookie to use as a value for xsrf
  // token xsrfCookieName: 'XSRF-TOKEN', // default // `xsrfHeaderName` is the
  // name of the http header that carries the xsrf token value xsrfHeaderName:
  // 'X-XSRF-TOKEN', // default // `onUploadProgress` allows handling of progress
  // events for uploads onUploadProgress(progressEvent) {   // Do whatever you
  // want with the native progress event }, // `onDownloadProgress` allows
  // handling of progress events for downloads onDownloadProgress(progressEvent) {
  //   // Do whatever you want with the native progress event },
  // `maxContentLength` defines the max size of the http response content allowed
  maxContentLength: 500000,

  // `validateStatus` defines whether to resolve or reject the promise for a given
  // HTTP response status code. If `validateStatus` returns `true` (or is set to
  // `null` or `undefined`), the promise will be resolved; otherwise, the promise
  // will be rejected.
  validateStatus (status) {
    return status >= 200 && status < 300; // default
  },
};

baseConfig = { ...baseConfig, timeout: timeout };

const http = axios.create(baseConfig);
http.interceptors.request.use(
  (config) => {
    const token = User.getToken();
    if (token) {
      // 让每个请求携带token-- 请根据实际情况自行修改
      config.headers['Authorization'] = 'token ' + token;
      // config.headers['Cookie'] = 'autoToken=' + token;
    } else {
      location.href = LOGINURL;
    }
    config.headers['Content-Type'] = 'application/json';
    let url = config.url;
    // get参数处理
    // 1.清除值为get 请求中 参数值为 undefined 和null 的参数
    // 2. 字符串类型参数，去掉首尾空格
    // 3. 参数转码，解决请求中含有& ? [ ]等这几个功能性字符
    if (config.method === 'get') {
      let params = tools.clearNull(config.params);
      let keys = Object.keys(params);
      if (keys.length > 0) {
        const rex = /\?/;
        if (!rex.test(url)) {
          url += '?';
        } else {
          url += '&';
        }
        for (let key of keys) {
          let value = config.params[key];
          if (_.isString(value)) {
            value = value.trim();
            value = encodeURIComponent(value);
          }
          url += `${key}=${value}&`;
        }
        url = url.substring(0, url.length - 1);
        config.params = {};
      }
    }
    config.url = url;
    return config;
  },
);
http.interceptors.response.use(
  (response) => {
    if (200 <= response.status < 300) {
      response.status == 200;
      return Promise.resolve(response);
    }
    return response;
  }, (error) => {
    // 认证信息无效
    if (error.response.status == 401) {
      sessionStorage.clear();
      localStorage.clear();
      User.setToken(null);
      location.href = LOGINURL;
    }
    // 权限不足
    if (error.response.status == 403) {
      Modal.error({
        title: '你没有访问权限'
      });
    }
    // 接口报404
    if (error.response.status == 404) {
      Modal.error({
        title: '你访问的接口不存在'
      });
    }
    // 接口报500
    if (error.response.status == 500) {
      Modal.error({
        title: '接口报错，状态码为500'
      });
    }
    // 接口报503
    if (error.response.status == 503) {
      Modal.error({
        title: '接口报错，状态码为503'
      });
    }
    return Promise.reject(error);
  });

export default http;


