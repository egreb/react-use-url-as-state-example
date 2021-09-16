import React, { FormEvent } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useLocation,
  useHistory,
} from "react-router-dom";

type Todo = {
  title: string;
  done: IsDone;
};

type Filter = {
  title?: string;
  done?: IsDone;
};

const Search = () => {
  const { state, setState } = useUrl<Filter>();
  const [search, setSearch] = React.useState(state.title);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setState({
      ...state,
      title: search,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button type="submit">search</button>
    </form>
  );
};

type IsDone = "yes" | "no" | "all";

const DoneFilter = () => {
  const { state, setState } = useUrl<Filter>();

  return (
    <div>
      <label htmlFor="done">Done</label>
      <select
        name="done"
        onChange={(e) =>
          setState({
            ...state,
            done: e.target.value as IsDone,
          })
        }
      >
        <option value="both"></option>
        <option value="yes">True</option>
        <option value="no">False</option>
      </select>
    </div>
  );
};

const List = () => {
  const { state } = useUrl<Filter>();
  console.log({ done: Boolean(state.done) });

  const todos: Array<Todo> = [
    {
      title: "Mow the lawn",
      done: "yes",
    },
    {
      title: "Clean the house",
      done: "no",
    },
  ];

  let filtered = state.title
    ? todos.filter((t) => t.title == state.title)
    : todos;
  filtered = state.done
    ? filtered.filter((t) => t.done === state.done)
    : filtered;

  return (
    <div>
      <Search />
      <DoneFilter />
      <ul>
        {filtered.map((t, index) => (
          <li key={index}>{t.title}</li>
        ))}
      </ul>
    </div>
  );
};

function parseStringToObject<T = object>(query: string): T {
  const params = new URLSearchParams(query);
  const obj: Record<string, unknown> = {};

  params.forEach((value, key) => {
    obj[key] = value;
  });

  return obj as T;
}

function parseObjectToQueryString<T = object>(params: T): string {
  return (
    "?" +
    Object.keys(params)
      .map((key) => key + "=" + params[key as keyof T])
      .join("&")
  );
}

function useUrl<T = object>() {
  const history = useHistory();
  const location = useLocation();
  const [state, updateState] = React.useState(
    parseStringToObject<T>(location.search)
  );

  const setState = (newState: T) => {
    history.push(parseObjectToQueryString(newState));
  };

  history.listen((newLocation) => {
    updateState(parseStringToObject<T>(newLocation.search));
  });

  return { state, setState };
}

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/">
          <List />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
