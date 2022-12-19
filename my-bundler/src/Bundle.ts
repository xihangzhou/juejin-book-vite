// Bundle.ts
export class Bundle {
    graph: Graph;
    constructor(options: BundleOptions) {
      // 初始化模块依赖图对象
      this.graph = new Graph({
        entry: options.entry,
        bundle: this
      });
    }
  
    async build() {
      // 模块打包逻辑，完成所有的 AST 相关操作
      return this.graph.build();
    }
    
    render() {
      // 代码生成逻辑，拼接模块 AST 节点，产出代码
    }
    
    getModuleById(id: string) {
      return this.graph.getModuleById(id);
    }
  
    addModule(module: Module) {
      return this.graph.addModule(module);
    }
  }
  
  