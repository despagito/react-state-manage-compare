import React, { useContext, useReducer, useEffect, useState } from "react";
import ReactDOM from "react-dom";

/**
 * 主体逻辑:
 * 1. 先分别创建 store, reducer, side effect
 * 2. 然后创建组件
 * 3. 最后把以上所有的东西, 在 <App/> 中组合.
 */

const Store = React.createContext({
  todos: [
    // Initial Data
    "Buy milk",
    "Some eggs",
    "Go to work"
  ]
});

function reducer(state, action) {
  switch (action.type) {
    case "ADD_TODO":
      // TODO: payload empty, duplicate todo
      return {
        ...state, // 其他不受影响的state
        todos: [...state.todos, action.payload]
      };
    case "COMPLETE":
      return {
        ...state,
        todos: state.todos.filter(t => t !== action.payload)
      };
    default:
      return state;
  }
}

// 持久化的 side effect. 这部分代码只是为了展示 useEffect
// 好处是, 刷新浏览器之后, 效果保持一致, 相当于有了一个数据库
function usePersistedContext(context, key = "state") {
  const persistedContext = localStorage.getItem(key);
  // 如果 localStorage 没有内容的话, 才用 context
  return persistedContext ? JSON.parse(persistedContext) : context;
}

function usePersistedReducer([state, dispatch], key = "state") {
  // 副作用在这里
  useEffect(() => localStorage.setItem(key, JSON.stringify(state)), [state]);
  return [state, dispatch];
}

// 组件
function TodoForm() {
  // context 的 dispatch 就直接绑定好了的, 不用像 redux 那样 connect
  const { dispatch } = useContext(Store);

  // 当前输入的 todo
  const [todo, setTodo] = useState("");

  function handleTodoChange(e) {
    setTodo(e.target.value);
  }

  // 发射一个 action 到 store.
  function handleTodoAdd() {
    dispatch({ type: "ADD_TODO", payload: todo });
    setTodo("");
  }

  // 检测是否按了 Enter
  function handleSubmitForm(event) {
    if (event.keyCode === 13) handleTodoAdd();
  }

  return (
    <div className="row">
      <input
        value={todo}
        onKeyUp={handleSubmitForm}
        onChange={handleTodoChange}
      />
    </div>
  );
}

function TodoList() {
  // 不管是 读state, 还是dispatch写入, 都可以直接从 context 读取.
  const { state, dispatch } = useContext(Store);

  return (
    <div>
      <ul>
        {state.todos.map(todoitem => (
          <li key={todoitem}>
            {todoitem}
            <button
              onClick={() => dispatch({ type: "COMPLETE", payload: todoitem })}
            >
              Complete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// step 最终把 状态管理 和 组件 综合起来
function App() {
  // create a global store to store the state
  const globalStore = usePersistedContext(useContext(Store), "state");

  // `todos` will be a state manager to manage state.
  const [state, dispatch] = usePersistedReducer(
    useReducer(reducer, globalStore), // [Doc] useReducer(reducer, initialArg, init)
    "state" // The localStorage key
  );

  return (
    // State.Provider passes the state and dispatcher to the down
    <Store.Provider value={{ state, dispatch }}>
      <TodoForm />
      <TodoList />
    </Store.Provider>
  );
}

// 这个 document 是如何读到的呢?
const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);

/**
 * 本JS文件如何读取到 html 的 document 的
 * 为什么修改 package.json main 不起作用
 * 很明显 package.json 可以指定入口, 那 webpack entry 是干嘛的?
 */
