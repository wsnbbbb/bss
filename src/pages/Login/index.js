/* eslint-disable react/no-did-mount-set-state */
/** 登录页 **/

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import tools from '@src/util/tools';
import Axios from 'axios';
import './index.less';
// ==================
// 所需的所有组件
// ==================
import Vcode from 'react-vcode';
import { Form, Input, Button,  Checkbox, Tabs, message } from 'antd';
import LogoImg from '@src/assets/imgs/logo-login.png';
const { TabPane } = Tabs;
import Account from './container/Account';
import Nothing from '@src/components/Nothing';
export default class LoginContainer extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
  };

  constructor (props) {
    super(props);
    this.ajaxCount = 0; // 记录获取appid次数
    // let isLogged = (User.getToken() && User.getPermission());
    let isLogged = false;
    if (isLogged) {
      this.props.history.push('/home');
    }
    this.state = {
      isLogging: true,
      loading_tip: '正在处理,请耐心等待',
      appid: undefined,
    };
  }

  componentDidMount () {
    // 获取appid
    // this.getAppid()
  }
  componentWillMount () {
    // if (window.addEventListener) {
    //   window.addEventListener('onmessage', function () {console.log('解除绑定')});
    // } else {
    //   window.attachEvent('onmessage', function () {console.log('解除绑定')});
    // }
  }
  // 获取二维码
  getcode = (appid) => {

    /*
      *生成二维码
      */
    let host = window.location.host
    let protocol = window.location.protocol
    let url = encodeURIComponent(protocol + '//' + host + '/hub');
    let goto = encodeURIComponent('https://oapi.dingtalk.com/connect/oauth2/sns_authorize?appid=' + appid + '&response_type=code&scope=snsapi_login&state=STATE&redirect_uri=' + url)

    if (this.ajaxCount == 1) {
      let obj = DDLogin({
        id: 'code-contain',
        goto: goto,
        style: 'border:none;',
        width: '365',
        height: '400'
      });
      document.getElementById('code-contain');
    }

    // 扫码事件监听
    if (typeof window.addEventListener != 'undefined') {
      window.addEventListener('message', (e) => {
        this.handleMessage(e, appid);
      }, false);
    } else if (typeof window.attachEvent != 'undefined') {
      window.attachEvent('onmessage', (e) => {
        this.handleMessage(e, appid);
      });
    }
    this.setState({
      appid: appid,
      isLogging: false,
    })
  }
  // 扫码登录回调
  handleMessage = (event, appid) => {
    let origin = event.origin;
    if (origin == 'https://login.dingtalk.com') {
      // 判断是否来自ddLogin扫码事件。
      let loginTmpCode = event.data;
      // 拿到loginTmpCode后就可以在这里构造跳转链接进行跳转了
      let url = 'https://oapi.dingtalk.com/connect/oauth2/sns_authorize?appid=' + appid + '&response_type=code&scope=snsapi_login&state=STATE&redirect_uri=&loginTmpCode=' + loginTmpCode;
      window.location.href = url
    }
  }
  // 获取appid
  getAppid = () => {
    this.ajaxCount += 1;
    this.setState({
      isLogging: true,
    })
    if (window.addEventListener) {
      window.addEventListener('onmessage', function () {console.log('解除绑定')});
    } else {
      window.attachEvent('onmessage', function () {console.log('解除绑定')});
    }
    Axios({
      url: BSS_ADMIN_URL + '/mockapi/usermanage/dingtalk/front/info/',
      method: 'post',
    })
      .then((res) => {
        if (res.status == 200) {
          let appid = res.data.appid;
          this.getcode(appid)

        } else {
        // 失败重传三次
          if (this.ajaxCount < 3) {
            this.getAppid()
          } else {
            confirm_result('error', '获取appid失败', error.response.data.message)
          }
        }
      })
      .catch((error) => {
      // 失败重传三次
        if (this.ajaxCount < 3) {
          this.getAppid()
        } else {
          confirm_result('error', '获取appid失败', error.response.data.message)
        }
      })
  }
  callback = (key) => {
    console.log(key);
  }

  render () {
    return (
      <div className="page-login">
        <div className="login-wap">
          {/* <div className="login-title">
            <img src={LogoImg}/>
          </div> */}
          <div className="login-box">
            <Tabs defaultActiveKey="1" onChange={this.callback}>
              <TabPane tab="钉钉扫码" key="1">
                <div id="code-contain">
                  <span>二维码</span>
                </div>
              </TabPane>
              <TabPane tab="账号登录" key="2">
                <Account></Account>
              </TabPane>
            </Tabs>
          </div>

        </div>
      </div>
    );
  }
}
