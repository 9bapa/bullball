## **Plan to Fix Bot Management System**

### **Phase 1: Fix Access Control & Structure**
1. **Move Bot Page Location**
   - Move from `/admin/bots/page.tsx` → `/bots/page.tsx`
   - Remove admin-only restrictions  
   - Implement user-based access levels

2. **Update Import Paths**
   - Fix imports from `/components/admin/bots/` → `/components/bots/`
   - Update all component references

3. **Implement User-Based Access**
   - **Admin**: Full bot CRUD, monitoring, configuration
   - **Regular User**: View/manage own bots, basic controls
   - **Guest**: Read-only access to public bot info

### **Phase 2: Integrate PumpPortal WebSocket API**
1. **Create WebSocket Service**
   - Create `/src/services/pumpportal.service.ts`
   - Implement WebSocket connection with API key
   - Handle lifecycle, reconnection, errors

2. **Add Bot Types & Subscriptions**
   - Support: Trader, Monitor, Analyzer bots
   - Dynamic token subscription based on user selection
   - Account-specific trade monitoring

3. **Replace Mock Data**
   - Use live WebSocket data instead of mocks
   - Handle: `subscribeNewToken`, `subscribeTokenTrade`, `subscribeAccountTrade`, `subscribeMigration`
   - Update bot status based on real messages

### **Phase 3: Enhanced Functionality**
1. **Dynamic Token Selection**
   - Users input any token address
   - Subscribe to specific token trades
   - Display real-time trade data

2. **Account Monitoring** 
   - Add wallet addresses to monitor
   - Track trading patterns & volumes
   - Real-time account trade alerts

3. **Migration Tracking**
   - Subscribe to token migration events
   - Alert users on platform migrations
   - Auto-update bot strategies

This resolves:
- ✅ Removes admin-only restriction
- ✅ Fixes component structure
- ✅ Integrates real PumpPortal API
- ✅ Implements all required subscriptions
- ✅ Enables dynamic token monitoring
- ✅ Provides proper user-based access control