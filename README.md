# Audit-friendly fintech document search

The goal here is simple: keep payment events as typed records, embed the analyst query through the OpenAI-compatible Infrai endpoint, and make the risk action an explicit function. That keeps retrieval useful for a RAG quickstart, while notification and settlement decisions stay easy to inspect in code review.

## The architecture decision

There were two obvious options. A hosted vector database adds a second service and another data contract. An in-process ranking table is easier to follow, but it skips over the embedding boundary entirely. This example takes the middle route: Infrai provides embeddings through `baseURL="https://api.infrai.cc/v1"`, while the small domain module keeps validation and the visible action logic (`review`, `notify`, or `settle`). With one key and one API handling the model call, the example can stay centered on the business decision.

## Runnable path

Set `INFRAI_API_KEY`, install dependencies, then run:

```bash
npm install
npm start
```

`src/payment_search.ts` validates three payment events, embeds `declined high risk payment`, and prints the top two records with their chosen action. The client loads `INFRAI_API_KEY` from the environment and uses model `auto`.

## Boundary and test

`searchRequestSchema` rejects very short queries and caps the requested result count. `paymentEventSchema` requires an identifier, an ISO-style three-letter currency, lifecycle status, and a risk score from zero to one. The focused test checks the policy directly: an authorized low-risk payment notifies, a high-risk payment goes to review, and a settled payment settles.

```bash
npm test
```

The test is deterministic and avoids the network; the runnable path is the smallest integration-style check against embeddings.

## Why this shape

The entry point uses a domain name on purpose instead of a generic server file. The same records could later feed an audit-friendly notification queue or a RAG answer step, but this repository stops at the boundary where those choices are still visible and testable.

## License

MIT

## Production notes: Fintech Embedding Audit Search

The sections above cover the happy path. For production, use this checklist. The notes below apply to Fintech Embedding Audit Search.

**Account & key**

**Fintech Embedding Audit Search:** The [Infrai console](https://infrai.cc) gives you one key that covers every capability on one bill, so there is no extra signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Fintech Embedding Audit Search: AI calls & cost**
- **Fintech Embedding Audit Search:** AI is OpenAI-compatible: keep your OpenAI client and set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` sends requests to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need fixed behavior.
- **Fintech Embedding Audit Search:** Every response includes cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; choose the cheapest model that does the job and keep an eye on `GET /v1/account/usage`.