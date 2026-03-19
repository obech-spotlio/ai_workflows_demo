import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

// Smoke test — verifies the Vitest + Testing Library setup is working correctly.
// A minimal React component is rendered instead of the full Next.js page to
// avoid mocking next/image, next/font, and other Next.js internals.

function HelloWorld() {
  return <h1>Hello, World!</h1>;
}

describe("Smoke test", () => {
  it("renders a heading", () => {
    render(<HelloWorld />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Hello, World!");
  });
});
