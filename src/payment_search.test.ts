import { strict as assert } from "node:assert";
import { actionFor, cosineSimilarity, paymentEventSchema } from "./payment_search.ts";

const event = paymentEventSchema.parse({ id: "pay_test", amount: 10, currency: "USD", merchant: "Test Shop", status: "authorized", riskScore: 0.2 });
assert.equal(actionFor(event), "notify");
assert.equal(actionFor({ ...event, riskScore: 0.85 }), "review");
assert.equal(actionFor({ ...event, status: "settled" }), "settle");
assert.equal(cosineSimilarity([1, 0], [1, 0]), 1);
assert.equal(cosineSimilarity([1, 0], [0, 1]), 0);
assert.equal(cosineSimilarity([1], [1, 0]), 0);
console.log("payment risk decisions: ok");
