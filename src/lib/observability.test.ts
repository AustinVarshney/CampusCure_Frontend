/**
 * CC-05: frontend error reporting.
 *
 * The guarantees that matter are about what must NOT be sent. Sentry is a
 * third party, and CC-64 gives students a right to erasure that cannot reach
 * it — so a name, an email or a query string copied into a report is data we
 * would be unable to delete on request.
 *
 * `reportError` must also never throw. It runs inside an error boundary that
 * is already handling a failure; a reporter that fails there would replace a
 * recoverable error with an unrecoverable one.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  __testing,
  getLastRequestId,
  noteRequestId,
  reportError,
  setReportingUser,
} from "./observability";

const { parseDsn } = __testing;

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  setReportingUser(null);
  noteRequestId("req-abc");
});

describe("parseDsn", () => {
  it("builds the envelope URL and extracts the public key", () => {
    expect(parseDsn("https://pub123@o9.ingest.sentry.io/77")).toEqual({
      envelopeUrl: "https://o9.ingest.sentry.io/api/77/envelope/",
      publicKey: "pub123",
    });
  });

  it.each([
    undefined,
    "",
    "not-a-url",
    // No public key - the part before @ is what authenticates the write.
    "https://o9.ingest.sentry.io/77",
    // No project id.
    "https://pub123@o9.ingest.sentry.io/",
  ])("returns null for %s", (dsn) => {
    expect(parseDsn(dsn as string | undefined)).toBeNull();
  });
});

describe("noteRequestId", () => {
  it("keeps the most recent id", () => {
    noteRequestId("first");
    noteRequestId("second");
    expect(getLastRequestId()).toBe("second");
  });

  it.each([null, undefined, ""])("ignores %s rather than clearing", (value) => {
    noteRequestId("kept");
    noteRequestId(value);
    // Clearing on a response that happened to lack the header would throw away
    // the correlation from the request that actually mattered.
    expect(getLastRequestId()).toBe("kept");
  });
});

describe("reportError", () => {
  /**
   * With no DSN configured - the state of every local checkout and of the
   * current deployment - reporting must be a console log and nothing else.
   */
  it("does not call the network when no DSN is configured", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    reportError(new Error("boom"));
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("always logs to the console, which is the only local output", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    reportError(new Error("boom"));
    expect(spy).toHaveBeenCalled();
  });

  it("never throws, whatever it is handed", () => {
    for (const value of [
      new Error("real"),
      "a string",
      null,
      undefined,
      42,
      { weird: true },
    ]) {
      expect(() => reportError(value)).not.toThrow();
    }
  });

  it("survives a circular object in extra", () => {
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(() => reportError(new Error("x"), { extra: cyclic })).not.toThrow();
  });
});
