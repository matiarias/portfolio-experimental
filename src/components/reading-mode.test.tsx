import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { dictionaries } from "@/content/portfolio";
import ReadingMode from "./reading-mode";

describe("reading mode", () => {
  it("renders every section and contact link", () => {
    const copy = dictionaries.en;
    render(<ReadingMode copy={copy} />);

    expect(screen.getByText(copy.alley)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Software Engineer | Frontend" })).toBeInTheDocument();
    expect(screen.getByText(copy.about[0])).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Santander Tecnología Argentina" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: copy.contactIntro })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /GitHub/ })).toHaveAttribute(
      "href",
      "https://github.com/matiarias",
    );
  });
});
