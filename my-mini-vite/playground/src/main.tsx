import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
// 如果服务器没有加上处理css的逻辑直接请求会报错，因为这个请求失败了过后会阻塞之后的其他请求
import "./index.css";

ReactDOM.render(<App />, document.getElementById("root"));
