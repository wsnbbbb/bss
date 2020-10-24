/* eslint-disable react/display-name */
import React, {Component} from 'react';
// import EnhancerWaterMark from 'watermark-enhancer';
// import {watermark} from '@src/util/watermark'; // 水印
const Watermark = () => (WrappedComponent) => class extends Component {
  componentDidMount () {
    // watermark({watermark_txt: 'yangsumin'});
  }
  render () {
    return (
      <WrappedComponent></WrappedComponent>
    );
  }
};

export default Watermark;
