/* eslint-disable react/prop-types */
import React from 'react';
import { withRouter } from 'react-router';
import P from 'prop-types';
import { inject } from 'mobx-react';
import { Spin } from 'antd';
import qs from 'qs';
import Axios from 'axios';
import { User } from '@src/util/user';
import tools from '@src/util/tools';
import ErrorPage from '@src/pages/ErrorPages/403';
@withRouter
@inject('root')
export default  class Hub extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
  };

  constructor (props) {
    super(props);
    this.state = {
      errorCode: 0, // 403无访问站点权限； 500 程序报错
    };
  }

  componentDidMount () {
    this.renzhen();
  }
  renzhen= () => {
    const host = window.location.origin;
    const code = qs.parse(location.href.split('?')[1]).code;
    const param = {
      'code': code,
      'redirect_uri': `${host}/hub`
    };
    Axios.post(`${BSS_ADMIN_URL}/api/user/login`, qs.stringify(param))
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          User.setToken(res.data.jti);
          User.setPermission(res.data.permissions);
          User.setInfo({
            email: res.data.email,
            jti: res.data.jti,
            loginName: res.data.loginName,
            mobile: res.data.mobile,
            name: res.data.name,
            loginTime: res.data.loginTime,
            userId: res.data.userId,
          });
          this.props.history.push('/home');
        } else {
          tools.dealFail(res);
        }
      })
      .catch((err) => {
        this.setState({
          errorCode: err.response.status || 500,
        });
      });
  }

  render () {
    return (
      <React.Fragment>
        {!this.state.errorCode && <Spin size="large" tip="正在跳转，请耐心等待"/>}
        {this.state.errorCode == 403 && <ErrorPage errorCode="403" tipContent="你没有访问该页面的权限"></ErrorPage>}
        {this.state.errorCode == 500 && <ErrorPage errorCode="500" tipContent="系统报错"></ErrorPage>}
      </React.Fragment>
    );
  }
}
