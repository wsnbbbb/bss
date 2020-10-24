/**
 * 下拉选择 具体到区域
 */
import React from 'react';
import P from 'prop-types';
import { inject, observer} from 'mobx-react';
import _ from 'lodash';
import tools from '@src/util/tools';
import {
  Button,
  Select
} from 'antd';
const { Option } = Select;
@inject('root')
@inject('areaResouse')
@observer
class Region extends React.Component {
  static propTypes = {
    areaResouse: P.any,
    onSearch: P.func,
    onClose: P.func,
    visible: P.bool,
    selectedIds: P.string // 当前选中机构id
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
    if (this.props.areaResouse.regionList.length <= 0) {
      this.props.areaResouse.fetchRegion();
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
      regionId: key,
      regionTitle: e.title,
      record: e.rowdata
    };
    this.props.onSearch(key, this.selectNode);
  }

  // 更新区域信息
  onUpdate = () => {
    this.props.areaResouse.fetchRegion();
  }
  render () {
    const data = this.props.areaResouse.regionList;
    return (
      <React.Fragment>
        <Select onChange={this.onSelect}
          placeholder="请选择区域：地区-机房-区域"
          style={{width: 300}}
          onSearch={this.onSearch}
          allowClear
          showSearch
          filterOption={tools.filterOption}
        >
          {
            _.map(data, (item) => <Option value={item.id} key={item.id} rowdata={item}
              title={item.locationCode}> {item.locationCode} </Option>)
          }
        </Select>
        <Button onClick={this.onUpdate}>更新区域</Button>
      </React.Fragment>
    );
  }
}
export default Region;
