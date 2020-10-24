import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {Tooltip,Button,Table,Pagination} from 'antd'
export default class List extends Component {
    static propTypes = {
        prop: PropTypes.func,
    }
    constructor(props){
        super(props);
        this.state ={
          lists: [],
          loading: false,
          pageNum: 1, // 当前第几页
          page_size: 20, // 每页多少条
          total: 0, // 数据库总共多少条数据
          pages: 0,
        }
    }
    componentDidMount(){
        
    }
    makeColumns () {
        const columns = [
          {
            title: "事务",
            dataIndex: "name",
            key: "name",
          },
          {
            title: "类型",
            dataIndex: "categoryName",
            key: "categoryName",
          },
          {
            title: "复杂度",
            dataIndex: "areaName",
            key: "areaName",
          },
          {
            title: "优先级",
            dataIndex: "areaName",
            key: "areaName",
          },
          {
            title: "处理模式",
            dataIndex: "areaName",
            key: "areaName",
          },
          {
            title: "工作流",
            dataIndex: "price",
            key: "price",
          },
          {
            title: "适用范围",
            dataIndex: "operatingCosts",
            key: "operatingCosts",
          },
          {
            title: "超时自动派单",
            dataIndex: "grossProfit",
            key: "grossProfit",
          },
          {
            title: "最大处理时间",
            dataIndex: "operatingCosts2",
            key: "operatingCosts2",
          },
          {
            title: "属性",
            dataIndex: "grossProfit2",
            key: "grossProfit2",
          },
          {
            title: "操作",
            key: "control",
            fixed: "right",
            width: 500,
            render: (text, record) => {
            const controls = [];
            controls.push(
                  <Button
                    key="0"
                    size="small"
                    className="actions-btn"
                    style={{marginRight: '8px'}}
                  >
                  调整工作流
                  </Button>
              );
              controls.push(
                  <Button
                    key="1"
                    size="small"
                    className="actions-btn"
                    style={{marginRight: '8px'}}
                  >
                   调整适用范围
                  </Button>
              );
              controls.push(
                  <Button
                    key="2"
                    size="small"
                    className="actions-btn"
                    style={{marginRight: '8px'}}
                  >
                   启用
                  </Button>
              );
              controls.push(
                  <Button
                    key="4"
                    size="small"
                    className="actions-btn"
                    style={{marginRight: '8px'}}
                  >
                   删除
                  </Button>
              );
              const result = [];
              controls.forEach((item, index) => {
                if (index) {
                  result.push(<Divider key={`line${index}`} type="vertical" />);
                }
                result.push(item);
              });
              return controls;
            },
          },
        ];
        return columns;
      }
    Add = ()=>{

    }
    showTotal = (total) => `一共${total}条数据`;
    onPageChange (page, pageSize) {
       this.onGetListData({ page: page, pageSize: pageSize });
    }
    onPageSizeChange (page, pageSize) {
        this.onGetListData({ page: page, pageSize: pageSize });
      }    
    render() {
        const {
            loading,
            lists,
            pageNum,
            page_size,
            total,
          } = this.state;
        let {categoryId} = this.props;
        console.log(categoryId);
        return (
            <main className='main'>
          <div className="g-operate">
          <Tooltip title='点击新增事务' placement='top'>
          <Button className="actions-btn" size="middle" onClick={() => { this.Add(); }}>新增</Button>
          </Tooltip>
           </div>
           <div className="g-table" >
          <Table
            columns={this.makeColumns()}
            rowKey={(record) => record.id}
            loading={loading}
            dataSource={lists}
            pagination={false}
            size="small"
          />
        </div>
        <div className="pagination">
          <Pagination
            className="g-pagination"
            size="middle"
            current={pageNum}
            total={total}
            showSizeChanger
            showQuickJumper
            showTotal={this.showTotal}
            defaultPageSize={page_size}
            onChange={(current, pageSize) => {
              this.onPageChange(current, pageSize);
            }}
            onShowSizeChange={(current, size) => {
              this.onPageSizeChange(current, size);
            }}
          />
        </div>
        </main>
        )
    }
}
