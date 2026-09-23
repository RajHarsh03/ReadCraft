import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Unmount React trees after every test to keep the DOM isolated.
afterEach(() => {
  cleanup();
});
