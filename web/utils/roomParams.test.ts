import { describe, it, expect } from "vitest";
import {
  generateRoomParams,
  parseRoomParams,
  RoomParams,
  stringifyRoomParams,
} from "./roomParams";

describe("parseRoomParams", () => {
  it("should parse valid room params", () => {
    const input = `room123_____________;secret456___________`;
    const result = parseRoomParams(input);

    expect(result).toMatchInlineSnapshot(`
      {
        "roomId": "room123_____________",
        "secret": "secret456___________",
      }
    `);
  });

  it("should parse with full urlvalid room params", () => {
    const input = `https://example.com/room#${"room123".padEnd(20, "_")};${"secret456".padEnd(20, "_")}`;
    const result = parseRoomParams(input);

    expect(result).toMatchInlineSnapshot(`
      {
        "roomId": "room123_____________",
        "secret": "secret456___________",
      }
    `);
  });

  it("should handle missing params", () => {
    const input = "123123";
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
    const original: RoomParams = {
      roomId: "room123".padEnd(20, "_"),
      secret: "secret456".padEnd(20, "_"),
    };

    const stringified = stringifyRoomParams(original);
    const parsed = parseRoomParams(stringified);

    expect(parsed).toEqual(original);
  });
});

describe("generateRoomParams", () => {
  it("should round-trip correctly", () => {
    const original = generateRoomParams();

    const stringified = stringifyRoomParams(original);
    const parsed = parseRoomParams(stringified);

    expect(parsed).toEqual(original);
  });
});
