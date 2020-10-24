import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Steps,Button,Modal,Form,Input,Row,Col,TreeSelect,Tag,Alert,Tooltip} from 'antd'
import { formItemLayout2 } from '@src/config/commvar' // 全局变量
import "./index.less";
import { inject, observer } from "mobx-react";
import {
    ExclamationCircleOutlined,
} from "@ant-design/icons";
import Add from './container/Add';
const { Step } = Steps;
const FormItem = Form.Item;
const { confirm } = Modal;
const { TreeNode } = TreeSelect;
@observer
export default class Csteps extends Component {
    static propTypes = {
        prop: PropTypes.func,
    }
    constructor(props){
        super(props);
        this.arr = [];
        this.obj = {}; // 第几步的数据
        this.formRef1 = React.createRef();
        this.state = {
           EditShow: false,
           data: this.props.name,
           current: -1,
           lists: this.props.data1,
           operateType: 'add',
           modalShow: false,
           nowData: {},
           AddShow: false,
           defaultValue: {},
           status: [],
        }
    }
    edit = ()=>{
        this.setState({
            EditShow:true,
        })
    }
    onEditClose= ()=>{
        this.setState({
        EditShow:false,
        })
    }
    onEditok = (value)=>{
        this.props.onEdit(value);
        this.setState({
          EditShow: false,
          data: value,
        })
    }
    del = (current) =>{
        this.obj = this.state.lists[current];
        let newLists = Object.assign([],this.state.lists);
        let newLists2 = newLists.filter((item)=>item.id != this.obj.id);
        let that = this;
        confirm({
            title: `你确定要删除 ${that.obj.title} 吗？(删除后不可恢复)`,
            icon: <ExclamationCircleOutlined />,
            okText: "确定",
            okType: "danger",
            cancelText: "取消",
            onOk () {
                that.setState({
                    lists: newLists2,
                });
            },
            onCancel () {
            },
          });
    }
    handle = ()=>{
        let {lists,data} = this.state;
        // console.log(lists);
        // console.log(data);
        // console.log(this.props.categoryId);
    }
    onChange = (current)=>{
       let{lists} = this.state;
       let defaultValue = lists[current];
       this.setState({ 
           current:current,
           defaultValue:defaultValue,
           AddShow:true 
        });
    }
    onClose = () => {
        this.setState({
            AddShow: false
        });
    };
    onChange2 = ()=>{
      let {current,lists} = this.state;
      let defaultValue = lists[current];
       this.setState({ 
           current:current,
           defaultValue:defaultValue,
           AddShow:true 
        });
    }
    handleOk = (value)=>{
        let {current,lists} = this.state;
        let newLists = Object.assign([],lists);
        let status = [];
        newLists.forEach((item)=>{
          if(item.id === lists[current].id){
              item.description =<Tooltip title='点击修改' placement='top'> <Tag color='#2db7f5' style={{fontSize:'16px',cursor: 'pointer'}} onClick={()=>this.onChange2()}>{`${value.deptname}    部门处理时间为:  ${value.time}`} </Tag></Tooltip>; 
              item.status = 'process';
              item.deptId = value.deptId;
              item.time = value.time;
              item.deptname =value.deptname;
          };
          status.push(
              item.status
          )
        });
        this.setState({
            lists:newLists,
            status:status,
        });
        this.onClose();
    }
    render() {
        let {data,lists,nowData,current,defaultValue,status} = this.state;
        let {treenode} = this.props;
        return (
            <div className='main' style={{paddingLeft: '450px'}}>
                 <div className="g-operate">
                 <Tooltip title='点击修改工作流名称' placement='top'> 
                     <Button className="actions-btn" size="middle" onClick={() => { this.edit(); }}>修改当前工作流名称</Button>
                </Tooltip>    
                 </div>
                 <div className="info">
                 <Alert
                    showIcon
                    closable
                    message="提示:"
                    description="请点击step1依次分配部门以及时间,或者点击已分配好的部门修改"
                    type="info"
                    />
                 </div>
                 <div className='step-left'>
                 <Steps direction="vertical" size='default' onChange={this.onChange} current={current}>
                  {
                    lists.map((item)=><Step title={item.title} description={item.description} key={item.id} status={item.status}></Step>)
                  }
                </Steps>
                <div className='des-right up'> 
                {
                    lists.map((item,index)=>
                    <Button className="actions-btn btn1" size="middle" onClick={() => { this.del(index); }} key={item.id} style={item.status==='wait'?{display:'none'}:{display:'block'}}>删除{lists[index].title}</Button>
                    )
                }
                 </div> 
                 </div>
                
                 <div className="info">
                {
                    (status.includes('wait') === false&&status.length >0)&&
                    <Alert
                    message="你已成功创建工作流"
                    description="请点击下面保存按钮提交"
                    type="success"
                    showIcon
                    closable
                    />
                }
                 </div>
                 <div className='save'>
                 <Tooltip title='点击保存并提交' placement='top'>  
                 <Button type="primary" onClick={() => { this.handle(); }} block>保存并提交</Button>
                 </Tooltip>
                 </div>
                <Modal
                    visible={this.state.EditShow}
                    width="40%"
                    destroyOnClose
                    onCancel={this.onEditClose}
                    title="修改工作流"
                    footer={null}
                    >
                    <Form
                        name="form_in_modal"
                        ref={this.formRef1}
                        className="g-modal-field"
                        onFinish={(value)=>this.onEditok(value)}
                        initialValues={data}
                    >
                    <Row>
                        <Col span={24}>
                        <FormItem
                         name='work'
                         label="工作流名称"
                        {...formItemLayout2}
                         >
                                <Input
                                placeholder="请输入"
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
                        onClick={this.onEditClose}
                        className="action-btn ok"
                        style={{ margin: "0 auto" }}
                        >
                            取消
                        </Button>
                    </div>
                    </Form>
                </Modal>
                <Modal
                title='分配'
                width="50%"
                destroyOnClose
                visible={this.state.AddShow}
                footer={null}
                onCancel={this.onClose}
                >
                   <Add onOK={(val) => this.handleOk(val)} onClose={this.onClose} treenode={treenode} nowData={defaultValue}/>
                </Modal>
            </div>
        )
    }
}
