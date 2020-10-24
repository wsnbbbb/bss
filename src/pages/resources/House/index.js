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
  Popconfirm,
  Tooltip,
  Divider,
  Select,
  message,
} from 'antd';
import { EyeOutlined, PlusOutlined, FormOutlined, DeleteOutlined, UnlockOutlined, FileAddOutlined} from '@ant-design/icons';
import { inject, observer} from 'mobx-react';
import './index.less';
import http from '@src/util/http';
import tools from '@src/util/tools'; // 工具
import { SYS_DICT_HOUSE } from '@src/config/sysDict'; // 系统字典
// ==================
// 所需的所有组件
// ==================
import {User} from "@src/util/user";
import Add from './container/add';
import RegionAdd from './container/RegionAdd';
import { useDrag, useDrop } from 'react-dnd';
import copy from  'copy-to-clipboard';
import moment from 'moment'
function getamp (string) {
  if (!string) {
    return [undefined, undefined];
  }
  let index = string.search(/KVA|KW|A/i);
  let apm;
  let unit;
  if (index != -1) {
    apm = string.slice(0, index);
    unit = string.slice(index);
  }
  return [apm, unit];
}
const type = 'DragbleBodyRow1';
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

const { Option } = Select;
@inject('roomManage')
@inject('areaResouse')
@inject('cabinetDict')
@observer
export default class List extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
  };

  searchFormRef = React.createRef();

  constructor (props) {
    super(props);
    this.state = {
      searchParam: {}, // 搜索条件
      lists: [], // 当前表格全部数据有层级关系 用于排序操作
      areaList: [], // 区域信息
      houseList: [], // 只存储机房信息 用于区域显示对应机房使用
      loading: false, // 表格数据是否正在加载中
      page: 1, // 当前第几页
      pageSize: 20, // 每页多少条
      total: 0, // 数据库总共多少条数据
      operateType: 'add', // 操作类型 add新增，up修改, see查看
      modalShow: false,   // 机房增 修 查 状态模的显示
      modalLoading: false, // 添加/修改/查看 是否正在请求中
      nowData: {}, // 当前选中机房的信息，用于查看详情、修改
      nowDataRegion: {}, // 当前选中区域的信息，用于查看详情、修改
      operateTypeRegion: 'add', // 区域操作类型 add新增，up修改, see查看
      modalShowRegion: false,   // 区域增 修 查 状态模的显示
      modalLoadingRegion: false, // 区域添加/修改/查看 是否正在请求中
      expandedRowKeys: [], // 展开的行keys
    };
  }
  componentDidMount () {
    if (this.props.areaResouse.areaTreeList.length <= 0) {
      this.props.areaResouse.fetchArea();
    }
    if (this.props.areaResouse.houseList.length <= 0) {
      this.props.areaResouse.fetchHouse();
    }
    this.props.cabinetDict.fetchHouseLevel();
    this.onGetListData(this.state.page, this.state.pageSize);
  }

  // 查询当前页面所需列表数据
  onGetListData (values) {
    const params = _.assign({}, this.state.searchParam, values);
    this.setState({ loading: true });
    http.get(`${BSS_ADMIN_URL}/api/product/house`, {params: tools.clearNull(params)})
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          let lists = res.data;
          let houseList = [];
          _.map(lists, (item) => {
            houseList.push({
              id: item.id,
              name: item.name
            });
          });
          this.setState({
            lists: lists,
            houseList: houseList,
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
   * @type: add添加/up修改/see查看
   * **/
  onModalShow (type, data) {
    const defaultHouse = {
      districtId: "",
      houseLocakCode: "",
      code: "",
      name: "",
      alias: "",
      mj: "",
      num: "",
      addr: "",
      oldHouseCode: "",
      oldHouseName: "",
      attribute: null,
      remark: "",
      head: "",
      tel: "",
      localInfo: '',
      houseAddTime: '',
    };
    if (type === 'add') {
      this.setState({
        nowData: defaultHouse,
      });
    } else {
      let amp = getamp(data.cabinetAmp);
      let houseAddTime = null;
      data.houseAddTime?houseAddTime= moment(data.houseAddTime):houseAddTime=null;
      this.setState({
        nowData: {
          ...data,
          cabinetAmp: amp[0], // 电流
          voltageUnit: amp[1], // 电流单位
          houseAddTime: houseAddTime,
        },
      });
    }
    this.setState({
      modalShow: true,
      operateType: type
    });
  }

  /**
   * 机房列表执行 增 修 操作
   * @param {obj} obj
   */
  onModalOk (obj) {
    this.setState({
      modalLoading: true,
    });
    if (this.state.operateType == 'add') {
      let param = tools.clearNull(obj);
      http.post(`${BSS_ADMIN_URL}/api/product/house/add`, param)
        .then((res) => {
          res = res.data;
          if (tools.hasStatusOk(res)) {
            this.setState({
              page: 1,
              modalLoading: false,
              modalShow: false,
            });
            tools.auto_close_result('ok', '操作成功');
            this.onGetListData({page: 1});
            this.props.areaResouse.fetchHouse();
          } else {
            tools.dealFail(res);
          }
          this.setState({ modalLoading: false });
        })
        .catch(() => {
          this.setState({ modalLoading: false });
        });
    } else {
      let param = tools.clearNull(obj);
      http.put(`${BSS_ADMIN_URL}/api/product/house/${this.state.nowData.id}/update`, param)
        .then((res) => {
          res = res.data;
          if (tools.hasStatusOk(res)) {
            this.setState({
              page: 1,
              modalLoading: false,
              modalShow: false,
            });
            tools.auto_close_result('ok', '操作成功');
            this.onGetListData();
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
    this.setState({ loading: true });
    http.delete(`${BSS_ADMIN_URL}/api/product/house/${id}/delete`)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          tools.auto_close_result('ok', '操作成功');
          this.onGetListData();
        } else {
          tools.dealFail(res);
          this.setState({ loading: false });
        }
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  }

  /**
   * 区域添加/修改/查看 模态框出现
   * @item: 当前选中的那条数据
   * @type: add添加/up修改/see查看
   * **/
  onModalShowRegion (type, data) {
    this.props.areaResouse.fetchArea();
    let defaultdata = {};
    this.districtId = data.districtId;
    let amp = getamp(data.amp);
    if (type == 'add') {
      defaultdata = {
        districtId: data.districtId,
        houseId: data.id,
        amp: amp[0], // 电力
        voltageUnit: amp[1], // 电流单位
        voltage: data.cabinetVoltage, // 电压
        pdu: data.cabinetPdu, // pdu情况
        cabinetUCount: data.cabinetUs, // u位总数
        bearing: data.cabinetBearing, // 承重
        spec: data.cabinetSpec, // 规格
      };
    } else {
      defaultdata = {
        ...data,
        amp: amp[0], // 电流
        voltageUnit: amp[1], // 电流单位
      };
    }
    this.setState({
      modalShowRegion: true,
      nowDataRegion: defaultdata,
      operateTypeRegion: type
    });
  }

  /**
   * 执行 增 修 操作
   * @param {obj} obj
   */
  onModalOkRegion (obj) {
    this.setState({
      modalLoadingRegion: true,
    });
    let obj2 = {districtId: this.districtId,  ...obj};
    if (this.state.operateTypeRegion == 'add') {
      let param = tools.clearNull(obj2);
      http.post(`${BSS_ADMIN_URL}/api/product/floor/add`, param)
        .then((res) => {
          res = res.data;
          if (tools.hasStatusOk(res)) {
            this.setState({
              modalLoadingRegion: false,
              modalShowRegion: false,
            });
            this.onGetListData();
            tools.auto_close_result('ok', '操作成功');
          } else {
            tools.dealFail(res);
          }
          this.setState({ modalLoadingRegion: false });
        })
        .catch(() => {
          this.setState({ modalLoadingRegion: false });
        });
    } else {
      let param = tools.clearNull({
        ...this.state.nowDataRegion,
        ...obj
      });
      http.put(`${BSS_ADMIN_URL}/api/product/floor/${this.state.nowDataRegion.id}/update`, tools.clearNull(param))
        .then((res) => {
          res = res.data;
          if (tools.hasStatusOk(res)) {
            this.setState({
              modalLoadingRegion: false,
              modalShowRegion: false,
            });
            this.onGetListData();
            tools.auto_close_result('ok', '操作成功');
          } else {
            tools.dealFail(res);
          }
          this.setState({ modalLoadingRegion: false });
        })
        .catch(() => {
          this.setState({ modalLoadingRegion: false });
        });
    }


  }

  // 关闭增 修 弹窗
  onModalCloseRegion () {
    this.setState({
      modalShowRegion: false,
    });
  }

  // 删除某一条数据
  onDelRegion (id) {
    this.setState({ loading: true });
    http.delete(`${BSS_ADMIN_URL}/api/product/floor/${id}/delete`)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          tools.auto_close_result('ok', '操作成功');
          this.onGetListData(this.state.page, this.state.pageSize);
        } else {
          tools.dealFail(res);
          this.setState({ loading: false });
        }
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  }

  // 构建字段 机房
  makeColumns () {
    const columns = [
      {
        title: '地区',
        width: 160,
        dataIndex: 'localInfo',
        key: 'localInfo'
      },
      {
        title: '机房名称',
        dataIndex: 'name',
        key: 'name'
      },
      {
        title: '机房编码',
        dataIndex: 'code',
        key: 'code'
      },
      {
        title: '机房别名',
        dataIndex: 'alias',
        key: 'alias'
      },
      {
        title: '机房位置码',
        dataIndex: 'houseLocakCode',
        key: 'houseLocakCode'
      },
      {
        title: '机房等级',
        dataIndex: 'houseLevel',
        key: 'houseLevel',
        render: (text, record) => this.props.cabinetDict.HouseLevel[text] || 'unkown'
      },
      {
        title: '机房属性',
        dataIndex: 'attribute',
        key: 'attribute',
        render: (text, record) => SYS_DICT_HOUSE.house_attr[text] || 'unknow'
      },
      {
        title: '机柜总U数',
        dataIndex: 'cabinetUs',
        key: 'cabinetUs'
      },
      {
        title: '机柜规格',
        dataIndex: 'cabinetSpec',
        key: 'cabinetSpec'
      },
      {
        title: '机柜承重(KG)',
        dataIndex: 'cabinetBearing',
        key: 'cabinetBearing'
      },
      {
        title: '机柜供电电压(V)',
        dataIndex: 'cabinetVoltage',
        key: 'cabinetVoltage'
      },
      {
        title: '机柜默认电力',
        dataIndex: 'cabinetAmp',
        key: 'cabinetAmp'
      },
      {
        title: '机柜PDU情况',
        dataIndex: 'cabinetPdu',
        key: 'cabinetPdu'
      },
      {
        title: '机房建立时间',
        dataIndex: 'houseAddTime',
        key: 'houseAddTime',
        render: (text,record)=>record.houseAddTime?tools.getTime(text):'',
      },
      {
        title: '操作',
        key: 'control',
        fixed: 'right',
        width: 200,
        render: (text, record) => {
          const controls = [];
          const u = User.getPermission() || [];
          u.includes('house-view') &&
          controls.push(
            <span
              key="0"
              className="control-btn green"
              onClick={() => this.onModalShow('see', record)}
            >
              <Tooltip placement="top" title="查看机房">
                <EyeOutlined></EyeOutlined>
              </Tooltip>
            </span>
          );
          controls.push(
            <span
              key="5"
              className="control-btn green"
              onClick={() => this.onCopy(record)}
            >
              <Tooltip placement="top" title="复制机房位置码">
                <FileAddOutlined></FileAddOutlined>
              </Tooltip>
            </span>
          );
          u.includes('house-edit') &&
          controls.push(
            <span
              key="1"
              className="control-btn blue"
              onClick={() => this.onModalShow('up', record)}
            >
              <Tooltip placement="top" title="修改机房">
                <FormOutlined></FormOutlined>
              </Tooltip>
            </span>
          );
          u.includes('house-add') &&
          controls.push(
            <span
              key="2"
              className="control-btn blue"
              onClick={() => this.onModalShowRegion('add', record)}
            >
              <Tooltip placement="top" title="添加机房区域">
                <PlusOutlined />
              </Tooltip>
            </span>
          );
          u.includes('house-del') &&
            controls.push(
              <Popconfirm
                key="3"
                title="确定删除吗?"
                onConfirm={() => this.onDel(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <span className="control-btn red">
                  <Tooltip placement="top" title="删除机房">
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
onCopy=(record) => {
  copy(record.houseLocakCode);
  message.success('复制成功');
}
// 机房下的区域展开
expandedRowRender (data) {
  const columns = [
    { title: '区域名称', dataIndex: 'name', key: 'name' },
    { title: '物理位置码', dataIndex: 'locationCode', key: 'locationCode' },
    {title: '区域编码', dataIndex: 'code', key: 'code' },
    { title: '机柜U位', dataIndex: 'cabinetUCount', key: 'cabinetUCount' },
    { title: '承重(KG)', dataIndex: 'bearing', key: 'bearing' },
    { title: '行数', dataIndex: 'row', key: 'row' },
    { title: '列数', dataIndex: 'col', key: 'col' },
    { title: '电力', dataIndex: 'amp', key: 'amp' },
    { title: '电压(V)', dataIndex: 'voltage', key: 'voltage' },
    { title: '机柜PDU', dataIndex: 'pdu', key: 'pdu' },
    { title: '规格', dataIndex: 'spec', key: 'spec' },
    { title: '负责人', dataIndex: 'fzr', key: 'fzr' },
    {
      title: '操作',
      key: 'control',
      fixed: 'right',
      width: 160,
      render: (text, record) => {
        const controls = [];
        User.hasPermission('region-view') &&
          controls.push(
            <span
              key="0"
              className="control-btn green1"
              onClick={() => this.onModalShowRegion('see', record)}
            >
              <Tooltip placement="top" title="查看区域">
                <EyeOutlined></EyeOutlined>
              </Tooltip>
            </span>
          );
        User.hasPermission('region-edit') &&
          controls.push(
            <span
              key="1"
              className="control-btn blue1"
              onClick={() => this.onModalShowRegion('up', record)}
            >
              <Tooltip placement="top" title="修改区域">
                <FormOutlined></FormOutlined>
              </Tooltip>
            </span>
          );
        User.hasPermission('region-del') &&
            controls.push(
              <Popconfirm
                key="3"
                title="确定删除吗?"
                onConfirm={() => this.onDelRegion(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <span className="control-btn red1">
                  <Tooltip placement="top" title="删除区域">
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
  return <Table columns={columns} rowKey={(record) => record.id}  dataSource={data} pagination={false} />;
}
// 点击展开按钮
expandedRow (expanded, record) {
  let keys = this.state.expandedRowKeys;
  let result = keys;
  // 展开
  if (expanded) {
    result = keys.filter((item) => item !== record.id);
  } else {
    result.push(record.id);
  }
  this.setState({
    expandedRowKeys: result
  });
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
      const { lists } = this.state;
      let params = [];
      // 如果是向上移动 中间的列都在原来sort基础上+1
      if (dragIndex > hoverIndex) {
        let lists1 = lists.slice(hoverIndex, dragIndex);
        lists1.forEach((item) => {
          params.push({
            id: item.id,
            sort: item.sort + 1
          });
        });
        params.unshift({id: dragRecord.record.id, sort: dragRecord.record.sort - lists1.length});
      }
      // 如果是向下移动 中间的行都在原来sort基础上-1
      if (hoverIndex > dragIndex) {
        let lists1 = lists.slice(dragIndex + 1, hoverIndex + 1);
        lists1.forEach((item) => {
          params.push({
            id: item.id,
            sort: item.sort - 1
          });
        });
        params.push({id: dragRecord.record.id, sort: dragRecord.record.sort + lists1.length});
      }
      http.post(`${BSS_ADMIN_URL}/api/product/house/sort`, params)
        .then((res) => {
          res = res.data;
          if (tools.hasStatusOk(res)) {
            this.setState({
              modalLoading: false,
              modalShow: false,
            });
            tools.auto_close_result('ok', '操作成功');
            this.onGetListData({page: 1});
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
      const {lists, loading} =  this.state;
      let {HouseLevel} = this.props.cabinetDict;
      // console.log(tools.getTime('2020-08-01T03:12:09.000+0000'));
      // console.log(tools.getTime('null'));
      return (
        <main className="mian">
          {/* 搜索 */}
          <div className="g-search">
            <Form ref={this.searchFormRef} name="searchbox" layout="inline" onFinish={(values) => {this.onSearch(values);}}>
              <Form.Item name="name">
                <Input placeholder="机房名称" allowClear/>
              </Form.Item>
              <Form.Item name="regionName">
                <Input placeholder="区域名称" allowClear/>
              </Form.Item>
              <Form.Item name="attribute">
                <Select
                  placeholder="机房属性" allowClear
                  style={{width: 100}}>
                  {_.map(SYS_DICT_HOUSE.house_attr, (value, key) => <Option value={parseInt(key)} key={key}>{value}</Option>)}
                </Select>
              </Form.Item>
              <Form.Item shouldUpdate>
                <Button type="primary" htmlType="submit" >搜索</Button>
              </Form.Item>
              <Form.Item shouldUpdate>
                <Button type="primary" onClick={this.onResetSearch} >重置</Button>
              </Form.Item>
            </Form>
          </div>
          {/* 操作 */}
          <div className="g-operate">
            {User.hasPermission('house-add') && <Button size="middle" className="actions-btn"  onClick={() => {this.onModalShow('add');}}>添加机房</Button>}
          </div>
          {/* 数据展示 */}
          <div className="g-table">
            <Table
              columns={this.makeColumns()}
              rowKey={(record) => record.id}
              loading={loading}
              dataSource={lists}
              pagination={false}
              components={User.hasPermission('house-option') ? this.components : {}}
              expandable={{
                indentSize: 0,
                expandRowByClick: true,
                expandedRowRender: (record) => this.expandedRowRender(record.regionList)
              }}
              onRow={User.hasPermission('house-option') ? (record, index) => ({
                record,
                index,
                moveRow: (dragIndex, hoverIndex, item) => {this.moveRow(dragIndex, hoverIndex, item, record, index);},
              }) : null}
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
            HouseLevel={HouseLevel}
          />
          {/* 新增&修改&查看 模态框 */}
          <RegionAdd
            visible={this.state.modalShowRegion}
            modalLoading={this.state.modalLoadingRegion}
            data={this.state.nowDataRegion}
            operateType={this.state.operateTypeRegion}
            onOk={(v) => this.onModalOkRegion(v)}
            onClose={() => this.onModalCloseRegion()}
          />
        </main>
      );
    }
}
