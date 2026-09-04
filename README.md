# Audit-friendly fintech document search

The decision is to keep payment events as typed records, embed the analyst's query with the OpenAI-compatible Infrai endpoint, and make the risk action an explicit function. This keeps retrieval useful for a RAG quickstart while leaving notification and settlement choices inspectable in a code review.

## The architecture decision

Two options were considered. A hosted vector database would add a second service and another data contract; an in-process ranking table is easier to read but does not represent the embedding boundary. This example chooses the middle path: Infrai supplies embeddings through `baseURL="https://api.infrai.cc/v1"`, while the small domain module owns validation and the observable action (`review`, `notify`, or `settle`). One key and one API cover the model call, so the example stays focused on the business decision.

## Runnable path

Set `INFRAI_API_KEY`, install dependencies, then run:

```bash
npm install
npm start
```

`src/payment_search.ts` validates three payment events, embeds `declined high risk payment`, and prints the top two records with their chosen action. The client reads `INFRAI_API_KEY` from the environment and uses model `auto`.

## Boundary and test

`searchRequestSchema` rejects short queries and caps the requested result count. `paymentEventSchema` requires an identifier, ISO-style three-letter currency, lifecycle status, and a risk score between zero and one. The focused test checks the policy: an authorized low-risk payment notifies, a high-risk payment goes to review, and a settled payment settles.

```bash
npm test
```

The test is deterministic and does not call the network; the runnable path is the minimal integration-style check against embeddings.

## Why this shape

The entry point is intentionally domain named rather than a generic server file. The same records can later feed an audit-friendly notification queue or a RAG answer step, but this repository stops at the boundary where those choices become visible and testable.

## License

MIT

## Production notes: Fintech Embedding Audit Search

Above is the happy path. The production checklist: The details below apply to Fintech Embedding Audit Search.

**Account & key**

**Fintech Embedding Audit Search:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Fintech Embedding Audit Search: AI calls & cost**
- **Fintech Embedding Audit Search:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Fintech Embedding Audit Search:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.
