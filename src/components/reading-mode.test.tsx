import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { aboutStack, dictionaries } from "@/content/portfolio";
import ReadingMode from "./reading-mode";

describe("reading mode", () => {
  it("renders every section and contact link", () => {
    const copy = dictionaries.en;
    render(<ReadingMode copy={copy} />);

    expect(screen.queryByText("Night alley")).not.toBeInTheDocument();
    expect(screen.getByText(copy.headline)).toBeInTheDocument();
    expect(screen.getAllByText(aboutStack)).toHaveLength(1);
    expect(screen.getAllByText(copy.aboutSector)).toHaveLength(1);
    const about = within(screen.getByRole("region", { name: copy.labels.about }));
    expect(about.getByRole("heading")).toHaveTextContent(copy.labels.about);
    expect(about.getByText(copy.about[0])).toBeInTheDocument();
    expect(about.queryByText(aboutStack)).not.toBeInTheDocument();
    expect(about.queryByText(copy.aboutSector)).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Santander Tecnología Argentina" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: copy.contactIntro })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /GitHub/ })).toHaveAttribute(
      "href",
      "https://github.com/matiarias",
    );
  });
});
