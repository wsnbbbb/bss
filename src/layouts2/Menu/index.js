/** 左侧导航 **/
import React from 'react';
import P from 'prop-types';
import classnames from 'classnames';
import { Menu} from 'antd';
import { MenuUnfoldOutlined} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import { withRouter } from 'react-router';
import menuConfig from '@src/config/menu';
import './index.less';
import tools from '@src/util/tools';
const { SubMenu, Item } = Menu;
@withRouter
export default class Com extends React.PureComponent {
  static propTypes = {
    data: P.array, // 所有的菜单数据
    collapsed: P.bool, // 菜单展开开还是收起
    location: P.any
  };
  constructor (props) {
    super(props);
    this.state = {
      show: false, // 右侧是否显示
      sourceData: [], // 菜单数据（层级）
      treeDom: [], // 生成的菜单结构
      chosedKey: [], // 当前选中
      openKeys: [] // 当前需要被展开的项
    };
  }

  componentDidMount () {
    this.nowChosed(this.props.location);
  }

  componentWillReceiveProps (nextP) {
    if (this.props.location !== nextP.location) {
      this.nowChosed(nextP.location);
    }
  }

  /** 处理当前选中 **/
  nowChosed (location) {
    const splitPath = _.split(location.pathname, '/').slice(1);
    let selectedKeys = [];
    let _selectedKeys = '';
    _.map(splitPath, (item, index) => {
      _selectedKeys = _selectedKeys + '/' + item;
      selectedKeys.push(_selectedKeys);
    });
    // const paths = location.pathname.split('/').filter((item) => !!item);
    this.setState({
      chosedKey: [location.pathname],
      openKeys: selectedKeys
    });
  }

  /** 构建菜单树结构 **/
  makeTreeDom (data) {
    return data.map((item) => {
      // 没有权限不生成菜单
      if (!tools.permission(item.Authority)) {
        return null;
      }
      if (item.subRoute) {
        return (
          <SubMenu
            key={item.path}
            title={
              item.icon ? (
                <span>
                  <span>{item.name}</span>
                </span>
              ) : (
                item.name
              )
            }
          >
            {this.makeTreeDom(item.subRoute)}
          </SubMenu>
        );
      } else {
        return (
          <Item key={item.path}>
            <Link to={{
              pathname: item.path,
              state: {
                name: item.name
              },
              search: undefined
            }}>
              <span>{item.name}</span>
            </Link>
          </Item>
        );
      }
    });
  }

  // 将同级的其他项不展开
  onOpenChange = (e) => {
    let filterKeys = []; // 存放需要展开的keys
    let openkeysLen = e.length;
    let lastopenKey = e[openkeysLen - 1];
    let current_level_str = lastopenKey.slice(0, lastopenKey.lastIndexOf('/') + 1);
    filterKeys.push(lastopenKey);
    _.map(e, (item) => {
      if (current_level_str != item.slice(0, lastopenKey.lastIndexOf('/') + 1)) {
        filterKeys.push(item);
      }
    });
    this.setState({
      openKeys: filterKeys
    });
  }

  // 控制菜单显隐
  changeShow = () => {
    this.setState({
      show: !this.state.show
    });
  }

  render () {
    return (
      <div className="navs-wap">
        {/* 全部导航 */}
        <div className={classnames({"all-menus": true, "active": this.state.show})}>
          <MenuUnfoldOutlined className="icon" onClick={this.changeShow}/>
          <div className="children">
            <Menu
              theme="light"
              mode="inline"
              selectedKeys={this.state.chosedKey}
              openKeys={this.state.openKeys}
              onOpenChange={(e) => this.onOpenChange(e)}>
              {this.makeTreeDom(menuConfig)}
            </Menu>
          </div>
        </div>
      </div>
    );
  }
}
