/* eslint-disable react/prop-types */
/** User 系统管理/用户管理 **/

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import {
  Form,
  Button,
  Input,
  Table,
  Modal,
  Popconfirm,
  Tooltip,
  Divider,
  Select,
} from 'antd';
import { EyeOutlined, PlusSquareOutlined, FormOutlined, DeleteOutlined, ExclamationCircleOutlined} from '@ant-design/icons';
import { inject, observer} from 'mobx-react';
import http from '@src/util/http';
import tools from '@src/util/tools'; // 工具
// import Watermark from '@src/components/Watermark';
import Add from './container/Add';
import { useDrag, useDrop } from 'react-dnd';
import {User} from "@src/util/user";
const type = 'DragbleBodyRow';
const DragableBodyRow = ({ index, moveRow, className, style, record, ...restProps }) => {
  const ref = React.useRef();
  let begainItem = {};
  const [{ isOver, dropClassName }, drop] = useDrop({
    accept: type,
    collect: (monitor) => {
      const { index: dragIndex} = monitor.getItem() || {};
      if (dragIndex === index) {
        return {};
      }
      return {
        begainItem: monitor.getItem(),
        isOver: monitor.isOver(),
        dropClassName: dragIndex < index ? ' drop-over-downward' : ' drop-over-upward',
      };
    },
    drop: (item) => {
      moveRow(item.index, index, item);
    },
  });
  const [, drag] = useDrag({
    item: { type, index, record},
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    beginDrag: (props, monitor, component) => {
      const record = props.record;
      return {record};
    },
  });
  drop(drag(ref));
  return (
    <tr
      ref={ref}
      className={`${className}${isOver ? dropClassName : ''}`}
      style={{ cursor: 'move', ...style }}
      {...restProps}
    />
  );
};
// ==================
// Definition
// ==================
const { Option } = Select;
// @Watermark()
@inject('roomManage')
@inject('areaResouse')
@observer
export default class RoleAdminContainer extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    userinfo: P.any,
    powers: P.array,
  };

  searchFormRef = React.createRef();
  constructor (props) {
    super(props);
    this.searchCondition = {}; // 搜索条件
    this.state = {
      lists: [], // 当前表格全部数据有层级关系 用于排序操作
      originList: [], // 列表源数据无层级关系
      originTreeList: [], // 列表源数据有层级关系
      loading: false, // 表格数据是否正在加载中
      page: 1, // 当前第几页
      pageSize: 20, // 每页多少条
      total: 0, // 数据库总共多少条数据
      operateType: 'add', // 操作类型 add新增，up修改, see查看
      modalShow: false,   // 增 修 查 状态模的显示
      modalLoading: false, // 添加/修改/查看 是否正在请求中
      nowData: {}, // 当前选中用户的信息，用于查看详情、修改、分配菜单
    };
  }
  componentDidMount () {
    if (this.props.areaResouse.areaTreeList.length <= 0) {
      this.props.areaResouse.fetchArea();
    }
    this.onGetListData();
  }
  // 查询当前页面所需列表数据
  onGetListData (values) {
    const params = _.assign({}, values, this.searchCondition);
    this.setState({ loading: true });
    http.get(`${BSS_ADMIN_URL}/api/product/area`, {params: tools.clearNull(params)})
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          let hasSearch = this.searchCondition && this.searchCondition.name;
          if (hasSearch) {
            // 带查询条件，不处理层级关系
            this.setState({
              lists: res.data,
            });
          } else {
            let lists = tools.makeSourceData(res.data);
            this.setState({
              lists: lists,
              originList: res.data,
              originTreeList: lists,
            });
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
  onResetSearch = () => {
    this.searchFormRef.current.resetFields();
  };

  /**
   * 添加/修改/查看 模态框出现
   * @item: 当前选中的那条数据
   * @type: add添加/addchild添加下级/up修改/see查看
   * **/
  onModalShow (type, data) {
    let defaultArea = {
      parId: "0",
      code: "",
      name: "",
      remark: "",
    };
    if (type == 'up' || type == 'see') {
      defaultArea = data;
    }
    if (type == 'addchild') {
      defaultArea = {
        ...defaultArea,
        parId: data.id,
      };
    }
    this.setState({
      modalShow: true,
      nowData: defaultArea,
      operateType: type
    });
  }

  /**
   * 执行 增 修 操作
   * @param {obj} obj
   */
  onModalOk (obj) {
    this.setState({
      modalLoading: true,
    });
    if (this.state.operateType == 'add' || this.state.operateType == 'addchild') {
      let param = tools.clearNull(obj);
      this.props.areaResouse.fetchArea();
      http.post(`${BSS_ADMIN_URL}/api/product/area/add`, param)
        .then((res) => {
          res = res.data;
          if (tools.hasStatusOk(res)) {
            this.setState({
              modalLoading: false,
              modalShow: false,
            });
            tools.auto_close_result('ok', '操作成功');
            this.onGetListData();
            this.props.areaResouse.fetchArea(); // 更新stores 中的地区信息
          } else {
            tools.dealFail(res);
          }
          this.setState({ modalLoading: false });
        })
        .catch(() => {
          this.setState({ modalLoading: false });
        });
    } else {
      http.put(`${BSS_ADMIN_URL}/api/product/area/${this.state.nowData.id}/update`, tools.clearNull(obj))
        .then((res) => {
          res = res.data;
          if (tools.hasStatusOk(res)) {
            this.setState({
              modalLoading: false,
              modalShow: false,
            });
            this.onGetListData();
            this.props.areaResouse.fetchArea(); // 更新stores 中的地区信息
            tools.auto_close_result('ok', '操作成功');
          } else {
            tools.dealFail(res);
          }
          this.setState({ modalLoading: false });
        })
        .catch(() => {
          this.setState({ modalLoading: false });
        });
    }


  }

  // 关闭增 修 弹窗
  onModalClose () {
    this.setState({
      modalShow: false,
    });
  }

  // 删除某一条数据
  onDel (id) {
    Modal.confirm({
      icon: <ExclamationCircleOutlined />,
      content: `确认执行删除操作吗？`,
      onOk: () => {
        this.setState({ loading: true });
        http.delete(`${BSS_ADMIN_URL}/api/product/area/${id}/delete`)
          .then((res) => {
            res = res.data;
            if (tools.hasStatusOk(res)) {
              tools.auto_close_result('ok', '操作成功');
              this.onGetListData();
              this.props.areaResouse.fetchArea(); // 更新stores 中的地区信息
            } else {
              tools.dealFail(res);
              this.setState({ loading: false });
            }
          })
          .catch(() => {
            this.setState({ loading: false });
          });
      },
      onCancel () {
        console.log('Cancel');
      },
    });
  }

  // 构建字段
  makeColumns () {
    const columns = [
      {
        title: '区域名称',
        dataIndex: 'name',
        key: 'name'
      },
      {
        title: '区域编码',
        dataIndex: 'code',
        key: 'code'
      },
      {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark'
      },
      {
        title: '操作',
        key: 'control',
        fixed: 'right',
        width: 180,
        render: (text, record) => {
          const controls = [];
          User.hasPermission('area-view') &&
          controls.push(
            <span
              key="0"
              className="control-btn green"
              onClick={() => this.onModalShow('see', record)}
            >
              <Tooltip placement="top" title="查看">
                <EyeOutlined></EyeOutlined>
              </Tooltip>
            </span>
          );
          User.hasPermission('area-edit') &&
          controls.push(
            <span
              key="1"
              className="control-btn blue"
              onClick={() => this.onModalShow('up', record)}
            >
              <Tooltip placement="top" title="修改">
                <FormOutlined></FormOutlined>
              </Tooltip>
            </span>
          );
          User.hasPermission('area-add') &&
          controls.push(
            <span
              key="2"
              className="control-btn blue"
              onClick={() => this.onModalShow('addchild', record)}
            >
              <Tooltip placement="top" title="添加下级区域">
                <PlusSquareOutlined />
              </Tooltip>
            </span>
          );
          User.hasPermission('area-del') &&
            controls.push(
              <Popconfirm
                key="3"
                title="确定删除吗?"
                onConfirm={() => this.onDel(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <span className="control-btn red">
                  <Tooltip placement="top" title="删除">
                    <DeleteOutlined></DeleteOutlined>
                  </Tooltip>
                </span>
              </Popconfirm>
            );

          const result = [];
          controls.forEach((item, index) => {
            if (index) {
              result.push(<Divider key={`line${index}`} type="vertical" />);
            }
            result.push(item);
          });
          return result;
        }
      }
    ];
    return columns;
  }

  // 自定义行元素
  components = {
    body: {
      row: DragableBodyRow,
    },
  };

    /**
     * 执行移动行事件
     * @param {number} dragIndex 拖动开始位置下标
     * @param {number} hoverIndex 拖动存放位置下标
     * @param {obj} dragRecord 拖动的行数据
     * @param {obj} hoverRecord 存放位置对应的下一个行数据
     * @param {index} index 被存放位置index
     */
    moveRow = (dragIndex, hoverIndex, dragRecord, hoverRecord, index) => {
      // 展示顺序未发生更改不做处理
      if (dragIndex == hoverIndex) {
        return false;
      }
      const { originList } = this.state;
      const nowLevelParId = dragRecord.record.parId;
      // 获取拖动那一级的数据
      let nowLevel = [];
      _.map(originList, (item) => {
        if (item.parId == nowLevelParId) {
          nowLevel.push(item);
        }
      });
      // 拖动位置前面的数据
      let params = [];
      // // 如果是向上移动 中间的列都在原来sort基础上+1
      if (dragIndex > hoverIndex) {
        let lists = nowLevel.slice(hoverIndex, dragIndex);
        lists.forEach((item) => {
          params.push({
            id: item.id,
            sort: item.sort + 1
          });
        });
        params.unshift({id: dragRecord.record.id, sort: dragRecord.record.sort - lists.length});
      }
      // // 如果是向下移动 中间的行都在原来sort基础上-1
      if (hoverIndex > dragIndex) {
        let lists = nowLevel.slice(dragIndex + 1, hoverIndex + 1);
        lists.forEach((item) => {
          params.push({
            id: item.id,
            sort: item.sort - 1
          });
        });
        params.push({id: dragRecord.record.id, sort: dragRecord.record.sort + lists.length});
      }
      http.post(`${BSS_ADMIN_URL}/api/product/area/sort`, params)
        .then((res) => {
          res = res.data;
          if (tools.hasStatusOk(res)) {
            this.setState({
              modalLoading: false,
              modalShow: false,
            });
            this.onGetListData();
          } else {
            tools.dealFail(res);
          }
          this.setState({ modalLoading: false });
        })
        .catch(() => {
          this.setState({ modalLoading: false });
        });
    };
    render () {
      const {lists,  loading} =  this.state;
      return (
        <main className="mian">
          {/* 搜索 */}
          <div className="g-search">
            <Form ref={this.searchFormRef} name="searchbox" layout="inline" onFinish={(values) => {this.onSearch(values);}}>
              <Form.Item name="name">
                <Input placeholder="区域名称" allowClear/>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" >搜索</Button>
              </Form.Item>
              <Form.Item>
                <Button type="primary" onClick={this.onResetSearch} >重置</Button>
              </Form.Item>
            </Form>
          </div>
          {/* 操作 */}
          <div className="g-operate">
            {User.hasPermission('area-add') && <Button size="middle" className="actions-btn" onClick={() => {this.onModalShow('add');}}>添加地区</Button>}
          </div>
          {/* 数据展示 */}
          <div className="g-table">
            <Table
              columns={this.makeColumns()}
              rowKey={(record) => record.id}
              loading={loading}
              dataSource={lists}
              pagination={false}
              components={User.hasPermission('area-option') ? this.components : {}}
              onRow={(record, index) => ({
                record,
                index,
                moveRow: (dragIndex, hoverIndex, item) => {this.moveRow(dragIndex, hoverIndex, item, record, index);},
              })}
              expandable={{
                indentSize: 0,
                expandRowByClick: true,
              }}
            />
          </div>
          {/* 新增&修改&查看 模态框 */}
          <Add
            visible={this.state.modalShow}
            modalLoading={this.state.modalLoading}
            data={this.state.nowData}
            operateType={this.state.operateType}
            onOk={(v) => this.onModalOk(v)}
            onClose={() => this.onModalClose()}
          />
        </main>
      );
    }
}

