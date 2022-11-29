import type { Token } from "./Tokenizer";
import { TokenType } from "./Tokenizer";

export enum NodeType {
  Program = "Program",
  VariableDeclaration = "VariableDeclaration",
  VariableDeclarator = "VariableDeclarator",
  Identifier = "Identifier",
  FunctionExpression = "FunctionExpression",
  BlockStatement = "BlockStatement",
}

export interface Identifier extends Node {
  type: NodeType.Identifier;
  name: string;
}

interface Expression extends Node {}

interface Statement extends Node {}

export interface Program extends Node {
  type: NodeType.Program;
  body: Statement[];
}

export interface VariableDeclarator extends Node {
  type: NodeType.VariableDeclarator;
  id: Identifier;
  init: Expression;
}

export interface VariableDeclaration extends Node {
  type: NodeType.VariableDeclaration;
  kind: "var" | "let" | "const";
  declarations: VariableDeclarator[];
}

export interface FunctionExpression extends Node {
  type: NodeType.FunctionExpression;
  id: Identifier | null;
  params: Expression[] | Identifier[];
  body: BlockStatement;
}

export interface BlockStatement extends Node {
  type: NodeType.BlockStatement;
  body: Statement[];
}

export type VariableKind = "let";

export class Parser {
  private _tokens: Token[] = [];
  private _currentIndex = 0;
  constructor(token: Token[]) {
    this._tokens = [...token];
  }

  parse(): Program {
    const program = this._parseProgram();
    return program;
  }

  private _parseProgram(): Program {
    const program: Program = {
      type: NodeType.Program,
      body: [],
      start: 0,
      end: Infinity,
    };
    // 解析 token 数组
    while (!this._isEnd()) {
      const node = this._parseStatement();
      program.body.push(node);
      if (this._isEnd()) {
        program.end = node.end;
      }
    }
    return program;
  }

  private _parseStatement(): Statement {
    // TokenType 来自 Tokenizer 的实现中
    if (this._checkCurrentTokenType(TokenType.Let)) {
      return this._parseVariableDeclaration();
    }
    throw new Error("Unexpected token");
  }

  // 解析变量声明语句
  private _parseVariableDeclaration(): VariableDeclaration {
    // 获取语句开始位置
    const { start } = this._getCurrentToken();
    // 拿到 let
    const kind = this._getCurrentToken().value;
    this._goNext(TokenType.Let);
    // 解析变量名 foo
    const id = this._parseIdentifier();
    // 解析函数表达式
    const init = this._parseFunctionExpression();
    const declarator: VariableDeclarator = {
      type: NodeType.VariableDeclarator,
      id,
      init,
      start: id.start,
      end: init ? init.end : id.end,
    };
    // 构造 Declaration 节点
    const node: VariableDeclaration = {
      type: NodeType.VariableDeclaration,
      kind: kind as VariableKind,
      declarations: [declarator],
      start,
      end: this._getPreviousToken().end,
    };
    return node;
  }

  // 1. 解析变量名
  private _parseIdentifier(): Identifier {
    const token = this._getCurrentToken();
    const identifier: Identifier = {
      type: NodeType.Identifier,
      name: token.value!,
      start: token.start,
      end: token.end,
    };
    this._goNext(TokenType.Identifier);
    return identifier;
  }

  // 2. 解析函数表达式
  private _parseFunctionExpression(): FunctionExpression {
    const { start } = this._getCurrentToken();
    this._goNext(TokenType.Function);
    let id = null;
    if (this._checkCurrentTokenType(TokenType.Identifier)) {
      id = this._parseIdentifier();
    }
    const node: FunctionExpression = {
      type: NodeType.FunctionExpression,
      id,
      params: [],
      body: {
        type: NodeType.BlockStatement,
        body: [],
        start: start,
        end: Infinity,
      },
      start,
      end: 0,
    };
    return node;
  }

  // 用于解析函数参数
  private _parseParams(): Identifier[] | Expression[] {
    // 消费 "("
    this._goNext(TokenType.LeftParen);
    const params = [];
    // 逐个解析括号中的参数
    while (!this._checkCurrentTokenType(TokenType.RightParen)) {
      let param = this._parseIdentifier();
      params.push(param);
    }
    // 消费 ")"
    this._goNext(TokenType.RightParen);
    return params;
  }

  // 用于解析函数体
  private _parseBlockStatement(): BlockStatement {
    const { start } = this._getCurrentToken();
    const blockStatement: BlockStatement = {
      type: NodeType.BlockStatement,
      body: [],
      start,
      end: Infinity,
    };
    // 消费 "{"
    this._goNext(TokenType.LeftCurly);
    while (!this._checkCurrentTokenType(TokenType.RightCurly)) {
      // 递归调用 _parseStatement 解析函数体中的语句(Statement)
      const node = this._parseStatement();
      blockStatement.body.push(node);
    }
    blockStatement.end = this._getCurrentToken().end;
    // 消费 "}"
    this._goNext(TokenType.RightCurly);
    return blockStatement;
  }

  // token 是否已经扫描完
  private _isEnd(): boolean {
    return this._currentIndex >= this._tokens.length;
  }

  // 工具方法，表示消费当前 Token，扫描位置移动到下一个 token
  private _goNext(type: TokenType | TokenType[]): Token {
    const currentToken = this._tokens[this._currentIndex];
    // 断言当前 Token 的类型，如果不能匹配，则抛出错误
    if (Array.isArray(type)) {
      if (!type.includes(currentToken.type)) {
        // throw new Error(
        //   `Expect ${type.join(",")}, but got ${currentToken.type}`
        // );
      }
    } else {
      if (currentToken.type !== type) {
        // throw new Error(`Expect ${type}, but got ${currentToken.type}`);
      }
    }
    this._currentIndex++;
    return currentToken;
  }

  private _checkCurrentTokenType(type: TokenType | TokenType[]): boolean {
    if (this._isEnd()) {
      return false;
    }
    const currentToken = this._tokens[this._currentIndex];
    if (Array.isArray(type)) {
      return type.includes(currentToken.type);
    } else {
      return currentToken.type === type;
    }
  }

  private _getCurrentToken(): Token {
    return this._tokens[this._currentIndex];
  }

  private _getPreviousToken(): Token {
    return this._tokens[this._currentIndex - 1];
  }
}
