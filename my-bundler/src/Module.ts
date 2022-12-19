// src/Module.ts
export class Module {
  isEntry: boolean = false;
  id: string;
  path: string;
  bundle: Bundle;
  moduleLoader: ModuleLoader;
  code: string;
  magicString: MagicString;
  statements: Statement[];
  imports: Imports;
  exports: Exports;
  reexports: Exports;
  exportAllSources: string[] = [];
  exportAllModules: Module[] = [];
  dependencies: string[] = [];
  dependencyModules: Module[] = [];
  referencedModules: Module[] = [];
  constructor({ path, bundle, code, loader, isEntry = false }: ModuleOptions) {
    this.id = path;
    this.bundle = bundle;
    this.moduleLoader = loader;
    this.isEntry = isEntry;
    this.path = path;
    this.code = code;
    this.magicString = new MagicString(code);
    this.imports = {};
    this.exports = {};
    this.reexports = {};
    this.declarations = {};
    try {
      const ast = parse(code) as any;
      const nodes = ast.body as StatementNode[];
      // 以语句(Statement)的维度来拆分 Module，保存 statement 的集合，供之后分析
      this.statements = nodes.map((node) => {
        const magicString = this.magicString.snip(node.start, node.end);
        // Statement 对象将在后文中介绍具体实现
        return new Statement(node, magicString, this);
      });
    } catch (e) {
      console.log(e);
      throw e;
    }
    // 分析 AST 节点
    this.analyseAST();
  }
  analyseAST() {
    // 以语句为最小单元来分析
    this.statements.forEach((statement) => {
      // 对 statement 进行分析
      statement.analyse();
      // 注册顶层声明
      if (!statement.scope.parent) {
        statement.scope.eachDeclaration((name, declaration) => {
          this.declarations[name] = declaration;
        });
      }
    });
    // 注册 statement 的 next 属性，用于生成代码使用，next 即下一个 statement 的起始位置
    const statements = this.statements;
    let next = this.code.length;
    for (let i = statements.length - 1; i >= 0; i--) {
      statements[i].next = next;
      next = statements[i].start;
    }
  }
}
