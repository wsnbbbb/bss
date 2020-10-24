import { observable, action, computed, runInAction, flow} from 'mobx';
import { message } from 'antd';
import tools from '@src/util/tools';
import _ from 'lodash';
import {ApiService as Fetchapi} from '@src/util/fetch-api'; // 自己写的工具函数，封装了请求数据的通用接口
class ServerPart {
  @observable mem_verify ={};// 内存校验
  @observable memory_type = {};// 内存类型
  @observable mem_spec = {};// 内存规格
  @observable cms_del_flag = {};// 内容状态
  @observable releaseStatus = {};// 发布状态
  @observable source = {};// 来源
  @observable mem_brand = {};// 内存品牌
  @observable show_type = {};// 显示类型
  @observable sale_status ={};// 销售状态
  @observable disk_type ={};// 硬盘类型
  @observable interfaceType ={};// 硬盘接口类型
  @observable useType  ={};// 硬盘用途
  @observable disk_brand ={}// 硬盘品牌
  @observable cpu_band = {}// cpu品牌
  @observable resource_attribution = {};// 资源归属
  @observable disk_short ={};// 硬盘简称
  @observable cpu_interface_type = {};// cpu接口类型
  @observable raid_type = {};// raid卡类型
  @observable showMode = {};// 服务器显示类型
  @observable server_disk_spec ={};// 硬盘规格
  @action setMv = (list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.mem_verify = obj;
  }
  @action setMt = (list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.memory_type = obj;

  }
  @action setMs = (list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.mem_spec = obj;
  }
  @action setCdf = (list) => {
    this.cms_del_flag = _.assign({}, list);
  }
  @action setRs = (list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.releaseStatus =  obj;

  }
  @action setSc=(list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.source =  obj;
  }
  @action setMb=(list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.mem_brand =  obj;
  }
  @action setRab=(list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.resource_attribution =  obj;
  }
  @action setRt=(list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.show_type =  obj;
  }
  @action setSt=(list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.sale_status =  obj;
  }
  @action setDt=(list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.disk_type =  obj;
  }
  @action setIc=(list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.interfaceType =  obj;
  }
  @action setUt=(list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.useType =  obj;
  }
  @action setDb=(list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.disk_brand =  obj;
  }
  @action setCb=(list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.cpu_band =  obj;
  }
  @action setCIt=(list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.cpu_interface_type =  obj;
  }
  @action setDs=(list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.disk_short =  obj;
  }
  @action setRaidtype=(list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.raid_type =  obj;
  }
  @action setShowmode=(list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.showMode =  obj;
  }
  @action setServerDiskSpec=(list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.server_disk_spec =  obj;
  }

  /**
   * 获取cpu品牌
   */
  fetchCb = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, {keyType: 'cpu_brand'});
        const data = response.data.data;
        this.setCb(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

  /**
   * 硬盘简称
   */
  fetchDs = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, {keyType: 'disk_short'});
        const data = response.data.data;
        this.setDs(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

  /**
   * 获取端口类型
   */

  fetchPtp = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, {keyType: 'port_type'});
        const data = response.data.data;
        this.setPtp(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

  /**
   * 获取硬盘用途
   */

  fetchUt = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, {keyType: 'use_type'});
        const data = response.data.data;
        this.setUt(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

  /**
   * 获取内存类型
   */

  fetchMt = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, {keyType: 'memory_type'});
        const data = response.data.data;
        this.setMt(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

  /**
   * 获取发布状态
   */
  fetchRs = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, {keyType: 'releaseStatus'});
        const data = response.data.data;
        this.setRs(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

  /**
   * 获取来源
   */
  fetchSc = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, {keyType: 'source'});
        const data = response.data.data;
        this.setSc(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

  /**
   * 获取内存校验
   */
  fetchMv = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, {keyType: 'mem_verify'});
        const data = response.data.data;
        this.setMv(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

  /**
   * 获取内存规格
   */
  fetchMs = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, {keyType: 'mem_spec'});
        const data = response.data.data;
        this.setMs(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

  /** 获取内存品牌 */
  fetchMb = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, {keyType: 'mem_brand'});
        const data = response.data.data;
        this.setMb(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

   /** 获取资源归属 */
   fetchRab = flow(
     function * () {
       try {
         const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, {keyType: 'resource_attribution'});
         const data = response.data.data;
         this.setRab(data);
       } catch (error) {
         console.log(error);
       }
     }.bind(this)
   );

   /** 显示类型 */
   fetchRt = flow(
     function * () {
       try {
         const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, {keyType: 'show_type'});
         const data = response.data.data;
         this.setRt(data);
       } catch (error) {
         console.log(error);
       }
     }.bind(this)
   );

  /** 资源状态 */
  fetchSt = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, {keyType: 'parts_res_status'});
        const data = response.data.data;
        this.setSt(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

  /** 硬盘类型 */
  fetchDt = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, {keyType: 'yingpan_type'});
        const data = response.data.data;
        this.setDt(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

   /** 硬盘接口类型 */
   fetchIct = flow(
     function * () {
       try {
         const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, {keyType: 'disk_interface_type'});
         const data = response.data.data;
         this.setIc(data);
       } catch (error) {
         console.log(error);
       }
     }.bind(this)
   );

  /** 硬盘品牌 */
  fetchDb = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, {keyType: 'disk_brand'});
        const data = response.data.data;
        this.setDb(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );
  // cpu接口类型
 fetchCIt = flow(
   function * () {
     try {
       const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, {keyType: 'cpu_interface_type'});
       const data = response.data.data;
       this.setCIt(data);
     } catch (error) {
       console.log(error);
     }
   }.bind(this)
 );
fetchRaidType = flow(
  function * () {
    try {
      const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, {keyType: 'raid_type'});
      const data = response.data.data;
      this.setRaidtype(data);
    } catch (error) {
      console.log(error);
    }
  }.bind(this)
);
fetchShowmode = flow(
  function * () {
    try {
      const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, {keyType: 'showMode'});
      const data = response.data.data;
      this.setShowmode(data);
    } catch (error) {
      console.log(error);
    }
  }.bind(this)
);
// 硬盘规格
fetchServerDiskSpec = flow(
  function * () {
    try {
      const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, {keyType: 'server_disk_spec'});
      const data = response.data.data;
      this.setServerDiskSpec(data);
    } catch (error) {
      console.log(error);
    }
  }.bind(this)
);
}

const serverPart = new ServerPart();
export default serverPart;
