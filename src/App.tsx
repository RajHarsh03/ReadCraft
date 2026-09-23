import { UsernameEntry } from "./screens/UsernameEntry";
import { EditorWorkbench } from "./screens/EditorWorkbench";
import { TemplatesScreen } from "./screens/TemplatesScreen";
import { BadgesScreen } from "./screens/BadgesScreen";
import { DocsScreen } from "./screens/DocsScreen";
import { ToastProvider } from "./components/ui/Toast";
import { RouterProvider, useRouter } from "./router";

function Routes() {
  const { route, navigate } = useRouter();

  switch (route.name) {
    case "builder":
      return (
        // Keyed so switching users re-seeds the profile provider cleanly.
        <EditorWorkbench key={route.username} username={route.username} />
      );
    case "templates":
      return <TemplatesScreen />;
    case "badges":
      return <BadgesScreen />;
    case "docs":
      return <DocsScreen />;
    case "landing":
    default:
      return (
        <UsernameEntry
          onGenerate={(username) => navigate({ name: "builder", username })}
        />
      );
  }
}

function App() {
  return (
    <ToastProvider>
      <RouterProvider>
        <Routes />
      </RouterProvider>
    </ToastProvider>
  );
}

export default App;
