import assert from "node:assert/strict";
import { test } from "node:test";
import { allowRequest, validateBooking, validateContact } from "./contact";

test("email et message sont obligatoires, rien d'autre", () => {
  assert.deepEqual(validateContact("nom@exemple.fr", "Bonjour"), {});
  assert.ok(validateContact("nom@exemple", "Bonjour").email);
  assert.ok(validateContact("nom@exemple.fr", "   ").message);
});

test("cinq messages par adresse IP toutes les dix minutes", () => {
  const t = 1_000_000;
  for (let i = 0; i < 5; i++) assert.equal(allowRequest("1.2.3.4", 5, t + i), true);
  assert.equal(allowRequest("1.2.3.4", 5, t + 10), false);
  assert.equal(allowRequest("5.6.7.8", 5, t + 10), true);
  assert.equal(allowRequest("1.2.3.4", 5, t + 10 * 60 * 1000 + 10), true);
  assert.equal(allowRequest("slots:1.2.3.4", 1, t), true);
  assert.equal(allowRequest("slots:1.2.3.4", 1, t), false);
});

test("une réservation demande un nom et un email valide", () => {
  assert.deepEqual(validateBooking("Gaël", "nom@exemple.fr"), {});
  assert.ok(validateBooking("  ", "nom@exemple.fr").name);
  assert.ok(validateBooking("Gaël", "nom@exemple").email);
});
