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
class WorkDefine extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
  };
  constructor (props) {
    super(props);
    this.state = {
        mode: 'top',
        treenode: [],
        key: '1'
    };
  }
  componentDidMount () {
    this.getOrgData();
  }
  getOrgData () {
    http
      .get(`${BSS_ADMIN_URL}/api/user/dept`)
      .then((res) => {
        if (res.data.code === 20000) {
          this.setState({ treenode: tools.formatTree(res.data.data) });
        }
        this.setState({
          loading: false,
        });
      })
      .catch((res) => {
        this.setState({
          loading: false,
        });
      });
  }
   
  setActiveKey = (key) => {
      this.setState({
          key: key
      })

  }
  render () {
    const { mode,treenode,key } = this.state;
    return (
      <React.Fragment>
        <div className="mian">
          <Tabs defaultActiveKey='1' tabPosition={mode} onChange={this.setActiveKey} >
          <TabPane tab="基础" key="1">
           <List categoryId={key} treenode={treenode}></List>
            </TabPane>
          <TabPane tab="计算" key="2">
          <List categoryId={key} treenode={treenode}></List>
            </TabPane>
          <TabPane tab="网络" key="3">
          <List categoryId={key} treenode={treenode}></List>
          </TabPane>
          </Tabs>
        </div>
      </React.Fragment>

    );
  }
}

export default WorkDefine;
