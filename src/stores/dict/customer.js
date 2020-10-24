import { observable, action, computed, runInAction, flow } from 'mobx';
import { message } from 'antd';
import tools from '@src/util/tools';
import _ from 'lodash';
import { ApiService as Fetchapi } from '@src/util/fetch-api'; // 自己写的工具函数，封装了请求数据的通用接口
class Customer {
    @observable customersource = {}; // 客户来源
    @observable customerindustry = {}; // 客户行业
    @observable userlist = {}; // 员工列表
    @observable agencyLevel = {}; // 代理等级
    @observable saleslist = {}; // 销售人员
    @observable saleSupportlist = {}; // 销售支持人员
    @observable payCompany = {}; // 支付主体



    @action setCustomerSource = (list) => {
      // console.log(list);
      // let lists = {};
      // _.map(list, (item) => {
      //   lists[item.keyValues] = item.keyNames;
      // });
      this.customersource = list;
    }
    @action setCustomerIndustry = (list) => {
      // console.log(list);
      // let lists = {};
      // _.map(list, (item) => {
      //   lists[item.keyValues] = item.keyNames;
      // });
      this.customerindustry = list;
    }
    @action setUserList = (list) => {
      let obj = {};
      _.map(list, (item) => {
        obj[item.id] = item.name;
      });
      console.log(obj);
      this.userlist = obj;
    }
    @action setagencyLevel = (list) => {
      let lists = {};
      _.map(list, (item) => {
        lists[item.id] = item.agencyLevel;
      });
      console.log(lists);
      this.agencyLevel = lists;
    }
    @action setsalePersonnel = (list) => {
      let obj = {};
      _.map(list, (item) => {
        obj[item.id] = item.salesName;
      });
      console.log(obj);
      this.saleslist = obj;
    }
    @action setsaleSupport = (list) => {
      let obj = {};
      _.map(list, (item) => {
        obj[item.id] = item.salesName;
      });
      console.log(obj);
      this.saleSupportlist = obj;
    }
    @action setpayCompany = (list) => {
      let obj = {};
      _.map(list, (item) => {
        obj[item.id] = item.name;
      });
      console.log(obj);
      this.payCompany = obj;
    }

    /**
     * 获取客户来源
     */

    fetchCustomerSource = flow(
      function * () {
        try {
          const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/userdict`, { keyType: 'customer_from' });
          const data = response.data.data;
          this.setCustomerSource(data);
        } catch (error) {
          console.log(error);
        }
      }.bind(this)
    );

    /**
   * 获取客户行业
   */

    fetchCustomerIndustry = flow(
      function * () {
        try {
          const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/userdict`, { keyType: 'customer_industry' });
          const data = response.data.data;
          this.setCustomerIndustry(data);
        } catch (error) {
          console.log(error);
        }
      }.bind(this)
    );

    /**
   * 获取员工列表
   */

  fetchUserList = flow(
    function * () {
      try {
        // const response = yield Fetchapi.newFetchGet(`http://10.3.9.29:8080/api/user/manage/list`);
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/manage/list`);
        const data = response.data.data;
        console.log(data);
        this.setUserList(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

  /**
   * 获取代理等级
   */

  fetchagencyLevel = flow(
    function * () {
      try {
        // const response = yield Fetchapi.newFetchGet(`http://10.3.9.29:8080/api/customer/agencyLevel/list`);
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/customer/agencyLevel/list`);
        const data = response.data.data;
        console.log(data);
        this.setagencyLevel(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

  /**
   * 获取销售人员列表
   */

  fetchsalePersonnel = flow(
    function * () {
      try {
        // const response = yield Fetchapi.newFetchGet(`http://10.3.9.29:8080/api/customer/salePersonnel/list`);
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/customer/salePersonnel/list`);
        const data = response.data.data;
        console.log(data);
        this.setsalePersonnel(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

  /**
   * 获取销售支持列表
   */

  fetchsaleSupport = flow(
    function * () {
      try {
        // const response = yield Fetchapi.newFetchGet(`http://10.3.9.29:8080/api/customer/salePersonnel/list2`);
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/customer/salePersonnel/list2`);
        const data = response.data.data;
        console.log(data);
        this.setsaleSupport(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

  /**
   * 获取支付主体
   */

  fetchpayCompany = flow(
    function * () {
      try {
        // const response = yield Fetchapi.newFetchGet(`http://10.3.9.29:8080/api/customer/salePersonnel/list2`);
        const response = yield Fetchapi.newFetchGet(`https://ikpay-api.ikgop.com/api/v1/company/`);
        console.log(response)
        const data = response.data.data;
        console.log(data);
        this.setpayCompany(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );
}

const customer = new Customer();
export default customer;
