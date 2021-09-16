import React, { FormEvent } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useLocation,
  useHistory,
} from "react-router-dom";

type Done = "yes" | "no";

type Todo = {
  title: string;
  done?: Done;
};

type Filter = {
  title?: string;
  done?: Done;
};

interface SearchProps {
  defaultValue?: string;
  onApply: (value: string) => void;
}

const Search = ({ onApply, defaultValue }: SearchProps) => {
  return (
    <form
      key={defaultValue}
      onSubmit={(e) => {
        e.preventDefault();
        const search = new FormData(e.currentTarget).get("search");
        if (typeof search === "string") {
          onApply(search);
        }
      }}
    >
      <input type="search" name="search" defaultValue={defaultValue} />
      <button type="submit">search</button>
    </form>
  );
};

interface DoneFilterProps {
  defaultValue?: Done;
  onApply: (value: string) => void;
}
const DoneFilter = ({ defaultValue, onApply }: DoneFilterProps) => {
  return (
    <div>
      <label htmlFor="done">Done</label>
      <select
        key={defaultValue as string}
        name="done"
        defaultValue={defaultValue as string}
        onChange={(e) => {
          onApply(e.target.value);
        }}
      >
        <option></option>
        <option value={"yes"}>True</option>
        <option value={"no"}>False</option>
      </select>
    </div>
  );
};

const List = () => {
  const { state, setState } = useUrl<Filter>();
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
  console.log(state.title);

  let filtered = state.title
    ? todos.filter((t) => t.title == state.title)
    : todos;
  filtered = state.done
    ? filtered.filter((t) => t.done === state.done)
    : filtered;

  return (
    <div>
      <Search
        defaultValue={state.title}
        onApply={(value) => {
          setState({
            ...state,
            title: value,
          });
        }}
      />
      <DoneFilter
        defaultValue={state.done}
        onApply={(value) => {
          setState({
            ...state,
            done: value as Done,
          });
        }}
      />
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
      .filter(
        (key) => params[key as keyof T] !== undefined && params[key as keyof T]
      )
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
    if (location.search !== newLocation.search) {
      updateState(parseStringToObject<T>(newLocation.search));
    }
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
