import React from 'react';
import P from 'prop-types';
import _ from 'lodash';
import http from '@src/util/http';
import tools from '@src/util/tools'; // 工具
import { Tabs, Radio, Breadcrumb } from 'antd';
import { inject, observer} from 'mobx-react';
const { TabPane } = Tabs;
import SetRoom from '@src/pages/Products/container/SetRoom';
import List from './List';
import "../index.less";
@inject("areaResouse")
class RaidPrice extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    areaResouse: P.any,
  };
  constructor (props) {
    super(props);
    if (this.props.areaResouse.houseList.length <= 0) {
      this.props.areaResouse.fetchHouse();
    }
    this.state = {
      mode: 'top',
      activeKey: sessionStorage.getItem("roomkey"),
      raidcache: [], // 型号下拉列表
    };
  }
  componentDidMount () {
    this.fetchraidcache();
    if (this.props.areaResouse.houseList.length <= 0) {
      this.props.areaResouse.fetchHouse();
    }
  }


  // 获取所有cpu型号
  fetchraidcache () {
    this.setState({
      loading: true,
    });

    http.get(`${BSS_ADMIN_URL}/api/product/raidmodel/raidcache`)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          this.setState({
            raidcache: res.data,
          });
        } else {
          tools.dealFail(res);
        }
      })
      .catch(() => {
      });
  }

  handleModeChange = (e) => {
    const mode = e.target.value;
    this.setState({ mode });
  };

  callback = (key) => {
    sessionStorage.setItem('roomkey', key);
    this.setState({activeKey: key + ''});
  }

  setActiveKey = (key) => {
    this.setState({activeKey: key + ''});
  }

  render () {
    const { mode, activeKey, raidcache } = this.state;
    const { houseList } = this.props.areaResouse;
    const activeKey1 = activeKey || houseList[0] && houseList[0].id && (houseList[0].id + '');
    return (
      <div className="mian">
        <div className="bread">
          <Breadcrumb>
            <Breadcrumb.Item>产品管理</Breadcrumb.Item>
            <Breadcrumb.Item>价格管理</Breadcrumb.Item>
            <Breadcrumb.Item>RAID卡</Breadcrumb.Item>
          </Breadcrumb>
          <SetRoom houseList={houseList} setActiveKey={this.setActiveKey} init_activeKey={activeKey1}></SetRoom>
        </div>
        <Tabs defaultActiveKey={activeKey1} tabPosition={mode} onChange={this.setActiveKey} activeKey={activeKey1}>
          {_.map(houseList, (house) => (
            <TabPane tab={house.fullName} key={house.id}>
              <List houseId={house.id} activeKey={activeKey1}  raidcache={raidcache}></List>
            </TabPane>
          ))}
        </Tabs>
      </div>
    );
  }
}

export default RaidPrice;
