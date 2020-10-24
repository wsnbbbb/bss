// 这里引入的是 mobx
import {observable, computed, action} from 'mobx';

class LayoutSotre {
    @observable pageTabList;

}

const layoutSotre = new LayoutSotre();
export default layoutSotre;
