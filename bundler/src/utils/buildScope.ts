import { walk } from 'utils/walk';
import { Scope } from 'ast/Scope';
import { Statement } from 'Statement';
import {
  NodeType,
  Node,
  VariableDeclaration,
  VariableDeclarator
} from 'ast-parser';
import { FunctionDeclaration } from 'ast-parser';

// 一个statement，即一个语句去建立这个语句中的作用域链，并且记录一下这个statement中的记录 Declaration 节点表
// 总结一下：这个函数传入了一个statement，将这个statement中的node节点的declaration收集到了statement中的scope中，其他所有子node中的declaration都收集在父节点的_scope属性中
// 并且子节点的_scope属性通过parent属性指向了父节点的_scope属性
export function buildScope(statement: Statement) {
  // 最开始的scope是这个statement声明语句的scope
  const { node, scope: initialScope } = statement;
  let scope = initialScope;
  walk(node, {
    enter(node: Node) {
      // function foo () {...}
      // 对于上面的这种函数式的声明语句statement，直接在这个statement中的初始scope中添加一个变量声明的declaration
      // 即声明这个函数的declatation挂在了statement的scope上，这也是为什么递归可以找得到这个变量的原因
      if (node.type === NodeType.FunctionDeclaration) {
        scope.addDeclaration(node, false);
      }
      // var let const
      // 对于let var这种变量声明语句，是把declarations中的declarator放入scrope中，因为有一个let定义多个变量的语法let tips,bar = []
      // 在let const的作用域中也能访问自身,所以你用let的形式写递归也可以
      if (node.type === NodeType.VariableDeclaration) {
        const currentNode = node as VariableDeclaration;
        const isBlockDeclaration = currentNode.kind !== 'var';
        currentNode.declarations.forEach((declarator: VariableDeclarator) => {
          scope.addDeclaration(declarator, isBlockDeclaration);
        });
      }

      let newScope;

      // function scope
      if (node.type === NodeType.FunctionDeclaration) {
        const currentNode = node as FunctionDeclaration;
        // 对于函数声明要新建一个作用域，这个作用域指向statmenment的作用域
        newScope = new Scope({
          parent: scope,
          block: false,
          paramNodes: currentNode.params,
          statement
        });
      }

      // new block state
      // 同样对于块级作用域也要新建一个作用域，这个作用域指向初始作用域
      if (node.type === NodeType.BlockStatement) {
        newScope = new Scope({
          parent: scope,
          block: true,
          statement
        });
      }

      // 把这个新的作用域绑定在节点的_scrope属性上
      if (newScope) {
        Object.defineProperty(node, '_scope', {
          value: newScope,
          configurable: true
        });

        // 当前的scope改为节点上的scope用于便利
        scope = newScope;
      }
    },
    leave(node: any) {
      // leave是先深度优先递归了子节点后返回，所以在leave后需要回到上一个父节点，scope这个变量一直指向的是当前node的scope
      // 当前 scope 即 node._scope
      if (node._scope && scope.parent) {
        scope = scope.parent;
      }
    }
  });
}
