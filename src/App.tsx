import { useState } from "react";
import { UsernameEntry } from "./screens/UsernameEntry";
import { EditorWorkbench } from "./screens/EditorWorkbench";

type Route =
  | { view: "landing" }
  | { view: "editor"; username: string };

function App() {
  const [route, setRoute] = useState<Route>({ view: "landing" });

  if (route.view === "editor") {
    // Keyed so switching users re-seeds the profile provider cleanly.
    return <EditorWorkbench key={route.username} username={route.username} />;
  }

  return (
    <UsernameEntry
      onGenerate={(username) => setRoute({ view: "editor", username })}
    />
  );
}

export default App;
