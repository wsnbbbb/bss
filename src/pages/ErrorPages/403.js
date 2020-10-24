/* 401 没有权限 */

import React from 'react';
import { Button } from 'antd';
import P from 'prop-types';
import './index.less';
import Img from '@src/assets/imgs/403.jpg';

export default class NoPowerContainer extends React.Component {
  static propTypes = {
    history: P.any,
    tipContent: P.string,
    errorCode: P.any,
  };

  constructor (props) {
    super(props);
  }

  componentDidMount () {
  }

  onGoBackHome = () => {
    location.href = BSS_SSO_URL;
  };

  render () {
    return (
      <div className="page-error">
        <div>
          <div className="title">{this.props.errorCode || '403'}</div>
          <div> <img src={Img + `?${new Date().getTime()}`} /></div>
          <div className="info">{this.props.tipContent || "你没有访问该页面权限，请联系管理员！"}</div>
          <Button
            className="backBtn"
            type="primary"
            onClick={this.onGoBackHome}
          >
            返回认证中心主页
          </Button>
        </div>
      </div>
    );
  }
}
