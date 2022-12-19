import { Statement } from 'Statement';
import { walk } from 'utils/walk';
import { Reference } from 'ast/Reference';

// 使用变量的节点只有两种：Identifier和MemberExpression
// 所以我们只要针对这两种节点不是引用变量的情况排除掉，其他情况都是引用了父级作用域中的变量了
function isReference(node: any, parent: any): boolean {
  if (node.type === 'MemberExpression' && parent.type !== 'MemberExpression') {
    return true;
  }
  if (node.type === 'Identifier') {
    // export { foo as bar }
    if (parent.type === 'ExportSpecifier' && node !== parent.local)
      return false;
    return true;
  }
  return false;
}

// 在已经建立一个statement中的节点的作用域关系后，我们首先来找到哪些节点中是有使用父节点中的变量的，这里只是先找到这些节点，并不是要构建出这些节点和被引用作用域之间的关系
export function findReference(statement: Statement) {
  const { references, scope: initialScope, node } = statement;
  let scope = initialScope;
  walk(node, {
    enter(node: any, parent: any) {
      if (node._scope) scope = node._scope;
      if (isReference(node, parent)) {
        const reference = new Reference(node, scope, statement);
        references.push(reference);
      }
    },
    leave(node: any) {
      if (node._scope && scope.parent) {
        scope = scope.parent;
      }
    }
  });
}
