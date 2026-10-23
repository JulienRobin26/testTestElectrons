import test from "node:test";
import assert from "node:assert/strict";
import { ajouterPoints } from "../logic/score.mjs";

test("Une pomme ajoute 10 points à un score de 0", () => {
  assert.equal(ajouterPoints(0), 10);
});

test("Une pomme ajoute 10 points à un score de 20", () => {
  assert.equal(ajouterPoints(20), 30);
});
