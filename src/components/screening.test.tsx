import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { chapters, dictionaries } from "@/content/portfolio";
import ChapterPanels from "./chapter-panels";
import Screening from "./screening";

let reducedMotion = false;
let playingAudio = false;

vi.mock("gsap", () => ({
  gsap: { from: vi.fn(), context: (animate: () => void) => { animate(); return { revert: vi.fn() }; } },
}));

function mount() {
  const copy = dictionaries.en;
  return render(<Screening locale="en" copy={copy}><ChapterPanels copy={copy} /></Screening>);
}

function advance(ms: number) {
  act(() => vi.advanceTimersByTime(ms));
}

function expectPanel(panel: string) {
  expect(screen.getByRole("figure")).toHaveAttribute("data-active", panel);
}

beforeEach(() => {
  reducedMotion = false;
  playingAudio = false;
  window.history.replaceState(null, "", "/en");
  vi.stubGlobal("matchMedia", (media: string) => ({
    media, matches: reducedMotion, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
  vi.spyOn(HTMLMediaElement.prototype, "paused", "get").mockImplementation(() => !playingAudio);
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(async () => { playingAudio = true; });
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => { playingAudio = false; });
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("screening", () => {
  it("plays, pauses the clock and audio, resumes from the remaining time and replays", () => {
    mount();
    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    expectPanel("about");
    expect(playingAudio).toBe(true);
    advance(5_000);
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(playingAudio).toBe(false);
    advance(15_000);
    expectPanel("about");
    fireEvent.click(screen.getByRole("button", { name: "Resume" }));
    advance(5_999);
    expectPanel("about");
    advance(1);
    expectPanel("experience");
    advance(15_000);
    expectPanel("contact");
    advance(6_000);
    expect(playingAudio).toBe(false);
    expectPanel("contact");
    fireEvent.click(screen.getByRole("button", { name: "Watch again" }));
    expectPanel("about");
    expect(playingAudio).toBe(true);
    expect(window.location.hash).toBe("");
  });

  it("cancels playback on manual navigation and preserves the chapter in the language link", () => {
    mount();
    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    fireEvent.click(screen.getByRole("link", { name: "Contact" }));
    advance(32_000);
    expectPanel("contact");
    expect(playingAudio).toBe(false);
    expect(window.location.hash).toBe("#contact");
    expect(screen.getByRole("link", { name: "Español" })).toHaveAttribute("href", "/es#contact");
    expect(screen.getByRole("heading", { name: "Contact" })).toHaveFocus();
  });

  it("keeps showing chapters when audio is rejected", async () => {
    vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(new DOMException("Blocked", "NotAllowedError"));
    mount();
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Play" })));
    expect(screen.getByRole("status")).toHaveTextContent(dictionaries.en.silentNote);
    advance(11_000);
    expectPanel("experience");
  });

  it("opens the first chapter without time or sound in reduced-motion mode", () => {
    reducedMotion = true;
    mount();
    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    advance(32_000);
    expectPanel("about");
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  });

  it("cleans up pending playback on unmount", () => {
    const setTimer = vi.spyOn(window, "setTimeout");
    const clearTimer = vi.spyOn(window, "clearTimeout");
    const view = mount();
    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    const chapterTimer = setTimer.mock.calls.findIndex(([, delay]) => delay === 11_000);
    expect(chapterTimer).toBeGreaterThanOrEqual(0);
    view.unmount();
    expect(playingAudio).toBe(false);
    expect(clearTimer).toHaveBeenCalledWith(setTimer.mock.results[chapterTimer].value);
  });

  it("lets keyboard users open a chapter and moves focus to its heading", async () => {
    vi.useRealTimers();
    mount();
    const user = userEvent.setup();
    screen.getByRole("link", { name: "Experience" }).focus();
    await user.keyboard("{Enter}");
    expectPanel("experience");
    expect(screen.getByRole("heading", { name: "Santander Tecnología Argentina" })).toHaveFocus();
  });
});

it("supplies both locales with the same chapter and interface keys", () => {
  expect(Object.keys(dictionaries.es)).toEqual(Object.keys(dictionaries.en));
  for (const copy of Object.values(dictionaries)) {
    expect(Object.keys(copy.labels)).toEqual([...chapters]);
    expect(Object.values(copy.labels).every(Boolean)).toBe(true);
    expect(copy.experience.map(({ highlights }) => highlights.length)).toEqual([5, 3]);
  }
});
