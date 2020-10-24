# 是什么

# 解决什么问题
从问题说起：熟悉 React 组件生命周期的话都知道：调用 setState 方法总是会触发 render 方法从而进行 vdom re-render 相关逻辑，哪怕实际上你没有更改到 Component.state

this.state = {count: 0}
this.setState({count: 0});// 组件 state 并未被改变，但仍会触发 render 方法
为了避免这种性能上的浪费， React 提供了一个 shouldComponentUpdate 来控制触发 vdom re-render 逻辑的条件。于是 PureRenderMixin 作为一种优化技巧被使用。它仅仅是浅比较对象，深层次的数据结构根本不管用

它是一个完全独立的库，无论基于什么框架都可以用它。意义在于它弥补了 Javascript 没有不可变数据结构的问题
由于是不可变的，可以放心的对对象进行任意操作。在 React 开发中，频繁操作state对象或是 store ，配合 immutableJS 快、安全、方便
熟悉 React.js 的都应该知道， React.js 是一个 UI = f(states) 的框架，为了解决更新的问题， React.js 使用了 virtual dom ， virtual dom 通过 diff 修改 dom ，来实现高效的 dom 更新。
但是有一个问题。当 state 更新时，如果数据没变，你也会去做 virtual dom 的 diff ，这就产生了浪费。这种情况其实很常见
当然你可能会说，你可以使用 PureRenderMixin 来解决呀， PureRenderMixin 是个好东西，我们可以用它来解决一部分的上述问题
但 PureRenderMixin 只是简单的浅比较，不使用于多层比较。那怎么办？自己去做复杂比较的话，性能又会非常差
方案就是使用 immutable.js 可以解决这个问题。因为每一次 state 更新只要有数据改变，那么 PureRenderMixin 可以立刻判断出数据改变，可以大大提升性能

# 原理+
Immutable Data 就是一旦创建，就不能再被更改的数据。对 Immutable 对象的任何修改或添加删除操作都会返回一个新的 Immutable 对象
Immutable 实现的原理是 Persistent Data Structure （持久化数据结构），也就是使用旧数据创建新数据时，要保证旧数据同时可用且不变
同时为了避免 deepCopy 把所有节点都复制一遍带来的性能损耗， Immutable 使用了 Structural Sharing···· （结构共享），即如果对象树中一个节点发生变化，只修改这个节点和受它影响的父节点，其它节点则进行共享。


# 如何使用
