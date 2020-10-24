import React from 'react';
import P from 'prop-types';
import _ from 'lodash';
import { Tabs, Radio, Breadcrumb } from 'antd';
import { inject, observer} from 'mobx-react';
import SetRoom from '@src/pages/Products/Container/SetRoom';
import List from './List';
import http from '@src/util/http';
import tools from '@src/util/tools'; // 工具
// import "./index.less";
const { TabPane } = Tabs;
@inject("areaResouse")
export default class Iprice extends React.Component {
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
      lists2: [],
    };
  }
  componentDidMount () {
    if (this.props.areaResouse.houseList.length <= 0) {
      this.props.areaResouse.fetchHouse();
    }
    this.onGetListData2();
  }
  onGetListData2 (param = {}) {
    this.setState({loading: true});
    http
      .get(`${BSS_ADMIN_URL}/api/goods/category`)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          let lists = res.data;
          let lists2 = [];
          lists2 = tools.formatTree(lists);
          this.setState({
            lists2: lists2,
          });
        } else {
          tools.dealFail(res);
        }
        this.setState({ loading: false });
      })
      .catch(() => {
        this.setState({ loading: false });
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
    const { mode, activeKey } = this.state;
    const { houseList } = this.props.areaResouse;
    const activeKey1 = activeKey || houseList[0] && houseList[0].id && (houseList[0].id + '');
    return (
      <React.Fragment>
        <div className="mian">
          <div className="bread">
            <Breadcrumb>
              <Breadcrumb.Item>产品管理</Breadcrumb.Item>
              <Breadcrumb.Item>价格管理</Breadcrumb.Item>
              <Breadcrumb.Item>带宽</Breadcrumb.Item>
            </Breadcrumb>
            <SetRoom houseList={houseList} setActiveKey={this.setActiveKey} init_activeKey={activeKey1}></SetRoom>
          </div>
          {/* <Radio.Group onChange={this.handleModeChange} value={mode} style={{ marginBottom: 8 }}>
            <Radio.Button value="top">Horizontal</Radio.Button>
            <Radio.Button value="left">Vertical</Radio.Button>
          </Radio.Group> */}
          <Tabs defaultActiveKey={activeKey1} tabPosition={mode} onChange={this.setActiveKey} activeKey={activeKey1}>
            {_.map(houseList, (house) => (
              <TabPane tab={house.fullName} key={house.id}>
                <List houseId={house.id} lists2={this.state.lists2}></List>
              </TabPane>
            ))}
          </Tabs>
        </div>
      </React.Fragment>

    );
  }
}
