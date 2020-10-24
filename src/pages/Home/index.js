/* 主页 */

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import tools from '@src/util/tools';
import { inject, observer} from 'mobx-react';
import { Link } from 'react-router-dom';
import http from '@src/util/http';
import sec1 from "@src/assets/imgs/home/sec1.jpg";
import sec3 from "@src/assets/imgs/home/sec3.jpg";
import './index.less';
// ==================
// 所需的所有组件
// ==================
@inject('areaResouse')
export default class HomePageContainer extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    areaResouse: P.any,
  };
  constructor (props) {
    super(props);
  }
  componentDidMount () {
    // 随便掉的接口。测试token 是否过期
    this.props.areaResouse.fetchHouse();
    this.getPerssion();
  }
  // 获取权限
  getPerssion () {
    http.get(`${BSS_ADMIN_URL}/api/user/manage/permissions`)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          console.log(res);
        } else {
          console.log(res);
        }
      })
      .catch(() => {
        console.log('获取权限失败');
      });
  }

  render () {
    return (
      <div className="page-home all_nowarp">
        {/* <div className="shuju">
          <img src={sec1}/>
        </div> */}
        <div className="collect">
          <h2 className="sec-title">我的收藏</h2>
          <ul className="clearfix">
            <li className="item"><Link to="/resources/manage/house">机房管理</Link></li>
            <li className="item"><Link to="/resources/manage/cabinet">机柜管理</Link></li>
            <li className="item"><Link to="/resources/networkdevices/manage">网络设备管理</Link></li>
            <li className="item"><Link to="/resources/server/manage">服务器管理</Link></li>
            <li className="item"><Link to="/resources/server/outsidemachine">服务器外机管理</Link></li>
          </ul>
        </div>
        {/* <div className="right">
          <img src={sec3}/>
        </div> */}
      </div>
    );
  }
}
