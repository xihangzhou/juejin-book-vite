// src/Statement.ts
// 以下为三个工具函数
// 是否为函数节点
function isFunctionDeclaration(node: Declaration): boolean {
    if (!node) return false;
    return (
      // function foo() {}
      node.type === 'FunctionDeclaration' ||
      // const foo = function() {}
      (node.type === NodeType.VariableDeclarator &&
        node.init &&
        node.init.type === NodeType.FunctionExpression) ||
      // export function ...
      // export default function
      ((node.type === NodeType.ExportNamedDeclaration ||
        node.type === NodeType.ExportDefaultDeclaration) &&
        !!node.declaration &&
        node.declaration.type === NodeType.FunctionDeclaration)
    );
  }
  
  // 是否为 export 声明节点
  export function isExportDeclaration(node: ExportDeclaration): boolean {
    return /^Export/.test(node.type);
  }
  
  // 是否为 import 声明节点
  export function isImportDeclaration(node: any) {
    return node.type === 'ImportDeclaration';
  }
  
  export class Statement {
    node: StatementNode;
    magicString: MagicString;
    module: Module;
    scope: Scope;
    start: number;
    next: number;
    isImportDeclaration: boolean;
    isExportDeclaration: boolean;
    isReexportDeclaration: boolean;
    isFunctionDeclaration: boolean;
    isIncluded: boolean = false;
    defines: Set<string> = new Set();
    modifies: Set<string> = new Set();
    dependsOn: Set<string> = new Set();
    references: Reference[] = [];
    constructor(node: StatementNode, magicString: MagicString, module: Module) {
      this.magicString = magicString;
      this.node = node;
      this.module = module;
      this.scope = new Scope({
        statement: this
      });
      this.start = node.start;
      this.next = 0;
      this.isImportDeclaration = isImportDeclaration(node);
      this.isExportDeclaration = isExportDeclaration(node as ExportDeclaration);
      this.isReexportDeclaration =
        this.isExportDeclaration &&
        !!(node as ExportAllDeclaration | ExportNamedDeclaration).source;
      this.isFunctionDeclaration = isFunctionDeclaration(
        node as FunctionDeclaration
      );
  
    }
  
    analyse() {
      if (this.isImportDeclaration) return;
      // 1、构建作用域链，记录 Declaration 节点表
      buildScope(this);
      // 2. 寻找引用的依赖节点，记录 Reference 节点表
      findReference(this);
    }
  }
  