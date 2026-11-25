import { describe, expect, it } from "vitest";
import { panelFromLocation, projectHash, stopFromHash } from "./alley-location";

describe("alley fragments", () => {
  it("keeps the original chapter hashes as stops, not panels", () => {
    for (const hash of ["#about", "#experience", "#contact"]) {
      expect(stopFromHash(hash)).toBe(hash.slice(1));
      expect(panelFromLocation(hash)).toBeNull();
    }
  });

  it("recognizes the chapter detail links and legacy experience anchors", () => {
    expect(panelFromLocation("#about/details")).toBe("#about/details");
    expect(panelFromLocation("#contact/details")).toBe("#contact/details");
    expect(panelFromLocation("#experience/details")).toBe("#experience/details");
    expect(stopFromHash("#experience/details")).toBe("experience");
    expect(stopFromHash("#about/details")).toBe("about");
    expect(stopFromHash("#contact/details")).toBe("contact");
    expect(panelFromLocation(projectHash("0-2"))).toBe("#experience/0-2");
    expect(panelFromLocation(projectHash("1-2"))).toBe("#experience/1-2");
  });

  it("lands on Experience without a dialog for an unknown project", () => {
    for (const hash of ["#experience/", "#experience/0-9", "#experience/0-2/extra"]) {
      expect(stopFromHash(hash)).toBe("experience");
      expect(panelFromLocation(hash)).toBeNull();
    }
  });
});
