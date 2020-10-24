
// 自动关闭的反馈提示
export const auto_close_result = (state, title, message) => {
  let secondsToGo = 30;
  let modal;
  if (state == 'ok') {
    modal = Modal.success({
      title: title,
      content: message,
    });
  } else {
    modal = Modal.error({
      title: title,
      content: message,
    });

  }
  const timer = setInterval(() => {
    secondsToGo -= 1;
    modal.update({
      content: message,
    });
  }, 1000);
  setTimeout(() => {
    clearInterval(timer);
    modal.destroy();
  }, secondsToGo * 1000);
};
// 需要确认的反馈提示
export const confirm_result = (state, title, message) => {
  if (state == 'ok') {
    const modal = Modal.success({
      title: title,
      content: message,
    });
  } else {
    const modal = Modal.error({
      title: title,
      content: message,
    });
  }
};

// 判断接口返回状态成功为true 不成功为false
export function hasStatueOk (res) {
  if (res.code === 20000) {
    return true;
  } else {
    return false;
  }
}

//
export function inject_unount (target) {
  // 改装componentWillUnmount，销毁的时候记录一下
  let next = target.prototype.componentWillUnmount;
  target.prototype.componentWillUnmount = function () {
    if (next) {next.call(this, ...arguments);}
    this.unmount = true;
  };
  // 对setState的改装，setState查看目前是否已经销毁
  let setState = target.prototype.setState;
  target.prototype.setState = function () {
    if (this.unmount) {return;}
    setState.call(this, ...arguments);
  };
}
