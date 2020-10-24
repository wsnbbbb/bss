/**
 * 服务器价格查询
 */

// ==================
// 所需的各种插件
// ==================

import React from "react";
import P from "prop-types";
import {
  Form,
  Button,
  Pagination,
  Table,
  Select,
  Row,
  Col
} from "antd";
import {
  EyeOutlined,
  FormOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { inject, observer } from "mobx-react";
import tools from "@src/util/tools"; // 工具
import qs from "qs";
import _ from "lodash";
import http from "@src/util/http";
// ==================
// 所需的所有组件
// ==================
import {User} from "@src/util/user";
import {formItemLayout2, formItemLayout, formItemLayout4} from '@src/config/commvar'; // 工具
import {SYS_DICT_SERVERPART, SYS_DICT_SERVER} from '@src/config/sysDict'; // 系统字典
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式

const { Option } = Select;
@inject("root")
@inject("serverPartDict")
@inject("authManage")
@inject("pageUserstore")
@inject("areaResouse")
@observer
export default class RoleAdminContainer extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    userinfo: P.any,
    powers: P.array,
    areaResouse: P.any,
    // form: P.any
  };

  constructor (props) {
    super(props);
    this.searchFormRef = React.createRef();
    (this.searchCondition = {}), // 顶部搜索条件
    (this.selectedRows = []); // 选中行的数据
    this.state = {
      lists: [], // 当前页面列表数据
      loading: false, // 表格数据是否正在加载中
      modalShow: false, // 添加/修改/查看 模态框是否显示
      modalLoading: false, // 添加/修改/查看 是否正在请求中
      nowData: {}, // 当前选中用户的信息，用于查看详情、修改、分配菜单
      pageNum: 1, // 当前第几页
      pageSize: 20, // 每页多少条
      total: 0, // 数据库总共多少条数据
      version: 0, // 列表初始版本号
      cpuConfigName: [],
      memConfigName: [],
      raidConfigName: [],
      diskConfigName: [],
      menExtend: [],
      diskExtend: [],
      networkNum: [],
    };
  }
  componentDidMount () {
    this.props.areaResouse.fetchHouse();
    this.fetchConfigName(1);
    this.fetchConfigName(2);
    this.fetchConfigName(3);
    this.fetchConfigName(4);
    this.fetchConfigName(5);
    this.fetchConfigName(6);
    this.fetchConfigName(7);
  }

  /**
   * 查询当前页面所需列表数据
   * @param {number} pageNum
   * @param {number} pageSize
   */
  onGetListData (param = {}) {
    let params = _.assign({}, this.searchCondition, param);
    this.setState({ loading: true });
    http.get(`${BSS_ADMIN_URL}/api/goods/serverprice`, {
      params: tools.clearEmpty(params),
    })
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          let lists = res.data.records;
          this.setState({
            lists: lists,
            total: res.data.total,
            pages: res.data.pages,
            pageNum: res.data.current,
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

  // '1:硬盘 2:raid 3:内存 4:CPU 5:内存扩展 6:硬盘插槽 7:网卡数'
  fetchConfigName = (type) => {
    this.setState({ loading: true });
    http.get(`${BSS_ADMIN_URL}/api/goods/cpuprice/${type}/configname`)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          switch (type) {
          case 1:
            this.setState({
              diskConfigName: res.data,
            });
            break;
          case 2:
            this.setState({
              raidConfigName: res.data,
            });
            break;
          case 3:
            this.setState({
              memConfigName: res.data,
            });
            break;
          case 4:
            this.setState({
              cpuConfigName: res.data,
            });
            break;
          case 5:
            this.setState({
              menExtend: res.data,
            });
            break;
          case 6:
            this.setState({
              diskExtend: res.data,
            });
            break;
          case 7:
            this.setState({
              networkNum: res.data,
            });
            break;
          }
        } else {
          tools.dealFail(res);
        }
        this.setState({ loading: false });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  }

  // 构建字段
  makeColumns () {
    const columns = [
      {
        title: "机房",
        dataIndex: "diskCode",
        key: "diskCode",
      },
      {
        title: "型号",
        dataIndex: "serverManagerIp",
        key: "serverManagerIp",
      },
      {
        title: "管理IP",
        dataIndex: "remark",
        key: "remark",
      },
      {
        title: "基础价",
        dataIndex: "remark",
        key: "remark",
      },
      {
        title: "状态",
        dataIndex: "remark",
        key: "remark",
      }
    ];
    return columns;
  }

  /**
   * 搜索
   * @param {obj} values 搜索条件
   */
  onSearch (values) {
    this.searchCondition = values;
    this.onGetListData(values);
  }

  /**
   * 重置搜索条件
   */
  onReset = () => {
    this.searchFormRef.current.resetFields();
  };

  // 表单页码改变
  onPageChange (page, pageSize) {
    this.onGetListData({ page: page, pageSize: pageSize });
  }

  // 表单页码长度改变
  onPageSizeChange (page, pageSize) {
    this.onGetListData({ page: page, pageSize: pageSize });
  }

  render () {
    const { loading, lists, pageNum, pageSize, total,
      cpuConfigName, memConfigName, raidConfigName, diskConfigName, menExtend, diskExtend, networkNum} = this.state;
    let house = this.props.areaResouse.houseList;
    return (
      <main className="mian">
        {/* 搜索 */}
        <div className="c-search">
          <Form
            ref={this.searchFormRef}
            name="horizontal_login"
            className="g-modal-field"
            onFinish={(values) => {
              this.onSearch(values);
            }}
          >
            <Row>
              <Col  xs={12} sm={12} md={10} lg={10} xl={7}>
                <Form.Item
                  name="SeUnittype"
                  label="类型"
                  {...formItemLayout4}
                  rules={[{required: true, message: '请选择'}]}>
                  <Select placeholder="选择类型"
                    style={{width: 240}}>
                    {
                      _.map(SYS_DICT_SERVER.se_unittype, (value, key) =>  <Select.Option value={parseInt(key)} key={key}>{value}</Select.Option>)
                    }
                  </Select>
                </Form.Item>
              </Col>
              <Col  xs={12} sm={12} md={10} lg={10} xl={7}>
                <Form.Item name="houseId" label="机房"
                  {...formItemLayout4}
                  rules={[{required: true, message: '请选择'}]}>
                  <Select
                    style={{ width: 240 }}
                    showSearch
                    filterOption={tools.filterOption}>
                    {house.map((item) => (
                      <Option value={item.id} key={item.id}>
                        {item.fullName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col  xs={12} sm={12} md={10} lg={10} xl={7}>
                <Form.Item name="cpuConfigName" label="CPU"
                  rules={[{required: true, message: '请选择'}]}
                  {...formItemLayout4}>
                  <Select
                    style={{ width: 240 }}
                    showSearch
                    filterOption={tools.filterOption}>
                    {cpuConfigName.map((item) => (
                      <Option value={item} key={item}>
                        {item}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

              </Col>
              <Col  xs={12} sm={12} md={10} lg={10} xl={7}>
                <Form.Item name="memConfigName" label="内存"
                  rules={[{required: true, message: '请选择'}]}
                  {...formItemLayout4}>
                  <Select
                    style={{ width: 240 }}
                    showSearch
                    filterOption={tools.filterOption}>
                    {memConfigName.map((item) => (
                      <Option value={item} key={item}>
                        {item}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

              </Col>
              <Col  xs={12} sm={12} md={10} lg={10} xl={7}>
                <Form.Item name="menExtend" label="内存扩展能力"
                  rules={[{required: true, message: '请选择'}]}
                  {...formItemLayout4}>
                  <Select
                    style={{ width: 240 }}
                    showSearch
                    filterOption={tools.filterOption}>
                    {menExtend.map((item) => (
                      <Option value={item} key={item}>
                        {item}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

              </Col>
              <Col  xs={12} sm={12} md={10} lg={10} xl={7}>
                <Form.Item name="networkNum" label="网卡数"
                  rules={[{required: true, message: '请选择'}]}
                  {...formItemLayout4}>
                  <Select
                    style={{ width: 240 }}
                    showSearch
                    filterOption={tools.filterOption}>
                    {networkNum.map((item) => (
                      <Option value={item} key={item}>
                        {item}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

              </Col>
            </Row>
            <Row>
              <Col  xs={12} sm={12} md={10} lg={10} xl={7}>
                <Form.Item name="diskConfigName" label="硬盘"
                  rules={[{required: true, message: '请选择'}]}
                  {...formItemLayout4}>
                  <Select
                    style={{ width: 240 }}
                    showSearch
                    filterOption={tools.filterOption}>
                    {diskConfigName.map((item) => (
                      <Option value={item} key={item}>
                        {item}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

              </Col>
              <Col xs={12} sm={12} md={10} lg={10} xl={7}>
                <Form.Item name="diskExtend" label="硬盘扩展能力"
                  rules={[{required: true, message: '请选择'}]}
                  {...formItemLayout4}>
                  <Select
                    style={{ width: 240 }}
                    showSearch
                    filterOption={tools.filterOption}>
                    {diskExtend.map((item) => (
                      <Option value={item} key={item}>
                        {item}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

              </Col>
              <Col  xs={12} sm={12} md={10} lg={10} xl={7}>
                <Form.Item name="raidConfigName" label="RAID"
                  rules={[{required: true, message: '请选择'}]}
                  {...formItemLayout4}>
                  <Select
                    style={{ width: 240 }}
                    showSearch
                    filterOption={tools.filterOption}>
                    {raidConfigName.map((item) => (
                      <Option value={item} key={item}>
                        {item}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <div style={{paddingLeft: 20}}>
              <Button type="primary" htmlType="submit" style={{marginLeft: 50}}>
                搜索
              </Button>
              <Button style={{marginLeft: 50}} type="primary" htmlType="reset" onClick={this.onReset}>
                重置
              </Button>
            </div>
          </Form>
        </div>
        {/* 数据展示  rowKey={(record) => {record.id;}}*/}
        <div className="g-table">
          <Table
            columns={this.makeColumns()}
            rowKey={(record) => record.id}
            loading={loading}
            dataSource={lists}
            pagination={false}
            size="small"
          />
        </div>
        <div className="pagination">
          <Pagination
            size="middle"
            className="g-pagination"
            current={pageNum}
            total={total}
            showSizeChanger
            showQuickJumper
            defaultPageSize={pageSize}
            showTotal={(total) => `一共${total}条数据`}
            onChange={(current, pageSize) => {
              this.onPageChange(current, pageSize);
            }}
            onShowSizeChange={(current, size) => {
              this.onPageSizeChange(current, size);
            }}
          />
        </div>
      </main>
    );
  }
}
