/* Footer 页面底部 */
import React from 'react';
import { Layout } from 'antd';
import './index.less';

const { Footer } = Layout;
export default class Com extends React.PureComponent {
  constructor (props) {
    super(props);
    this.state = {};
  }

  render () {
    return (
      <Footer className="footer">
        2020 北京钰锋科技有限公司丨京ICP备160100000
      </Footer>
    );
  }
}

Com.propTypes = {};
