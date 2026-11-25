import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { dictionaries } from "@/content/portfolio";
import type { Soundtrack } from "@/content/soundtrack";
import SoundtrackControl from "./soundtrack-control";

const track = { src: "/media/test.mp3", title: "Test track" } satisfies Soundtrack;
const labels = dictionaries.es.soundtrack;

function setup() {
  const view = render(<SoundtrackControl track={track} labels={labels} suspended={false} />);
  const audio = view.container.querySelector("audio");
  if (!audio) throw new Error("Expected an audio element");
  let paused = true;
  vi.spyOn(audio, "paused", "get").mockImplementation(() => paused);
  const play = vi.spyOn(audio, "play").mockImplementation(async () => {
    paused = false;
    fireEvent.playing(audio);
  });
  const pause = vi.spyOn(audio, "pause").mockImplementation(() => {
    paused = true;
    fireEvent.pause(audio);
  });
  return { ...view, audio, play, pause };
}

afterEach(() => vi.restoreAllMocks());

describe("soundtrack", () => {
  it("loads the track only on play and uses the same control to pause", () => {
    const { audio, play, pause } = setup();
    expect(audio).toHaveAttribute("preload", "none");
    expect(audio).not.toHaveAttribute("src");
    expect(play).not.toHaveBeenCalled();
    const button = screen.getByRole("button", { name: labels.play });
    fireEvent.click(button);
    expect(audio).toHaveAttribute("src", track.src);
    expect(play).toHaveBeenCalledOnce();
    expect(button).toHaveAccessibleName(labels.pause);
    expect(screen.getByText(track.title)).toBeInTheDocument();
    fireEvent.click(button);
    expect(pause).toHaveBeenCalledOnce();
    expect(button).toHaveAccessibleName(labels.play);
    expect(screen.queryByText(track.title)).not.toBeInTheDocument();
  });

  it("pauses while hidden or in a dialog and never resumes by itself", () => {
    const { play, pause, rerender } = setup();
    const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    fireEvent.click(screen.getByRole("button", { name: labels.play }));
    hidden.mockReturnValue(true);
    fireEvent(document, new Event("visibilitychange"));
    hidden.mockReturnValue(false);
    fireEvent(document, new Event("visibilitychange"));
    expect(pause).toHaveBeenCalledOnce();
    expect(play).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: labels.play }));
    rerender(<SoundtrackControl track={track} labels={labels} suspended />);
    rerender(<SoundtrackControl track={track} labels={labels} suspended={false} />);
    expect(pause).toHaveBeenCalledTimes(2);
    expect(play).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("button", { name: labels.play })).toBeInTheDocument();
  });

  it("announces a failed start and offers another attempt", async () => {
    const { play } = setup();
    play.mockRejectedValueOnce(new DOMException("Not supported", "NotSupportedError"));
    fireEvent.click(screen.getByRole("button", { name: labels.play }));
    expect(await screen.findByText(labels.error)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: labels.play }));
    expect(play).toHaveBeenCalledTimes(2);
    expect(screen.queryByText(labels.error)).not.toBeInTheDocument();
  });
});
