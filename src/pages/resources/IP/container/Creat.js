
/** ip资源管理 修 **/

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import _ from 'lodash';
import http from '@src/util/http';
import tools from '@src/util/tools';
import {
    Form,
    Button,
    Input,
    Select
} from 'antd';
import { inject, observer } from 'mobx-react';


@inject('root')
@inject("areaResouse")
@inject("ipresourceDict")
@observer
class Creat extends React.Component {
    static propTypes = {
        location: P.any, // 当前位置
        areaResouse: P.any, // 区域字典
        id: P.string, // 当前修改的ID
        ipresourceDict: P.any, // ip资源字典
        that: P.any, // 父组件对象
        root: P.any, // 全局状态
        onClose: P.func, // 关闭编辑弹窗
        onOK: P.func, // 修改成功后的回调
        defaultData: P.any, // ip基础信息
    };
    constructor(props) {
        super(props);
        console.log(this.props);
        this.formRefEdit = React.createRef();
        this.formRefIP = React.createRef();
        this.devideDetail = this.props.defaultData;
        this.state = {
            showModal: false,
            modalLoading: false,
            uw: null,
            ubitInfo: {},
            regionInfo: {},
            cabinetInfo: {},
            devideDetail: {},
            locationCode: undefined,
        };
    }
    componentDidMount() {
        this.props.areaResouse.fetchVarea();
        // this.getIP(this.props.id);
        this.onGetCategory()
    }

    // 确认ip段信息
    onFinish=(values)=> {
        console.log(values)
        console.log(this.state.IPsegment)
        let IPsegment=this.state.IPsegment
        let params={
            ipAddr:IPsegment.ip_1+'.'+IPsegment.ip_2+'.'+IPsegment.ip_3+'.'+IPsegment.ip_4+'/'+IPsegment.bits,
            ipType:2,
            ipCount:values.numofaddr,
            netmask:values.snm_1+'.'+values.snm_2+'.'+values.snm_3+'.'+values.snm_4,
            gateway:values.firstadr_1+'.'+values.firstadr_2+'.'+values.firstadr_3+'.'+values.firstadr_4,
            vlan:'',
            availableSegment:values.firstadr_1+'.'+values.firstadr_2+'.'+values.firstadr_3+'.'+(values.firstadr_4+1)+'-'+values.lastadr_4,
            networkIp:values.nwadr_1+'.'+values.nwadr_2+'.'+values.nwadr_3+'.'+values.nwadr_4,
            broadcastIp:values.bcast_1+'.'+values.bcast_2+'.'+values.bcast_3+'.'+values.bcast_4,
        }
        if(params.ipType==1){
            params.ipAddr=IPsegment.ip_1+'.'+IPsegment.ip_2+'.'+IPsegment.ip_3+'.'+IPsegment.ip_4
        }
        if(IPsegment.bits==31||IPsegment.bits==32){
            params.broadcastIp=''
            params.networkIp=''
        }
        console.log(this.props)
        console.log(params)
        if(values.snm_1=='错误'||values.numofaddr=='错误'){
            return false
        }else{
            this.props.onOk(params,this.props.index)
        }
    }

    /**
     * 重置搜索条件
     */
    onResetSearch = () => {
        this.formRefEdit.current.resetFields();
    };

    onModalshow = () => {
        // 防御线路
        if (Object.keys(this.props.ipresourceDict.defenseline).length <= 0) {
            this.props.ipresourceDict.fetchdefenseline();
        }
        // 带宽类型
        if (Object.keys(this.props.ipresourceDict.bandwidthType).length <= 0) {
            this.props.ipresourceDict.fetchbandwidthType();
        }
        this.setState({
            showModal: true
        });
    }

    /** 点击关闭时触发 **/
    onClose = () => {
        this.props.onClose();
    };
    onShowPortModal = () => {
        this.setState({
            showPortModal: true,
        });
    }
    onClosePort = () => {
        this.setState({
            showPortModal: false,
        });
    }


    // 修改峰值
    onChange(value) {
        // console.log('changed', value);
    }

    //获取类目数据
    onGetCategory() {
        http
            .get(`${BSS_ADMIN_URL}/api/goods/category`)
            .then((res) => {
                res = res.data;
                if (tools.hasStatusOk(res)) {
                    let lists = res.data;
                    let lists2 = [];
                    lists2 = tools.formatTree(lists);
                    this.setState({
                        lists2: lists2,
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
    //计算 掩码地址
    h_fillbitsfromleft(num)
    {
        if (num >= 8 ){
            return(255);
        }
       let bitpat=0xff00; 
        while (num > 0){
            bitpat=bitpat >> 1;
            num--;
        }
        return(bitpat & 0xff);
    }

    //计算 掩码地址
    calcNWmask(cform) {
        console.log('aaaaa')
        let tmpvar = parseInt(cform.bits, 10);
        console.log(tmpvar)
        if (isNaN(tmpvar) || tmpvar >= 32 || tmpvar < 0) {
            this.formRefEdit.current.setFieldsValue({
                snm_1:'错误',
                snm_2:"",
                snm_3:"",
                snm_4:"",
            })
            return (1);
        }
        this.formRefEdit.current.setFieldsValue({
            snm_1:0,
            snm_2:0,
            snm_3:0,
            snm_4:0,
        })
        if (tmpvar >= 8) {
            this.formRefEdit.current.setFieldsValue({
                snm_1:255,
            })
            tmpvar -= 8;
        } else {
            let a = this.h_fillbitsfromleft(tmpvar);
            this.formRefEdit.current.setFieldsValue({
                snm_1:a,
            })
            return (0);
        }
        if (tmpvar >= 8) {
            this.formRefEdit.current.setFieldsValue({
                snm_2:255,
            })
            tmpvar -= 8;
        } else {
            let a = this.h_fillbitsfromleft(tmpvar);
            this.formRefEdit.current.setFieldsValue({
                snm_2:a,
            })
            return (0);
        }
        if (tmpvar >= 8) {
            this.formRefEdit.current.setFieldsValue({
                snm_3:255,
            })
            tmpvar -= 8;
        } else {
            let a = this.h_fillbitsfromleft(tmpvar);
            this.formRefEdit.current.setFieldsValue({
                snm_3:a,
            })
            return (0);
        }
        let a = this.h_fillbitsfromleft(tmpvar);
        this.formRefEdit.current.setFieldsValue({
            snm_4:a,
        })
        return (0);
    }

    //计算
    onFinish_count(cform) {
        console.log(cform)
        this.setState({
            IPsegment:cform
        })
        let rt = 0;
        // reset_rest_from4(cform);
        let tmpvar = parseInt(cform.ip_1, 10);
        console.log(tmpvar)
        if (isNaN(tmpvar) || tmpvar > 255 || tmpvar < 0) {
            this.formRefEdit.current.setFieldsValue({ numofaddr: '错误' })
            return (1);
        }
        tmpvar = parseInt(cform.ip_2, 10);
        console.log(tmpvar)

        if (isNaN(tmpvar) || tmpvar > 255 || tmpvar < 0) {
            this.formRefEdit.current.setFieldsValue({ numofaddr: '错误' })
            return (1);
        }
        tmpvar = parseInt(cform.ip_3, 10);
        console.log(tmpvar)

        if (isNaN(tmpvar) || tmpvar > 255 || tmpvar < 0) {
            this.formRefEdit.current.setFieldsValue({ numofaddr: '错误' })
            return (1);
        }
        tmpvar = parseInt(cform.ip_4, 10);
        console.log(tmpvar)

        if (isNaN(tmpvar) || tmpvar > 255 || tmpvar < 0) {
            this.formRefEdit.current.setFieldsValue({ numofaddr: '错误' })
            return (1);
        }
        rt = this.calcNWmask(cform);
        console.log(this.formRefEdit.current.getFieldValue())
        console.log(rt)
        if (rt != 0) {
            // error
            return (1);
        }
        tmpvar = parseInt(cform.bits, 10);
        if (tmpvar < 0) {
            this.formRefEdit.current.setFieldsValue({ numofaddr: '错误' })
            return (1);
        }
        if (tmpvar > 32) {
            this.formRefEdit.current.setFieldsValue({ numofaddr: '错误' })
            return (1);
        }
        if (tmpvar == 31) {
            let b=this.formRefEdit.current.getFieldValue()
            this.formRefEdit.current.setFieldsValue({
                numofaddr:2,
                firstadr_1:cform.ip_1 & b.snm_1,
                firstadr_2:cform.ip_2 & b.snm_2,
                firstadr_3:cform.ip_3 & b.snm_3,
                firstadr_4:cform.ip_4 & b.snm_4,
                lastadr_1:cform.ip_1 | (~b.snm_1 & 0xff),
                lastadr_2:cform.ip_2 | (~b.snm_2 & 0xff),
                lastadr_3:cform.ip_3 | (~b.snm_3 & 0xff),
                lastadr_4:cform.ip_4 | (~b.snm_4 & 0xff)
            })
            return (1);
        }
        if (tmpvar == 32) {
            let b=this.formRefEdit.current.getFieldValue()
            this.formRefEdit.current.setFieldsValue({
                numofaddr:1,
                firstadr_1:cform.ip_1,
                firstadr_2:cform.ip_2,
                firstadr_3:cform.ip_3,
                firstadr_4:cform.ip_4,
            })
            return (1);
        }
        this.formRefEdit.current.setFieldsValue({
            numofaddr:Math.pow(2, 32 - tmpvar) - 2,
        })
        //
        let b=this.formRefEdit.current.getFieldValue()
        this.formRefEdit.current.setFieldsValue({
            bcast_1:cform.ip_1 | (~b.snm_1 & 0xff),
            bcast_2:cform.ip_2 | (~b.snm_2 & 0xff),
            bcast_3:cform.ip_3 | (~b.snm_3 & 0xff),
            bcast_4:cform.ip_4 | (~b.snm_4 & 0xff),
            nwadr_1:cform.ip_1 & b.snm_1,
            nwadr_2:cform.ip_2 & b.snm_2,
            nwadr_3:cform.ip_3 & b.snm_3,
            nwadr_4:cform.ip_4 & b.snm_4,
        }) 
         b=this.formRefEdit.current.getFieldValue()
        this.formRefEdit.current.setFieldsValue({
            firstadr_1:b.nwadr_1,
            firstadr_2:b.nwadr_2,
            firstadr_3:b.nwadr_3,
            firstadr_4:parseInt(b.nwadr_4) + 1,
            lastadr_1:b.bcast_1,
            lastadr_2:b.bcast_1,
            lastadr_3:b.bcast_1,
            lastadr_4:parseInt(b.bcast_4) - 1,
        })     
        return (0);
    }
   //清空
    clear=()=>{ 
        this.formRefEdit.current.resetFields()
        this.formRefIP.current.resetFields()
        this.setState({
            IPsegment:null
        })    
    }

    render() {
        return (
            <React.Fragment>
                <Form name="form_in_modal"
                    ref={this.formRefIP}
                    className="g-modal-field creatip"
                    // initialValues={defaultData}
                    onFinish={(values) => { this.onFinish_count(values); }}>
                    <Form.Item label="IP 段">
                        <Form.Item
                            name="ip_1"
                            style={{ display: 'inline-block', width: '70px' }}
                        >
                            <Input placeholder="" />
                        </Form.Item>
                        <Form.Item
                            name="ip_2"
                            style={{ display: 'inline-block', width: '70px' }}
                        >
                            <Input placeholder="" />
                        </Form.Item>
                        <Form.Item
                            name="ip_3"
                            style={{ display: 'inline-block', width: '70px' }}
                        >
                            <Input placeholder="" />
                        </Form.Item>
                        <Form.Item
                            name="ip_4"
                            style={{ display: 'inline-block', width: '70px' }}
                        >
                            <Input placeholder="" />
                        </Form.Item>
                        <span style={{ display: 'inline-block', marginLeft: '50px' }}>掩码：</span>
                        <Form.Item
                            name="bits"
                            style={{ display: 'inline-block', width: '70px' }}
                        >
                            <Input placeholder="" />
                        </Form.Item>
                        <Button htmlType="submit" style={{ display: 'inline-block', marginLeft: '50px' }} className="action-btn ok">计算</Button>
                        <Button className="action-btn ok" onClick={this.clear}>清空</Button>
                    </Form.Item>
                </Form>
                <Form name="form_in_modal"
                    ref={this.formRefEdit}
                    className="g-modal-field creatip"
                    // initialValues={defaultData}
                    onFinish={(values) => { this.onFinish(values); }}>
                    <Form.Item label="掩码地址">
                        <Form.Item
                            name="snm_1"
                            style={{ display: 'inline-block', width: '70px' }}
                        >
                            <Input placeholder="" />
                        </Form.Item>
                        <Form.Item
                            name="snm_2"
                            style={{ display: 'inline-block', width: '70px' }}
                        >
                            <Input placeholder="" />
                        </Form.Item>
                        <Form.Item
                            name="snm_3"
                            style={{ display: 'inline-block', width: '70px' }}
                        >
                            <Input placeholder="" />
                        </Form.Item>
                        <Form.Item
                            name="snm_4"
                            style={{ display: 'inline-block', width: '70px' }}
                        >
                            <Input placeholder="" />
                        </Form.Item>
                    </Form.Item>
                    <Form.Item label="网络地址">
                        <Form.Item
                            name="nwadr_1"
                            style={{ display: 'inline-block', width: '70px' }}
                        >
                            <Input placeholder="" />
                        </Form.Item>
                        <Form.Item
                            name="nwadr_2"
                            style={{ display: 'inline-block', width: '70px' }}
                        >
                            <Input placeholder="" />
                        </Form.Item>
                        <Form.Item
                            name="nwadr_3"
                            style={{ display: 'inline-block', width: '70px' }}
                        >
                            <Input placeholder="" />
                        </Form.Item>
                        <Form.Item
                            name="nwadr_4"
                            style={{ display: 'inline-block', width: '70px' }}
                        >
                            <Input placeholder="" />
                        </Form.Item>
                    </Form.Item>
                    <Form.Item label="广播地址">
                        <Form.Item
                            name="bcast_1"
                            style={{ display: 'inline-block', width: '70px' }}
                        >
                            <Input placeholder="" />
                        </Form.Item>
                        <Form.Item
                            name="bcast_2"
                            style={{ display: 'inline-block', width: '70px' }}
                        >
                            <Input placeholder="" />
                        </Form.Item>
                        <Form.Item
                            name="bcast_3"
                            style={{ display: 'inline-block', width: '70px' }}
                        >
                            <Input placeholder="" />
                        </Form.Item>
                        <Form.Item
                            name="bcast_4"
                            style={{ display: 'inline-block', width: '70px' }}
                        >
                            <Input placeholder="" />
                        </Form.Item>
                    </Form.Item>
                    <Form.Item label="第一可用">
                        <Form.Item
                            name="firstadr_1"
                            style={{ display: 'inline-block', width: '70px' }}
                        >
                            <Input placeholder="" />
                        </Form.Item>
                        <Form.Item
                            name="firstadr_2"
                            style={{ display: 'inline-block', width: '70px' }}
                        >
                            <Input placeholder="" />
                        </Form.Item>
                        <Form.Item
                            name="firstadr_3"
                            style={{ display: 'inline-block', width: '70px' }}
                        >
                            <Input placeholder="" />
                        </Form.Item>
                        <Form.Item
                            name="firstadr_4"
                            style={{ display: 'inline-block', width: '70px' }}
                        >
                            <Input placeholder="" />
                        </Form.Item>
                    </Form.Item>
                    <Form.Item label="最后可用">
                        <Form.Item
                            name="lastadr_1"
                            style={{ display: 'inline-block', width: '70px' }}
                        >
                            <Input placeholder="" />
                        </Form.Item>
                        <Form.Item
                            name="lastadr_2"
                            style={{ display: 'inline-block', width: '70px' }}
                        >
                            <Input placeholder="" />
                        </Form.Item>
                        <Form.Item
                            name="lastadr_3"
                            style={{ display: 'inline-block', width: '70px' }}
                        >
                            <Input placeholder="" />
                        </Form.Item>
                        <Form.Item
                            name="lastadr_4"
                            style={{ display: 'inline-block', width: '70px' }}
                        >
                            <Input placeholder="" />
                        </Form.Item>
                    </Form.Item>
                    <Form.Item label="可用IP个数">
                        <Form.Item
                            name="numofaddr"
                            style={{ display: 'inline-block', width: '267px' }}
                        >
                            <Input placeholder="" />
                        </Form.Item>
                    </Form.Item>
                    <p>提示：显示网络，广播，第一次和最后一个给定的网络地址<br></br>
                       在网络掩码“位格式”也被称为CIDR格式（CIDR=无类别域间路由选择）。</p>
                    <div className="actions-btn">
                        <Button htmlType="submit" className="action-btn ok">确认</Button>
                        <Button onClick={this.onClose} className="action-btn ok">取消</Button>
                    </div>
                </Form>
            </React.Fragment>
        );
    }
}
export default Creat;
