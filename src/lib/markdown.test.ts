import { describe, it, expect } from "vitest";
import {
  generateMarkdown,
  READCRAFT_BRAND,
  READCRAFT_URL,
} from "./markdown";
import { emptyState, makeState } from "../test/factory";

describe("generateMarkdown", () => {
  it("outputs only the ReadCraft credit when nothing is enabled", () => {
    const md = generateMarkdown(emptyState());
    expect(md).toContain(READCRAFT_BRAND);
    expect(md).toContain(READCRAFT_URL);
    // No section content, just the divider + credit footer.
    expect(md).not.toContain("Tech Stack");
  });

  it("always appends the ReadCraft credit footer with only the brand linked", () => {
    const md = generateMarkdown(makeState());
    expect(md).toContain(`<a href="${READCRAFT_URL}">${READCRAFT_BRAND}</a>`);
    // The credit is the last content in the document.
    expect(md.trimEnd().endsWith("</p>")).toBe(true);
  });

  it("renders the greeting and handle for the profile block", () => {
    const md = generateMarkdown(makeState());
    expect(md).toContain("# Hi there, I'm Ada Lovelace 👋");
    expect(md).toContain("`@ada`");
  });

  it("renders sections in order, separated by blank lines", () => {
    const md = generateMarkdown(makeState());
    const idxIdentity = md.indexOf("Hi there");
    const idxTech = md.indexOf("Tech Stack & Tooling");
    const idxPinned = md.indexOf("Pinned Repositories");
    expect(idxIdentity).toBeGreaterThanOrEqual(0);
    expect(idxIdentity).toBeLessThan(idxTech);
    expect(idxTech).toBeLessThan(idxPinned);
  });

  it("omits disabled sections", () => {
    const state = makeState();
    state.enabled.tech = false;
    state.enabled.pinned = false;
    const md = generateMarkdown(state);
    expect(md).not.toContain("Tech Stack & Tooling");
    expect(md).not.toContain("Pinned Repositories");
  });

  it("bolds working/learning focus items but not ask-me-about", () => {
    const md = generateMarkdown(
      makeState({
        focus: { working: "Note G", learning: "", askMeAbout: "engines" },
      })
    );
    expect(md).toContain("- 🔭 I'm currently working on **Note G**");
    expect(md).toContain("- 💬 Ask me about engines");
    expect(md).not.toContain("**engines**");
  });

  it("URL-encodes the username in metric card links", () => {
    const md = generateMarkdown(
      makeState({
        basics: { fullName: "X", username: "@Ada", location: "", company: "" },
      })
    );
    expect(md).toContain("username=Ada");
    expect(md).not.toContain("username=@Ada");
  });

  it("escapes backticks in tech names so code spans can't break", () => {
    const md = generateMarkdown(
      makeState({ tech: [{ name: "C`odd", color: "#000" }] })
    );
    // The stray backtick is removed, leaving a well-formed inline code span.
    expect(md).toContain("`Codd`");
  });

  it("appends location to the bio only when both are present", () => {
    const withLocation = generateMarkdown(
      makeState({
        headline: { primary: "Engineer", bio: "Builds things." },
        basics: {
          fullName: "X",
          username: "x",
          location: "Berlin",
          company: "",
        },
      })
    );
    expect(withLocation).toContain("Builds things. Based in Berlin.");

    const noBio = generateMarkdown(
      makeState({
        headline: { primary: "Engineer", bio: "" },
        basics: {
          fullName: "X",
          username: "x",
          location: "Berlin",
          company: "",
        },
      })
    );
    expect(noBio).not.toContain("Based in Berlin");
  });

  it("ends with a single trailing newline", () => {
    const md = generateMarkdown(makeState());
    expect(md.endsWith("\n")).toBe(true);
    expect(md.endsWith("\n\n")).toBe(false);
  });
});
