/* eslint-disable react/prop-types */
/* eslint-disable react/no-did-mount-set-state */
/** 输入账号密码方式等等 **/

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import { inject } from 'mobx-react';
import {observable} from "mobx";
import { withRouter } from 'react-router-dom';
import tools from '@src/util/tools';
import { User } from '@src/util/user';
import {ApiService as Fetchapi} from '@src/util/fetch-api'; // 自己写的工具函数，封装了请求数据的通用接口
import '../index.less';
// ==================
// 所需的所有组件
// ==================
import Vcode from 'react-vcode';
import { Form, Input, Button, Checkbox, message } from 'antd';

// ==================
// Definition
// ==================

const FormItem = Form.Item;
@inject('root')
@inject('authManage')
class LoginContainer extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    form: P.any,
    actions: P.any
  };

  constructor (props) {
    super(props);
    this.state = {
      loading: false, // 是否正在登录中
      rememberPassword: false, // 是否记住密码
      codeValue: '00000', // 当前验证码的值
      show: false // 加载完毕时触发动画
    };
  }

  componentDidMount () {
    // eslint-disable-next-line react/prop-types
    console.log('componentDidMount');
    // 进入登陆页时，判断之前是否保存了用户名和密码
    const form = this.props.form;
    let userLoginInfo = localStorage.getItem('userLoginInfo');
    if (userLoginInfo) {
      userLoginInfo = JSON.parse(userLoginInfo);
      this.setState({
        rememberPassword: true
      });
      form.setFieldsValue({
        username: userLoginInfo.username,
        password: tools.uncompile(userLoginInfo.password)
      });
    }
    if (!userLoginInfo) {
      // document.getElementById('username').focus();
    }
    this.setState({
      show: true
    });
  }

  // 用户提交登录
  onFinish = (values) => {
    this.setState({ loading: true });
    this.loginIn(values)
      .then((res) => {
        if (res.status === 200) {
          message.success('登录成功');
          this.props.root.setUserInfo(res.data);
          if (this.state.rememberPassword) {
            localStorage.setItem(
              'userLoginInfo',
              JSON.stringify({
                username: values.username,
                password: tools.compile(values.password) // 密码简单加密一下再存到localStorage
              })
            ); // 保存用户名和密码
          } else {
            localStorage.removeItem('userLoginInfo');
          }

          /** 将这些信息加密后存入sessionStorage,并存入store **/
          sessionStorage.setItem(
            'userinfo',
            tools.compile(JSON.stringify(res.data))
          );
          this.props.root.setUserInfo(res.data);
          setTimeout(() => this.props.history.replace('/')); // 跳转到主页,用setTimeout是为了等待上一句设置用户信息完成
        } else {
          message.error(res.message);
        }
      })
      .finally((err) => {
        this.setState({ loading: false });
      });
  }

  // 获取用户信息
  async loginIn (values) {
    let userInfo = null;
    let roles = [];
    let menus = [];
    let powers = [];
    let code = '';

    /** 1.登录 **/
    const res1 = await this.props.root.onLogin(values); // 登录接口
    if (!res1 || res1.code !== 20000) {
      // 登录失败
      return res1;
    }
    code = res1.data;
    User.setToken(code);

    // /** 获取用户信息 **/
    // const info = await this.props.root.onLogin(values); // 登录接口
    // if (!info || info.code !== 20000) {
    //   // 登录失败
    //   return info;
    // }

    // userInfo = info.data;

    /** 2.获取角色信息 **/
    const res2 = await this.props.authManage.getRoleById({ id: userInfo.roles }); // 查询所有角色信息
    if (!res2 || res2.status !== 200) {
      // 角色查询失败
      return res2;
    }

    roles = res2.data;

    /** 3.获取菜单信息 **/
    const powersTemp = roles.reduce((a, b) => [...a, ...b.powers], []);
    // 查询所有菜单信息
    const res3 = await this.props.authManage.getMenusById({
      id: powersTemp.map((item) => item.menuId)
    });
    if (!res3 || res3.status !== 200) {
      // 查询菜单信息失败
      return res3;
    }

    menus = res3.data;

    /** 4.获取权限信息 **/
    const res4 = await this.props.authManage.getPowerById({
      id: Array.from(
        new Set(powersTemp.reduce((a, b) => [...a, ...b.powers], []))
      )
    });
    if (!res4 || res4.status !== 200) {
      // 权限查询失败
      return res4;
    }
    powers = res4.data;

    return { status: 200, data: { userInfo, roles, menus, powers } };
  }


  // 记住密码按钮点击
  onRemember (e) {
    this.setState({
      rememberPassword: e.target.checked
    });
  }

  render () {
    console.log('render');
    console.log(this.props.root.language);
    return (
      <Form
        name="normal_login"
        className="login-form"
        initialValues={{ remember: true }}
        onFinish={this.onFinish}>
        <div>
          <FormItem name="username"
            rules={[{ max: 12, message: '最大长度为12位字符' },
              {
                required: true,
                whitespace: true,
                message: '请输入用户名'
              }]}
          >
            <Input
              size="large"
              id="username" // 为了获取焦点
              placeholder="admin/user"
              onPressEnter={() => this.onSubmit()}
            />
          </FormItem>
          <FormItem name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { max: 18, message: '最大长度18个字符' }
            ]}>
            <Input
              size="large"
              type="password"
              placeholder="123456/123456"
              onPressEnter={() => this.onSubmit()}
            />
          </FormItem>
          <FormItem>
            <Button
              className="submit-btn"
              size="large"
              type="primary"
              htmlType="submit"
              loading={this.state.loading}
            >
              {this.state.loading ? '请稍后' : '登录'}
            </Button>
          </FormItem>

        </div>
      </Form>
    );
  }
}

export default withRouter(LoginContainer);
