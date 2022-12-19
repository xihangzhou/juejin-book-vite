// Graph.ts
// 模块依赖图对象的实现
import { dirname, resolve } from "path";
export class Graph {
  entryPath: string;
  basedir: string;
  moduleById: Record<string, Module> = {};
  modules: Module[] = [];

  constructor(options: GraphOptions) {
    const { entry, bundle } = options;
    this.entryPath = resolve(entry);
    this.basedir = dirname(this.entryPath);
    this.bundle = bundle;
    this.moduleLoader = new ModuleLoader(bundle);
  }

  async build() {
    // 1. 获取并解析模块信息，返回入口模块对象
    const entryModule = await this.moduleLoader.fetchModule(
      this.entryPath,
      null,
      true
    );
    // 2. 构建依赖关系图
    // 3. 模块拓扑排序
    // 4. Tree Shaking, 标记需要包含的语句
  }

  getModuleById(id: string) {
    return this.moduleById[id];
  }

  addModule(module: Module) {
    if (!this.moduleById[module.id]) {
      this.moduleById[module.id] = module;
      this.modules.push(module);
    }
  }
}
