let shouldSkip;
let shouldAbort: boolean;

export function walk(ast: any, { enter, leave }: { enter: any; leave: any }) {
  shouldAbort = false;
  visit(ast, null, enter, leave);
}

let context = {
  skip: () => (shouldSkip = true),
  abort: () => (shouldAbort = true)
};

let childKeys = {} as Record<string, string[]>;

let toString = Object.prototype.toString;

function isArray(thing: Object) {
  return toString.call(thing) === '[object Array]';
}

// 从一个节点出发，找到所有的能够遍历的节点进行便利
function visit(node: any, parent: any, enter: any, leave: any, prop?: string) {
  if (!node || shouldAbort) return;

  if (enter) {
    shouldSkip = false;
    enter.call(context, node, parent, prop);
    if (shouldSkip || shouldAbort) return;
  }

  // 获取所有的值不是基础值的属性
  let keys =
    childKeys[node.type] ||
    (childKeys[node.type] = Object.keys(node).filter(
      (key) => typeof node[key] === 'object'
    ));

  let key, value;

  for (let i = 0; i < keys.length; i++) {
    key = keys[i];
    value = node[key];

    // 如果是数组每个节点都要重新遍历
    if (isArray(value)) {
      for (let j = 0; j < value.length; j++) {
        visit(value[j], node, enter, leave, key);
      }
      // 如果是普通的对象节点直接便利
    } else if (value && value.type) {
      visit(value, node, enter, leave, key);
    }
  }

  if (leave && !shouldAbort) {
    leave(node, parent, prop);
  }
}
