import assert from "node:assert/strict";
import { test } from "node:test";
import { monthAt, nextMonthStart } from "./dates";

test("le mois affiché passe correctement d'une année à l'autre", () => {
  assert.deepEqual(monthAt("2026-10-03", 0), { y: 2026, m: 9, key: "2026-10" });
  assert.equal(monthAt("2026-10-03", 3).key, "2027-01");
  assert.equal(monthAt("2026-12-31", 1).key, "2027-01");
  assert.equal(monthAt("2027-01-15", -1).key, "2026-12");
  assert.equal(monthAt("2026-10-03", 15).key, "2028-01");
});

test("la fin d'un mois est le premier jour du suivant, décembre compris", () => {
  assert.equal(nextMonthStart("2026-10"), "2026-11-01");
  assert.equal(nextMonthStart("2026-12"), "2027-01-01");
});
