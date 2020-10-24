/* 机柜map 用户在区域添加行列后生成机柜平面图 不含任何操作 仅用于展示 */

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import tools from '@src/util/tools';
import './index.less';

export default class RegionMap extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
  };
  constructor (props) {
    super(props);
  }
  render () {
    const search = tools.parseQueryString(location.href);
    const row = search.row || 0;
    const col = search.col || 0;
    const rows =  [];
    const cols =  [];
    for (let i = 0; i < row; i++) {
      rows.push('row' + i);
    }
    for (let i = 0; i < col; i++) {
      cols.push('cols' + i);
    }
    return (
      <div className="page-region-map">
        <table className="region-map">
          <tbody>
            {
              _.map(rows, (item, rowindex) => <tr key={item}>
                {_.map(cols, (item, colindex) => <td key={item}>
                  <div className="box">+</div>
                </td>)}
              </tr>)
            }
          </tbody>
        </table>
      </div>
    );
  }
}
