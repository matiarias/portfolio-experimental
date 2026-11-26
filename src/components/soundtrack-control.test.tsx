import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { dictionaries } from "@/content/portfolio";
import type { Soundtrack } from "@/content/soundtrack";
import SoundtrackControl from "./soundtrack-control";

const track = { src: "/media/test.mp3", title: "Test track" } satisfies Soundtrack;
const labels = dictionaries.es.soundtrack;

function setup() {
  const view = render(<SoundtrackControl track={track} labels={labels} />);
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
  return { ...view, audio, play, pause, setPaused: (value: boolean) => { paused = value; } };
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

  it("keeps playing when hidden and stops when the player unmounts", () => {
    const { play, pause, unmount } = setup();
    const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    fireEvent.click(screen.getByRole("button", { name: labels.play }));
    hidden.mockReturnValue(true);
    fireEvent(document, new Event("visibilitychange"));
    hidden.mockReturnValue(false);
    fireEvent(document, new Event("visibilitychange"));
    expect(pause).not.toHaveBeenCalled();
    expect(play).toHaveBeenCalledOnce();
    unmount();
    expect(pause).toHaveBeenCalledOnce();
  });

  it("shows the title when native play resolves without a playing event", async () => {
    const { play, setPaused } = setup();
    play.mockImplementationOnce(async () => setPaused(false));
    fireEvent.click(screen.getByRole("button", { name: labels.play }));
    expect(await screen.findByText(track.title)).toBeInTheDocument();
  });

  it("ignores a superseded play result while a new attempt is pending", async () => {
    const { play, audio, setPaused } = setup();
    const first = Promise.withResolvers<void>();
    const second = Promise.withResolvers<void>();
    for (const attempt of [first, second]) {
      play.mockImplementationOnce(() => {
        setPaused(false);
        return attempt.promise;
      });
    }

    fireEvent.click(screen.getByRole("button", { name: labels.play }));
    fireEvent.click(screen.getByRole("button", { name: labels.pause }));
    fireEvent.click(screen.getByRole("button", { name: labels.play }));
    fireEvent.pause(audio); // A queued event from the previous pause must not reset the new attempt.
    await act(async () => first.resolve());
    expect(screen.getByRole("button", { name: labels.pause })).toBeInTheDocument();
    expect(screen.queryByText(track.title)).not.toBeInTheDocument();
    await act(async () => second.resolve());
    expect(screen.getByText(track.title)).toBeInTheDocument();
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
