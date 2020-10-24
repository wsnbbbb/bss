import React from 'react';
import P from 'prop-types';
import { Tabs, Select, Modal, message} from 'antd';
import { inject, observer} from 'mobx-react';
import { SearchOutlined }  from '@ant-design/icons';
import _ from 'lodash';
import tools from '@src/util/tools'; // 工具
import "./index.less";
@inject("areaResouse")
@observer
class SetRoom extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    areaResouse: P.any,
    init_activeKey: P.string, // 默认选中机房
    setActiveKey: P.func, // 设置选中机房
    houseList: P.any, // 机房列表
  };
  constructor (props) {
    super(props);
    this.activeKey = this.props.init_activeKey;
    this.state = {
      lists: [],
      modal_visible: false,
      expand: false, // 为true则展开
    };
  }
  componentDidMount () {
    sessionStorage.getItem("roomkey");
    if (this.props.areaResouse.houseList.length <= 0) {
      this.props.areaResouse.fetchHouse();
    }
  }


    selectValue = (value) => {
      sessionStorage.setItem("roomkey", value);
      this.props.setActiveKey(value);
    }

    render () {
      const expand_rooms = this.state.expand ? 'expand-rooms' : 'expand-rooms hide';
      const {houseList} = this.props.areaResouse;
      return (
        <div className="findHouse">
          {/* <span className="handle" title="快速选择机房" onClick={this.expand}><SearchOutlined /></span> */}
          <Select
            allowClear placeholder="快速选择机房"
            style={{width: 400}}
            showSearch
            showArrow={false}
            suffixIcon={<SearchOutlined />}
            onSelect={this.selectValue}
            filterOption={tools.filterOption}>
            {houseList.map((item) => (
              <Select.Option value={item.id} key={item.id}>
                {item.fullName}
              </Select.Option>
            ))}
          </Select>
        </div>
      );
    }
}

export default SetRoom;
