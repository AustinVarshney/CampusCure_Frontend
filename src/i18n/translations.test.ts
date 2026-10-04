/**
 * CC-71: the Hindi translation against the English source.
 *
 * TypeScript already fails the build on a missing key. What it cannot see is
 * a translation that dropped or renamed a {{placeholder}} - that compiles,
 * then renders "कुल {{count}}" or loses the number entirely.
 */
import { describe, expect, it } from "vitest";
import { en } from "./en";
import { hi } from "./hi";

type Tree = { [key: string]: string | Tree };

const leaves = (tree: Tree, prefix = ""): Array<[string, string]> =>
  Object.entries(tree).flatMap(([key, value]) =>
    typeof value === "string"
      ? [[`${prefix}${key}`, value] as [string, string]]
      : leaves(value, `${prefix}${key}.`),
  );

const placeholders = (text: string) => [...text.matchAll(/{{\s*(\w+)\s*}}/g)].map((m) => m[1]).sort();

const lookup = (tree: Tree, path: string): string | undefined =>
  path.split(".").reduce<string | Tree | undefined>(
    (node, key) => (node && typeof node === "object" ? node[key] : undefined),
    tree,
  ) as string | undefined;

describe("Hindi translation", () => {
  const english = leaves(en as unknown as Tree);

  it("has every English string, none empty", () => {
    for (const [path] of english) {
      const value = lookup(hi as unknown as Tree, path);
      expect(value, path).toBeTypeOf("string");
      expect(value!.trim(), path).not.toBe("");
    }
  });

  it("keeps exactly the same {{placeholders}} as the English", () => {
    for (const [path, text] of english) {
      expect(placeholders(lookup(hi as unknown as Tree, path) ?? ""), path).toEqual(placeholders(text));
    }
  });

  it("actually translates: Hindi strings are written in Devanagari", () => {
    // Allow-list: strings that are legitimately the same in both languages.
    const sameInBoth = new Set<string>();
    for (const [path, text] of english) {
      const value = lookup(hi as unknown as Tree, path)!;
      if (sameInBoth.has(path)) continue;
      expect(/[\u0900-\u097F]/.test(value) || value === text, path).toBe(true);
      expect(value === text && /[a-z]{3}/i.test(text), `${path} is untranslated`).toBe(false);
    }
  });

  it("translates every sidebar label the layout uses", () => {
    const sidebar = [
      "Overview", "Dashboard", "Complaints", "Raise Complaint", "My Complaints", "Learning",
      "Doubt Community", "Saved Doubts", "Reputation", "Staff Directory", "Workload", "Doubts",
      "My Performance", "Operations", "All Complaints", "Escalated", "Users",
      "Faculty Performance", "System", "Settings", "My Profile",
    ];
    for (const label of sidebar) expect(hi.nav[label], label).toBeTruthy();
  });
});
