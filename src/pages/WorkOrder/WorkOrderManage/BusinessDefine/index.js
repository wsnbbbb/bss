import React from 'react';
import P from 'prop-types';
import _ from 'lodash';
import { Tabs, Radio, Breadcrumb } from 'antd';
import { inject, observer} from 'mobx-react';
import SetRoom from '@src/pages/Products/container/SetRoom';
import List from './List';
import tools from "@src/util/tools"; // 工具
import "./index.less";
import http from "@src/util/http";
const { TabPane } = Tabs;
@inject("areaResouse")
class BusinessDefine extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
  };
  constructor (props) {
    super(props);
    this.state = {
        mode: 'top',
        key: '1'
    };
  }
  componentDidMount () {
  }
  setActiveKey = (key) => {
      this.setState({
          key: key
      })
  }
  render () {
    const { mode,key } = this.state;
    return (
      <React.Fragment>
        <div className="mian">
          <Tabs defaultActiveKey='1' tabPosition={mode} onChange={this.setActiveKey} >
          <TabPane tab="基础" key="1">
           <List categoryId={key} ></List>
            </TabPane>
          <TabPane tab="计算" key="2">
          <List categoryId={key} ></List>
            </TabPane>
          <TabPane tab="网络" key="3">
          <List categoryId={key} ></List>
          </TabPane>
          </Tabs>
        </div>
      </React.Fragment>

    );
  }
}

export default BusinessDefine;
