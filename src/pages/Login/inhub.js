/* eslint-disable react/prop-types */
import React from 'react';
import { withRouter } from "react-router";
import {auto_close_result, confirm_result, hasResults, hasStatueOk, User} from "@configs/util";
import { Spin } from "antd";
@withRouter
class InHub extends React.Component {
  constructor (props) {
    super(props);
    let isLogged = (User.getToken() && User.getPermission());
    if (isLogged) {
      this.props.history.push('/home');
    }
    this.state = {
      codeOk: false,
    };
  }
  componentDidMount () {
    const _this = this;
    // 获取code
    dd.ready(function () {
      dd.runtime.permission.requestAuthCode({
        corpId: "dingf75c2b3bc5192fe235c2f4657eb6378f", // 企业id
        onSuccess: function (info) {
          // 通过该免登授权码可以获取用户身份
          const code = info.code;
          _this.auth(code);
        }});
    });

  }

  auth= (code) => {
    Axios.post(SOM_URL + '/mockapi/usermanage/dingtalk/auth-inner/login/', {"code": code})
      .then((res) => {
        if (res.status == 200) {
          // console.log(res.data);
          User.setToken(res.data.token);
          User.setInfo(res.data.user);
          sessionStorage.setItem('token', res.data.token);
          sessionStorage.setItem('user', JSON.stringify(res.data.user));
          // 获取用户权限
          http({
            url: SOM_URL + '/mockapi/usermanage/rest-user/user/' + res.data.user.pk + '/',
            method: "get",
          })
            .then((res) => {
              sessionStorage.setItem('permission', JSON.stringify(res.data));
              localStorage.setItem('permission', JSON.stringify(res.data));
              this.setState({codeOk: true});
              this.props.history.push('/home');
            })
            .catch((error) => {
              confirm_result('error', "认证失败", error.response.data.message);
              this.setState({codeOk: false});
            });

        }
      })
      .catch((error) => {
        confirm_result('error', "认证失败", error.response.data.message);
        this.setState({codeOk: false});
      });
  }

  render () {
    return (
      <React.Fragment>
        <Spin size="large" tip="请耐心等待，正在验证中..." style={{width: "100%", height: '200px;', paddingTop: "30%"}}/>
        {
          this.state.codeOk ? this.props.history.push('/home') : null
        }
      </React.Fragment>
    );
  }
}
export default InHub;
