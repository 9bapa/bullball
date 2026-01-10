## Database Schema Enhancement Plan

### 1. Update bullrhun_tokens Table
- Add fields for `initial_buy`, `sol_amount` (already in schema but need to ensure proper population)
- Add fields for parsed URI metadata: `description`, `image_url`, `twitter_url`, `website_url`, `created_on_platform`
- Add `bonding_curve_key`, `market_cap_sol` fields from PumpPortal data
- Ensure `creator` field properly captures `traderPublicKey`

### 2. Create bullrhun_token_creators Table
- Track token creators with their wallet address
- Store creator statistics: total_tokens_created, successful_tokens, total_volume
- Add creator reputation metrics and success rates
- Include fields for `first_seen`, `last_active`, `is_verified`

### 3. Create URI Metadata Processing Function
- Parse IPFS URI responses to extract token metadata
- Handle different URI formats (IPFS, HTTP, etc.)
- Store structured metadata: description, image, twitter, website
- Handle missing or malformed URIs gracefully

### 4. Update process_pumpportal_new_token Function
- Extract `traderPublicKey` as the token creator
- Parse and store `initialBuy` and `solAmount` values
- Process URI to extract metadata
- Populate all new metadata fields
- Update creator statistics in token_creators table

### 5. Create Token Creator Query Functions
- `get_tokens_by_creator(creator_wallet)` - Get all tokens created by a wallet
- `get_creator_stats(creator_wallet)` - Get creator performance statistics
- `get_top_creators(limit)` - Get most successful token creators

### 6. Add Performance Indexes
- Index on `creator` field in bullrhun_tokens
- Composite index on `creator` + `created_at` for time-based queries
- Index on `initial_buy` and `sol_amount` for financial analytics

### 7. Update Buffer Processing
- Modify `process_pumpportal_buffer_v2` to handle new fields
- Ensure `traderPublicKey` is properly mapped to creator
- Add URI metadata processing step

This enhancement will provide comprehensive token tracking, creator analytics, and complete metadata collection for the BullRhun trading system.