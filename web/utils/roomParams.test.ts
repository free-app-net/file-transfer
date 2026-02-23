import { describe, it, expect } from "vitest";
import { parseRoomParams, stringifyRoomParams } from "./roomParams";

describe("parseRoomParams", () => {
  it("should parse valid room params", () => {
    const input = "m:user123;p:peer456;s:secret789";
    const result = parseRoomParams(input);

    expect(result).toEqual({
      myId: "user123",
      peerId: "peer456",
      secret: "secret789",
    });
  });

  it("should parse with full urlvalid room params", () => {
    const input = "https://example.com/room#m:user123;p:peer456;s:secret789";
    const result = parseRoomParams(input);

    expect(result).toEqual({
      myId: "user123",
      peerId: "peer456",
      secret: "secret789",
    });
  });

  it("should handle missing params", () => {
    const input = "m:user123;p:peer456";
    const result = parseRoomParams(input);

    expect(result).toEqual(null);
  });

  it("should handle empty string", () => {
    const result = parseRoomParams("");

    expect(result).toEqual(null);
  });

  it("should handle malformed input", () => {
    const result = parseRoomParams("garbage");

    expect(result).toEqual(null);
  });
});

describe("stringifyRoomParams", () => {
  it("should round-trip correctly", () => {
    const original = {
      myId: "user123",
      peerId: "peer456",
      secret: "secret789",
    };

    const stringified = stringifyRoomParams(original);
    const parsed = parseRoomParams(stringified);

    expect(parsed).toEqual(original);
  });
});
