/* @flow */

import type VNode from 'core/vdom/vnode'

/**
 * Runtime helper for resolving raw children VNodes into a slot object.
 * 主要作用是将children VNodes转化成一个slots对象.
 */
export function resolveSlots (
  children: ?Array<VNode>,
  context: ?Component
): { [key: string]: Array<VNode> } {
  const slots = {}
  // 判断是否有children，即是否有插槽VNode
  if (!children) {
    return slots
  }
  // 遍历父组件节点的孩子节点
  for (let i = 0, l = children.length; i < l; i++) {
    const child = children[i]
    // data为VNodeData，保存父组件传递到子组件的props以及attrs等
    const data = child.data
    // remove slot attribute if the node is resolved as a Vue slot node
    /* 移除slot属性
    * <span slot="abc"></span>
    * 编译成span的VNode节点data = {attrs:{slot: "abc"}, slot: "abc"},所以这里删除该节点attrs的slot
    */
    if (data && data.attrs && data.attrs.slot) {
      delete data.attrs.slot
    }
    /* 判断是否为具名插槽，如果为具名插槽，还需要子组件/函数子组件渲染上下文一致。主要作用：
     *当需要向子组件的子组件传递具名插槽时，不会保持插槽的名字。
     * 举个栗子：
     * child组件template:
     * <div>
     * <div class="default"><slot></slot></div>
     * <div class="named"><slot name="foo"></slot></div>
     * </div>
     * parent组件template:
     * <child><slot name="foo"></slot></child>
     * main组件template:
     * <parent><span slot="foo">foo</span></parent>
     * 此时main渲染的结果：
     * <div>
     * <div class="default"><span slot="foo">foo</span></div>
       <div class="named"></div>
     * </div>
     */
    // named slots should only be respected if the vnode was rendered in the
    // same context.
    if ((child.context === context || child.fnContext === context) &&
      data && data.slot != null
    ) {
      const name = data.slot
      const slot = (slots[name] || (slots[name] = []))
      // 这里处理父组件采用template形式的插槽
      if (child.tag === 'template') {

        slot.push.apply(slot, child.children || [])
      } else {
        slot.push(child)
      }
    } else {
      // 返回匿名default插槽VNode数组
      (slots.default || (slots.default = [])).push(child)
    }
  }
  // ignore slots that contains only whitespace
  // 忽略仅仅包含whitespace的插槽
  for (const name in slots) {
    if (slots[name].every(isWhitespace)) {
      delete slots[name]
    }
  }
  return slots
}

function isWhitespace (node: VNode): boolean {
  return (node.isComment && !node.asyncFactory) || node.text === ' '
}

export function resolveScopedSlots (
  fns: ScopedSlotsData, // see flow/vnode
  res?: Object
): { [key: string]: Function } {
  res = res || {}
  for (let i = 0; i < fns.length; i++) {
    if (Array.isArray(fns[i])) {
      resolveScopedSlots(fns[i], res)
    } else {
      res[fns[i].key] = fns[i].fn
    }
  }
  return res
}
