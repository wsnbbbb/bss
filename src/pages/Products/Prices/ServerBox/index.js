import React from 'react';
import P from 'prop-types';
import _ from 'lodash';
import { Tabs, Radio, Breadcrumb } from 'antd';
import { inject, observer} from 'mobx-react';
import SetRoom from '@src/pages/Products/container/SetRoom';
import List from './List';
import "../index.less";
const { TabPane } = Tabs;
@inject("areaResouse")
class RamPrice extends React.Component {
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
      activeKey: sessionStorage.getItem("roomkey")
    };
  }
  componentDidMount () {
    if (this.props.areaResouse.houseList.length <= 0) {
      this.props.areaResouse.fetchHouse();
    }
  }

  handleModeChange = (e) => {
    const mode = e.target.value;
    this.setState({ mode });
  };

  callback = (key) => {
    sessionStorage.setItem('roomkey', key);
    this.setState({activeKey: key});
  }

  setActiveKey = (key) => {
    this.setState({activeKey: key});
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
              <Breadcrumb.Item>机箱价格</Breadcrumb.Item>
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
                <List houseId={house.id}></List>
              </TabPane>
            ))}
          </Tabs>
        </div>
      </React.Fragment>

    );
  }
}

export default RamPrice;
