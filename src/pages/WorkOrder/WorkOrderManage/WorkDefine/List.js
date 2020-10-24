/* eslint-disable react/prop-types */

import React from 'react';
import P from 'prop-types';
import {
  Form, Button, Input, Select, Radio, Pagination, Modal, Tabs, message,Row,Col,Tooltip
} from 'antd';

import { inject, observer } from 'mobx-react';
import http from '@src/util/http';
import tools from '@src/util/tools'; // 工具
import { SYS_DICT_PRODUCT, SYS_DICT_SERVER, SYS_DICT_COMMON } from '@src/config/sysDict'; // 全局变量
import { formItemLayout2 } from '@src/config/commvar'; // 全局变量
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
// ==================
// 所需的所有组件
// ==================
import {
    FormOutlined,
} from "@ant-design/icons";
import Steps from './Steps';
const FormItem = Form.Item;
const { confirm } = Modal;
const { Option } = Select;
const { TabPane } = Tabs;
@inject("areaResouse")
@observer
// @DropTarget(type, spec, collect)
export default class List extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    userinfo: P.any,
  };
  AddformRef = React.createRef();
  constructor(props) {
    super(props);
    this.key = 1;
    this.formRef = React.createRef();
    this.formRef1 = React.createRef();
    this.state = {
      lists: [
        // { title:'cs',
        // content: <Steps data1={[]} name={{work:'cs'}} onEdit={(val)=>this.onEditok(val)} treenode={this.props.treenode}  categoryId={this.props.categoryId}></Steps>, key: 1 }

      ],
      loading: false,
      page: 1, // 当前第几页
      pageSize: 20, // 每页多少条
      total: 0, // 数据库总共多少条数据
      modalShow: false,   // 机房增 修 查 状态模的显示
      modalLoading: false, // 添加/修改/查看 是否正在请求中
      AddShow: false,
      index: 0,
      arr: [],
    };
  } 
  componentDidMount() {
  }

  // 查询当前页面所需列表数据
  onGetListData() {

  }
  // 设置选中tab
  setActiveKey = (key) => {
    this.key = parseInt(key);
  }
  Add = () =>{
    this.setState({AddShow:true});
  }
  onAddClose = ()=>{
   this.setState({
    AddShow:false,
   });
  }
  onEditok = (value)=>{
    let {lists} = this.state; 
    let newLists = Object.assign([],lists);
    newLists.forEach((item)=>{
        if(item.key === this.key){
         item.title = value.work;
        }
    });
    this.setState({
        lists:newLists,
    });
  }
  onAddok = (value)=>{
    this.setState({AddShow:false});
    this.steps = value.steps;
    let arr = [];
    for (let index = 1; index <= value.steps; index++) {
        arr.push ({
            title:`step${index}`,
            description:'未定义',
            status:'wait',
            id:index,
            deptId:'',
            time:'',
            deptname:'',
        })
    };
    const { lists } = this.state;
    const len = lists.length; 
    const newLists = [...lists];
    newLists.push({ title:value.work,
     content: <Steps data1={arr} name={value} onEdit={(val)=>this.onEditok(val)} treenode={this.props.treenode} steps={value.steps} categoryId={this.props.categoryId}></Steps>, key: len+1 });
    this.setState({
      lists: newLists,
    });
  }
  render() {
    const { lists, loading, data} = this.state;
    return (
      <main className="mian">
        <div className="g-operate">
        <Tooltip title='点击添加工作流' placement='top'>
          <Button className="actions-btn" size="middle" onClick={() => { this.Add(); }}>自定义工作流</Button>
          </Tooltip>
        </div>
        <Tabs tabPosition="left" defaultActiveKey="1" onChange={this.setActiveKey} 
           hideAdd
           type="editable-card"
           closable={false}       
        >
          {
            lists.map((item)=> <TabPane tab={item.title} key={item.key}  closable={false}>
             {item.content}
            </TabPane>)
          }
        </Tabs>
        <Modal
          visible={this.state.AddShow}
          width="40%"
          destroyOnClose
          onCancel={this.onAddClose}
          title="新增工作流"
          footer={null}
        >
          <Form
            name="form_in_modal"
            ref={this.formRef}
            className="g-modal-field"
            onFinish={(value)=>this.onAddok(value)}
          >
            <Row>
              <Col span={24}>
                <FormItem
                  name='work'
                  label="工作流名称"
                  rules={[
                    { required: true, message: "必填" },
                  ]}
                  {...formItemLayout2}
                >
                    <Input
                      placeholder="请输入"
                    >
                    </Input>
                </FormItem>
                <FormItem
                  name='steps'
                  label="工作流步长"
                  rules={[
                    { required: true, message: "必填" },
                    { pattern: regExpConfig.isNumAndThanZero, message: "请输入整数"}
                  ]}
                  {...formItemLayout2}
                >
                    <Input
                      placeholder="提示：步长不能大于7步"
                    >
                    </Input>
                </FormItem>
              </Col>
            </Row>
            <div className="actions-btn">
            <Button
              htmlType="submit"
              className="action-btn ok"
            >
                提交
            </Button>
            <Button
              onClick={this.onAddClose}
              className="action-btn ok"
              style={{ margin: "0 auto" }}
            >
                取消
            </Button>
          </div>
          </Form>
        </Modal>
       
      </main>
    );
  }
}
