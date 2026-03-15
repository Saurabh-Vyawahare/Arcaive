# Arcaive — Architecture

## Auth Flow

```
User → POST /auth/register → Backend creates user + stores in DB
User → POST /auth/login    → Backend verifies password → returns JWT
User → Any protected route (Bearer token) → Backend decodes JWT → returns data
```

## Document Flow

```
1. User uploads PDF via frontend
2. Backend saves file locally (→ S3 later)
3. Backend submits to PageIndex API
4. PageIndex processes async → builds tree
5. Frontend polls /documents/{id}/status
6. Once "indexed" → tree at /documents/{id}/tree
7. User can now query this document
```

## Query Flow

```
1. User types question in chat
2. Frontend POST /query/ask with question + doc_id
3. Backend validates ownership
4. Backend calls PageIndex chat_completions API
5. PageIndex reasons through tree → finds pages → generates answer
6. Backend returns answer + reasoning path
7. Frontend renders with tree trace
```

## Storage Strategy

- **Phase 1 (now):** In-memory dicts + local filesystem
- **Phase 2:** Supabase PostgreSQL for users, S3 for PDFs
- **Phase 3:** Redis cache for trees, CloudFront CDN
