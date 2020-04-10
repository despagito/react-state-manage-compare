import * as React from "react";
import * as ReactDOM from "react-dom";
import { createStore } from "redux";
import { Provider, connect } from "react-redux";

// types
interface Task {
  id: number;
  description: string;
}

// actions
const ADD_TASK = "tasks:addTask";
const DELETE_TASK = "tasks:deleteTask";
function addTask(newTask: Task) {
  return {
    type: ADD_TASK,
    payload: {
      task: newTask
    }
  };
}

function deleteTask(id: number) {
  return {
    type: DELETE_TASK,
    payload: {
      id
    }
  };
}

// reducer
const tasksReducer = (state: Task[] = [], action: any) => {
  let newState: Task[] = [];
  console.log("===", state);
  switch (action.type) {
    case ADD_TASK:
      newState["tasks"] = [...state["tasks"], action.payload.task];
      return newState;
    case DELETE_TASK:
      newState["tasks"] = state["tasks"].filter(
        task => task.id !== action.payload.id
      );
      return newState;
    default:
      return state;
  }
};
// Store
export interface IAppState {
  tasks: Task[];
}

const INITIAL_STATE: IAppState = {
  tasks: [
    {
      id: 100,
      description: "Shopping"
    }
  ]
};

const appStore = createStore(
  tasksReducer,
  INITIAL_STATE as any,
  (window as any).devToolsExtension && (window as any).devToolsExtension()
);

////////////////////////////////////////////
// Component
interface ITaskListProps {
  tasks: Task[];
  onRemoveTask: any;
}
class TaskList_ extends React.Component<ITaskListProps, {}> {
  public render() {
    return (
      <ul>
        {this.props.tasks.map((task: Task, index: number) => (
          <li key={index}>
            {task.description}
            <button onClick={() => this.props.onRemoveTask(task.id)}>
              Complete
            </button>
          </li>
        ))}
      </ul>
    );
  }
}

const mapActionsToProps_1 = {
  onRemoveTask: deleteTask
};

const TaskList = connect(
  undefined,
  mapActionsToProps_1
)(TaskList_);

///////////////////// TaskForm
interface TaskFormProps {
  onAddTask: any;
}
interface TaskFormState {
  currentTask: string;
  nextTaskId: number;
}
class TaskForm_ extends React.Component<TaskFormProps, TaskFormState> {
  constructor(props: TaskFormProps, context: any) {
    super(props, context);
    this.state = {
      currentTask: "",
      nextTaskId: 0
    };
  }

  public render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input
          type="text"
          onChange={this.inputChange}
          value={this.state.currentTask}
        />
      </form>
    );
  }

  private onAddTask() {
    this.props.onAddTask({
      id: this.state.nextTaskId,
      description: this.state.currentTask
    });
    this.updateStateOnSubmit();
  }

  private updateStateOnSubmit() {
    this.setState({
      currentTask: "",
      nextTaskId: this.state.nextTaskId + 1
    });
  }

  private handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    this.onAddTask();
  };

  private inputChange = (e: any) => {
    this.setState({
      currentTask: e.target.value
    });
  };
}

const mapActionsToProps = {
  onAddTask: addTask
};

const TaskForm = connect(
  undefined,
  mapActionsToProps
)(TaskForm_);

////////////// App
interface IProps {
  tasks: Task[];
}
interface IState {
  currentTask: string;
  tasks: Task[];
}
class App_ extends React.Component<IProps, IState> {
  public render() {
    return (
      <div className="App">
        <TaskForm />
        <TaskList tasks={this.props.tasks} />
      </div>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  tasks: state.tasks
  // name: state.name
});

const App = connect(mapStateToProps)(App_);

ReactDOM.render(
  <Provider store={appStore}>
    <App />
  </Provider>,
  document.getElementById("root") as HTMLElement
);

/**
 * 为啥现在不需要用 constructor 了?
 */
