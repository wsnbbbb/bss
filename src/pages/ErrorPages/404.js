/* 404 NotFound */

import React from 'react';
import { Button } from 'antd';
import P from 'prop-types';
import './index.less';
import Img from '@src/assets/imgs/404.jpg';

export default class NotFoundContainer extends React.Component {
  static propTypes = {
    history: P.any
  };

  constructor (props) {
    super(props);
    this.state = {
      show: false
    };
  }

  componentDidMount () {
    setTimeout(() =>
      this.setState({
        show: true
      })
    );
  }

  onGoBackHome = () => {
    // window.href = "/home";
  };

  render () {
    return (
      <div className="page-error">
        <div>
          {/* <div className="title">404</div> */}
          <img src={Img + `?${new Date().getTime()}`} />
          <div>
            <Button
              className="backBtn"
              type="primary"
              ghost
              onClick={this.onGoBackHome}
            >
            返回首页
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
