/** 左侧导航 **/
import React from 'react';
import P from 'prop-types';
import classnames from 'classnames';
import { Layout, Menu, Button, Divider} from 'antd';
import { MenuUnfoldOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import { withRouter } from 'react-router';
import menuConfig from '@src/config/menu';
import './index.less';
import tools from '@src/util/tools';
const { Sider } = Layout;
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
    const paths = location.pathname.split('/').filter((item) => !!item);
    this.setState({
      chosedKey: [location.pathname],
      openKeys: paths.map((item) => `/${item}`)
    });
  }

  /** 构建树结构 **/
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

  onOpenChange = (e) => {
    this.setState({
      openKeys: e
    });
  }

  changeShow = () => {
    this.setState({
      show: !this.state.show
    });
  }

  render () {
    const {location} = this.props;
    const splitPath = _.split(location.pathname, '/').slice(1);
    let selectedKeys = [];
    let _selectedKeys = '';
    _.map(splitPath, (item, index) => {
      _selectedKeys = _selectedKeys + '/' + item;
      selectedKeys.push(_selectedKeys);
    });
    return (
      <div className="navs-wap">
        {/* 全部导航 */}
        <div className={classnames({"all-menus": true, "active": this.state.show})}>
          <MenuUnfoldOutlined className="icon" onClick={this.changeShow}/>
          <div className="children">
            <Menu
              theme="light"
              mode="inline"
              selectedKeys={selectedKeys}
              // openKeys={selectedKeys}
              onOpenChange={(e) => this.onOpenChange(e)}>
              {this.makeTreeDom(menuConfig)}
            </Menu>
          </div>
        </div>
      </div>
    );
  }
}
