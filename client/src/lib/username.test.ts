import { describe, it, expect } from "vitest";
import {
  encodeUsername,
  isValidUsername,
  normalizeUsername,
  usernameError,
} from "./username";

describe("normalizeUsername", () => {
  it("trims whitespace and strips a leading @", () => {
    expect(normalizeUsername("  @torvalds  ")).toBe("torvalds");
    expect(normalizeUsername("@@ada")).toBe("ada");
    expect(normalizeUsername("octocat")).toBe("octocat");
  });
});

describe("isValidUsername", () => {
  it("accepts valid GitHub handles", () => {
    expect(isValidUsername("torvalds")).toBe(true);
    expect(isValidUsername("@torvalds")).toBe(true);
    expect(isValidUsername("a-b-c")).toBe(true);
    expect(isValidUsername("a".repeat(39))).toBe(true);
  });

  it("rejects invalid handles", () => {
    expect(isValidUsername("")).toBe(false);
    expect(isValidUsername("-nope")).toBe(false);
    expect(isValidUsername("nope-")).toBe(false);
    expect(isValidUsername("a--b")).toBe(false);
    expect(isValidUsername("has space")).toBe(false);
    expect(isValidUsername("a".repeat(40))).toBe(false);
  });
});

describe("usernameError", () => {
  it("returns null for empty (nothing to complain about yet)", () => {
    expect(usernameError("")).toBeNull();
    expect(usernameError("   ")).toBeNull();
  });

  it("returns a message for invalid input", () => {
    expect(usernameError("bad name")).toBeTruthy();
    expect(usernameError("-x")).toBeTruthy();
  });

  it("returns null for valid input", () => {
    expect(usernameError("@torvalds")).toBeNull();
  });
});

describe("encodeUsername", () => {
  it("normalizes then URL-encodes", () => {
    expect(encodeUsername("@ada")).toBe("ada");
    // Even though invalid, encoding must be URL-safe.
    expect(encodeUsername("a b")).toBe("a%20b");
  });
});
