import React from 'react';
import P from 'prop-types';
import http from '@src/util/http';
import tools from '@src/util/tools';
import {
  Form,
  Select,
  InputNumber,
  Switch,
  Radio,
  DatePicker,
  Button,
  Upload,
  Modal,
  Checkbox,
  Row,
  Col,
  Input,
} from 'antd';
import { inject, observer} from 'mobx-react';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import {formItemLayout, formItemLayout2} from '@src/config/commvar'; // 全局通用变量
import {SYS_DICT_SERVER} from '@src/config/sysDict'; // 系统字典
import { User } from '@src/util/user';
const { RangePicker } = DatePicker;
@inject("areaResouse")
class Base extends React.Component {
  static propTypes = {
    saveContent: P.func, // 保存配置
    defaultValue: P.any, // 默认值（点击保存后的值）
    areaResouse: P.any,
  }
  constructor (props) {
    super(props);
    let logo, url;
    if (this.props.defaultValue && this.props.defaultValue.logo) {
      url = `${FILE_URL}/file/${this.props.defaultValue.logo}`;
      logo = this.props.defaultValue.logo;
    }
    this.state = {
      imageUrl: url || undefined,
      editable: false, // 编辑模式（编辑模式可编辑，且有确定按钮）
      logo: logo || undefined, // 图片id
    };
  }

  componentDidMount () {
    console.log(this.props.defaultValue);
  }

  onFinish = (values) => {
    if (!this.state.logo) {
      Modal.error({
        title: '请上传logo'
      });
      return false;
    }
    this.props.saveContent({
      ...values,
      logo: this.state.logo
    });
    this.setState({ editable: true });
  };

  handleCancel = () => this.setState({ previewVisible: false });

  handlePreview = () => {
    this.setState({
      previewVisible: true,
    });
  };

  // 上传图片
  onBeforeUpload = (file) => {
    if (file.type != 'image/jpeg') {
      Modal.error({
        title: '请上传图片格式文件！'
      });
      return;
    }
  };
  // 删除
  onRemove = (file) => {
    http.delete(`${BSS_ADMIN_URL}/api/file/${this.state.logo}`);
    this.setState({
      imageUrl: "",
      logo: undefined
    });
  }

  onChangeFile = (info) => {
    console.log(info);
    if (info.file.status !== 'uploading') {
      console.log('已上传');
    }
    if (info.file.status === 'done') {
      console.log(info.file.response);
      if (info.file.response.code == 20000) {
        // tools.auto_close_result('ok', '上传成功！');
        let id = info.file.response.data;
        this.setState({
          imageUrl: `${FILE_URL}/file/${id}`,
          logo: id
        });
      } else {
        Modal.error({
          title: "上传失败！"
        });
      }
    } else if (info.file.status === 'error') {
      Modal.error({
        title: "上传失败！"
      });
    }
  }


  // 修改编辑状态
 editChange = (editable) => {
   this.setState({ editable });
 };

 render () {
   const {imageUrl, previewVisible, previewTitle, editable} = this.state;

   return (
     <div style={{maxWidth: 800}}>
       <Form
         name="baseinfo"
         onFinish={this.onFinish}
         className="g-modal-field"
         initialValues={this.props.defaultValue}
       >
         <Form.Item name="name" label="产品名称" disabled={editable}
           rules={[{ required: true, message: '请输入'}]}
           {...formItemLayout}>
           <Input />
         </Form.Item>

         <Form.Item
           label={<span className="required">产品图片</span>}
           extra="请上传jpg格式图片，建议大小 200px * 200px"
           {...formItemLayout}
         >
           <Upload
             listType="picture-card"
             className="avatar-uploader"
             name="file"
             headers={{"Authorization": 'token ' + User.getToken()}}
             data={{sysId: 1}}
             action={`${BSS_ADMIN_URL}/api/file`}
             onPreview={this.handlePreview}
             beforeUpload={this.onBeforeUpload}
             onRemove={this.onRemove}
             onChange={this.onChangeFile}
           >
             {imageUrl ? null : <div>
               <PlusOutlined />
               <div className="ant-upload-text">上传</div>
             </div>}
           </Upload>
         </Form.Item>

         <Form.Item name="description" label="产品描述"
           rules={[{ required: true, message: '请输入'}]}
           {...formItemLayout}>
           <Input.TextArea disabled={editable} />
         </Form.Item>

         <Form.Item
           name="salesRegionList"
           label="销售区域"
           rules={[{ required: true, message: '请选择'}]}
           {...formItemLayout}
         >
           <Select mode="multiple" placeholder="请选择销售区域" disabled={editable}>
             {
               _.map(this.props.areaResouse.rootAreaList, (area) => <Select.Option value={area.id} key={area.id}>{area.name}</Select.Option>)
             }
           </Select>
         </Form.Item>
         <Form.Item
           name="salesObjectList"
           label="服务对象"
           rules={[{ required: true, message: '请选择'}]}
           {...formItemLayout}
         >
           <Select mode="multiple" placeholder="请选择服务对象" disabled={editable}>
             <Select.Option value="big">大客户</Select.Option>
             <Select.Option value="new">新用户</Select.Option>
           </Select>
         </Form.Item>

         <Form.Item name="salesType" label="在售时间"
           rules={[{ required: true, message: '请选择'}]}
           {...formItemLayout}>
           <Radio.Group disabled={editable}>
             <Row><Radio value={1}>永久</Radio></Row>
             <Row>
               <Radio value={2}>自定义</Radio>
               <Form.Item name="salesTime">
                 <RangePicker/>
               </Form.Item>
             </Row>
           </Radio.Group>
         </Form.Item>
         <div className="actions-btn" style={{textAlign: "center"}}>
           {!editable && <Button htmlType="submit" className="action-btn ok">保存</Button>}
           {editable && <Button className="action-btn ok" onClick={() => {this.editChange(false);}}>编辑</Button>}
         </div>
       </Form>
       <Modal
         visible={previewVisible}
         title={previewTitle}
         footer={null}
         onCancel={this.handleCancel}
       >
         <img alt="example" style={{ width: '100%' }} src={imageUrl} />
       </Modal>
     </div>
   );
 }

};

export default Base;
