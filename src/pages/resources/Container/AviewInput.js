/**
 * 下拉选择 具体到区域，从视图接口获取数据，有localID
 */
import React from 'react';
import P from 'prop-types';
import { inject, observer} from 'mobx-react';
import _ from 'lodash';
import http from '@src/util/http';
import tools from '@src/util/tools';
import { orgTreeDefault, formItemLayout} from '@src/config/commvar'; // 全局变量
import { DownOutlined} from '@ant-design/icons';
import {
  Button,
  Table,
  message,
  Tree,
  Modal,
  Divider,
  Spin,
  Form,
  Input,
  Select
} from 'antd';
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { Option } = Select;
const { confirm } = Modal;
@inject('root')
@inject('areaResouse')
@observer
class Region extends React.Component {
  static propTypes = {
    areaResouse: P.any,
    onSearch: P.func,
    onClose: P.func,
    // data: P.any,
    defaultKey: P.string // 当前选中机构id
  }
  constructor (props) {
    super(props);
    this.selectNode = {}; // 选中的节点信息
    this.state = {
      selectNode: null, // 选中区域
      data: []
    };
  }
  componentDidMount () {
    if (this.props.areaResouse.vareaList.length <= 0) {
      this.props.areaResouse.fetchVarea();
    }
  }

  /**
   *
   * @param {区域节点id} key:string
   * @param e:{selected: bool, selectedNodes, node, event}
   */
  onSelect = (key, e) => {
    console.log(e);
    if (!key) {
      return false;
    }
    this.selectNode = {
      ...e.rowdata
    };
    this.props.onSearch(key, this.selectNode);
  }

  // 更新区域信息
  onUpdate = () => {
    this.props.areaResouse.fetchVarea();
  }
  render () {
    const data = this.props.areaResouse.vareaList;
    // const data = this.state.data;
    return (
      <React.Fragment>
        <Select onChange={this.onSelect}
          placeholder="请选择区域：地区-机房-区域"
          style={{width: 300}}
          allowClear
          showSearch
          defaultValue={this.props.defaultKey}
          filterOption={tools.filterOption}>
          {
            _.map(data, (item) => <Option value={item.fullLocationId} key={item.fullLocationId} rowdata={item}
              title={item.fullLocationName}> {item.fullLocationName} </Option>)
          }
        </Select>
        <Button onClick={this.onUpdate}>更新区域</Button>
      </React.Fragment>
    );
  }
}
export default Region;
