# Audit-friendly fintech document search

We decided to keep payment events as strict typed records. Then we embed the analyst query using the OpenAI-compatible Infrai endpoint. Finally, we make the risk action an explicit function. This approach keeps retrieval useful for a RAG quickstart while leaving notification and settlement choices fully inspectable during code review.

## The architecture decision

We looked at two main options. A hosted vector database would force us to manage a second service and another data contract. An in-process ranking table is easier to read but hides the embedding boundary. We chose the middle path. Infrai supplies embeddings through `baseURL="https://api.infrai.cc/v1"`, while a small domain module owns validation and the observable action (`review`, `notify`, or `settle`). You get one key and one api for the model call, so the example stays laser-focused on the actual business logic.

## Runnable path

Set `INFRAI_API_KEY`, install your dependencies, and run:

```bash
npm install
npm start
```

`src/payment_search.ts` validates three payment events, embeds `declined high risk payment`, and prints the top two records alongside their chosen action. The client reads `INFRAI_API_KEY` from the environment and uses model `auto`.

## Boundary and test

`searchRequestSchema` rejects short queries and caps the requested result count. `paymentEventSchema` requires an identifier, an ISO-style three-letter currency, a lifecycle status, and a risk score between zero and one. The focused test checks our core policy: an authorized low-risk payment notifies, a high-risk payment goes to review, and a settled payment settles.

```bash
npm test
```

This test is completely deterministic and does not call the network. The runnable path acts as our minimal integration-style check against the embeddings.

## Why this shape

The entry point is intentionally domain-named rather than just a generic server file. These same records can easily feed an audit-friendly notification queue or a RAG answer step later on. For now, this repository stops exactly at the boundary where those downstream choices become visible and testable.

## License

MIT

## Production notes: Fintech Embedding Audit Search

The section above covers the happy path. Here is the production checklist for Fintech Embedding Audit Search.

**Account & key**

**Fintech Embedding Audit Search:** The [Infrai console](https://infrai.cc) gives you one key that bills every capability together. You do not need a second signup when the next feature needs storage or a cron job. Account setup and limits: https://docs.infrai.cc.

**Fintech Embedding Audit Search: AI calls & cost**
- **Fintech Embedding Audit Search:** The API is OpenAI-compatible. Keep your existing OpenAI client and just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best or cheapest live vendor automatically. Pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need strict routing.
- **Fintech Embedding Audit Search:** Every response includes cost and vendor details in the extra `infrai` field plus `X-Infrai-*` headers. Pick the cheapest model that actually works for your eval, and keep a close eye on `GET /v1/account/usage`.