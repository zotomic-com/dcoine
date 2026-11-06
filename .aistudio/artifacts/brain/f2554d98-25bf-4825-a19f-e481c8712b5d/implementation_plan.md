# Implementation Plan: Native DC Coin Architecture & Admin Management Console

Build and integrate a production-grade native coin (**DC Coin**) administration system into the platform, featuring live mining countdown and hash rate analytics, automated tokenomics and vesting schedules, reserves and presale allocation controls, a global **Migration & Release Quota** engine with **Mandatory KYC Verification Auto-Hold gating**, an account lock/unlock security engine, and an auto-rejection transfer circuit breaker with 2FA verification.

---

## 1. System Architecture & Data Schema

### 1.1 Extended Types in `src/types/index.ts`
- **`CoinTokenomicsConfig`**:
  - `totalSupply`: Total coin cap (e.g. 100,000,000 DC).
  - `circulatingSupply`: Current circulating coins.
  - `minedSupply`: Total coins mined to date.
  - `reserveSupply`: Platform reserve allocation.
  - `presaleSupply`: Presale distribution allocation.
  - `miningRewardPerBlock`: Base block reward (e.g. 5 DC).
  - `blockTimeSeconds`: Block interval (e.g. 15s).
  - `nextHalvingBlock`: Block target for next reward halving.
  - `currentBlockHeight`: Real-time sequential block height.
  - `transfersGloballyEnabled`: Boolean master circuit breaker (default: `false` / Auto-Reject mode).
  - `require2FAForTransfers`: Boolean (default: `true`).
  - `requireAdminApprovalForTransfers`: Boolean (default: `true`).
  - `strictKycEnforcedForMigration`: Boolean (default: `true` / Non-KYC auto-hold active).

- **`CoinMigrationPolicy`**:
  - `id`: Policy identifier.
  - `phaseName`: e.g., `"Phase 1: Genesis Mainnet Migration"`.
  - `globalReleasePercentage`: Percentage of total mined coins authorized for transfer/withdrawal (e.g., `60%`).
  - `globalLockedPercentage`: Automatically calculated remainder held in lockup (e.g., `40%`).
  - `maxTransferCapPerUser`: Maximum DC amount an individual user may transfer/withdraw in this phase.
  - `minMinedThreshold`: Minimum mined balance required to participate in migration.
  - `requireKycVerification`: Boolean check for migration eligibility (enforced: `true`).
  - `isActive`: Boolean toggle activating this migration policy across all user accounts.
  - `totalEligibleUsers`: Aggregate count of eligible miners.
  - `totalMinedAggregate`: Aggregate DC mined by eligible users (e.g. 40,000,000 DC).
  - `totalAuthorizedForRelease`: Calculated DC released (e.g. 24,000,000 DC at 60%).
  - `totalRetainedInLockup`: Calculated DC locked (e.g. 16,000,000 DC at 40%).
  - `totalKycAutoHeld`: DC coins belonging to unverified miners held in automatic compliance hold.
  - `updatedAt`: ISO timestamp.

- **`UserMigrationStatus`**:
  - `userId`: User identifier.
  - `walletAddress`: Public address.
  - `userName`: Miner handle.
  - `kycStatus`: `'verified' | 'pending' | 'unverified' | 'rejected'`.
  - `totalMined`: Total lifetime mined DC balance.
  - `unlockedMigratableAmount`: Authorized migration quota (e.g., 60% of total mined).
  - `lockedReserveAmount`: Remainder held in custody pending future authorization (40%).
  - `migrationHoldState`: `'active_unlocked' | 'auto_hold_kyc_required' | 'admin_restricted'`.
  - `alreadyTransferredAmount`: Amount already transferred/withdrawn.
  - `customOverridePercentage`: Optional custom admin override for specific VIP/partner miners.

- **`CoinReserveAllocation`**:
  - `id`: Unique identifier.
  - `category`: `'treasury' | 'team' | 'ecosystem' | 'presale' | 'liquidity' | 'custom'`.
  - `beneficiaryName`: Organization, wallet, or partner label.
  - `walletAddress`: Ledger public address (`0x...`).
  - `allocatedAmount`: Total allocated DC.
  - `releasedAmount`: Amount already vested/unlocked.
  - `releaseDate`: Timestamp or ISO date.
  - `status`: `'locked' | 'partially_unlocked' | 'fully_unlocked' | 'revoked'`.
  - `notes`: Description/audit note.

- **`CoinVestingSchedule`**:
  - `id`: Schedule ID.
  - `allocationId`: Associated reserve ID.
  - `cliffMonths`: Cliff period before first release.
  - `vestingDurationMonths`: Total vesting span.
  - `frequency`: `'daily' | 'monthly' | 'quarterly'`.
  - `lastDisbursedAt`: Timestamp of last release.
  - `nextDisbursementAt`: Timestamp of next milestone.

- **`AccountLockRule`**:
  - `id`: Unique rule ID.
  - `accountAddress`: Target user address or email.
  - `accountName`: Optional user moniker.
  - `lockedAmount`: Amount of DC restricted from movement.
  - `lockReason`: Compliance, vesting, collateral, or administrative flag.
  - `autoUnlockDate`: Scheduled unlock date (or indefinite if manual).
  - `status`: `'active' | 'unlocked' | 'overridden'`.
  - `createdAt`: Timestamp.

- **`CoinTransferRequest`**:
  - `id`: Unique transfer TX request ID.
  - `senderAddress`: User wallet address.
  - `senderEmail`: Account email.
  - `recipientAddress`: Target address.
  - `amount`: Transfer quantity in DC.
  - `twoFactorVerified`: Boolean status from user 2FA prompt.
  - `kycVerified`: Boolean check confirming sender is KYC approved.
  - `migrationChecked`: Boolean verifying amount does not exceed the user's unlocked migration quota.
  - `status`: `'auto_rejected' | 'pending_admin_review' | 'approved' | 'rejected'`.
  - `rejectionReason`: Explicit rejection note (e.g. "Transfers paused by governance", "Auto-Hold: KYC verification required", or "Exceeds 60% migration quota").
  - `ledgerHash`: SHA-256 cryptographic verifiable receipt signature.
  - `createdAt`: ISO timestamp.
  - `reviewedAt`: Optional review timestamp.
  - `reviewedBy`: Admin employee ID.

- **`LiveMinerTelemetry`**:
  - `minerId`: Unique miner instance.
  - `userAddress`: Miner wallet address.
  - `userName`: Miner handle.
  - `hashRateMHs`: Current hash rate in MH/s.
  - `validShares`: Accepted share count.
  - `activeWorkers`: Number of active compute nodes.
  - `lastHeartbeat`: Timestamp.
  - `estDailyYieldDC`: Estimated 24h yield in DC.

---

## 2. Storage Service Updates (`src/services/storage.ts`)

- Provide persistent initializers and methods in `localStorage`:
  - `storage.getCoinConfig()` / `storage.saveCoinConfig()`: Default configuration with transfers **globally disabled** (`transfersGloballyEnabled: false`) and strict KYC verification enforced.
  - `storage.getMigrationPolicies()` / `storage.saveMigrationPolicies()`: Manage migration phases (Default: Phase 1 configured with 60% release quota, 40% locked, mandatory KYC auto-hold).
  - `storage.getUserMigrationRecords()` / `storage.saveUserMigrationRecords()`: Track each miner's mined balance, KYC verification state, unlocked migratable portion, and automatic KYC hold flags.
  - `storage.getReserveAllocations()` / `storage.saveReserveAllocations()`: Full CRUD for reserves and presale quotas.
  - `storage.getAccountLockRules()` / `storage.saveAccountLockRules()`: Full CRUD for targeted account locking/unlocking.
  - `storage.getCoinTransferRequests()` / `storage.saveCoinTransferRequests()`: Manage pending transfer approval queue.
  - `storage.getLiveMiners()`: Live miner pool seed with reactive polling simulation for block mining countdown.

---

## 3. UI Component Architecture: `AdminCoinTab.tsx`

Add new component `src/components/admin/AdminCoinTab.tsx` with 6 dedicated sub-views accessible via high-contrast segmented navigation:

### Sub-Tab 1: Live Mining & Real-Time Countdowns
- **Live Counter Hero**: Real-time counter of total mined DC coins incrementing as simulated blocks are discovered every few seconds.
- **Next Block & Halving Countdown**: Synchronized countdown timer to next block reward and next halving epoch.
- **Active Miners & Aggregate Hashrate**: Total active miners counter, total network hashrate (e.g. `245.8 GH/s`), difficulty index, and dynamic sparkline/bar graphs.
- **Miner Fleet Roster**: Table of connected miners displaying wallet, hash rate, active nodes, daily yield, and disconnect/suspend actions.

### Sub-Tab 2: Migration & Release Quota Engine (with KYC Auto-Hold)
- **Global Quota & Compliance Controller**:
  - Interactive slider & numeric input for **Global Release Percentage** (e.g., `60%`) and automatically computed **Locked Reserve Percentage** (e.g., `40%`).
  - **Mandatory KYC Gating Switch**: Prominently displays *"Enforce KYC Verification for Migration (Non-KYC on Auto-Hold)"* — when enabled, unverified users are strictly barred from migrating.
  - **Max Transfer/Withdrawal Cap** per user input field.
  - **Phase / Epoch Manager**: Add, edit, or switch migration phases (e.g. "Genesis 60%", "Milestone 2 - 80%", "Full Mainnet 100%").
- **Live Aggregate Simulation & Compliance Cards**:
  - Aggregate metrics: *100 Active Miners • Total Mined: 40,000,000 DC*.
  - *Authorized for Migration (60%): 24,000,000 DC*.
  - *Retained in Admin Custody Lockup (40%): 16,000,000 DC*.
  - *KYC Auto-Hold Pool*: Amount of DC belonging to non-verified miners currently frozen until KYC completion.
- **Miner Quota & KYC Status Roster**:
  - Table displaying: User Name, Wallet, Total Mined, KYC Status (`Verified` / `Pending KYC` / `Unverified - Auto-Hold`), Unlocked (60%), Locked (40%), and Current Migration State.
  - **One-Click KYC Review / Override**: Admin can verify/unfreeze a user's migration hold directly from the row.
  - **Edit Override Modal**: Admin can assign custom release percentages to specific miners.
  - **Batch Authorize Migration Button**: Apply or update release authorization across all eligible KYC-verified accounts.

### Sub-Tab 3: Tokenomics & Automated Smart Vesting
- **Supply Breakdown Cards**: Total Max Cap (100M DC), Mined Supply, Locked Reserves, Presale Pool, and True Circulating Supply.
- **Automated Vesting Milestone Table**: Next unlock dates, cliff progress indicators, and an admin button to trigger manual disbursement or recalculate schedules.
- **Coin Minting & Burn Safeguards**: Verifiable total supply cap validator ensuring no inflation beyond governance parameters.

### Sub-Tab 4: Reserves & Presale Allocation Manager (Full CRUD)
- **Allocation Roster**: Grid showing each reserve beneficiary, address, total allocation, unlocked ratio, and release timeline.
- **Add Allocation Modal**: Admin can add new allocations (Name, Wallet, Category, DC Amount, Release Date, Vesting parameters).
- **Edit Allocation Modal**: Admin can adjust amounts, beneficiaries, or release dates.
- **Delete / Revoke Action**: Confirmed deletion or revoking of unclaimed reserve allocations.

### Sub-Tab 5: Account Lock & Unlock Engine (Full CRUD)
- **Account Restriction Registry**: Searchable list of locked accounts with lock amount, reason, and unlock countdown.
- **Add Lock Rule Modal**: Lock coins for a specific wallet or user ID (Partial lock or 100% balance lock).
- **Edit Rule Modal**: Modify locked amount or postpone/advance unlock timestamp.
- **Unlock / Delete Action**: Instantly release locked balance with admin confirmation dialogue and audit log.

### Sub-Tab 6: Transfer Security Gateway & Circuit Breaker
- **Master Transfer Switch (Circuit Breaker)**: Prominent toggle showing current status:
  - *Default Status*: **AUTO-REJECT MODE ACTIVE**. All user DC transfers, withdrawals, and P2P sends are blocked or automatically recorded as rejected until admin enables.
  - *Active Status*: Enabled with 2FA enforcement and pending admin verification queue.
- **Pending Review & Approval Queue**:
  - Filterable by `Pending`, `Auto-Rejected`, `Approved`, `Rejected`.
  - Details modal: Sender, Receiver, Amount, KYC Status Check (verified vs non-verified auto-hold), Quota Verification (ensures ≤ 60% migration limit), User 2FA token verification status, Cryptographic Ledger Hash.
  - One-click **Approve** and **Reject** buttons with custom admin notes.
- **Cryptographic Ledger Integrity Badge**: Simulated SHA-256 block hash validation assuring coins cannot be forged or duplicated.

---

## 4. Integration with Platform Admin Console & Client Views

1. **`src/components/AdminSidebar.tsx`**:
   - Register `'coin'` tab in `ADMIN_SECTIONS` under Main Console or Governance.
   - Display coin icon (`Coins`) with native badge indicator.
2. **`src/components/AdminView.tsx`**:
   - Add `'coin'` to `activeTab` union type.
   - Render `<AdminCoinTab />` when `activeTab === 'coin'`.
3. **User Client Enforcement (`WalletView.tsx` / `P2PView.tsx`)**:
   - Check `coinConfig.transfersGloballyEnabled`: If disabled, display high-security governance notification: *"Native DC Coin transfers are currently paused in auto-reject mode by platform administrators."*
   - Check **KYC Verification Status**: If user's account is non-verified, block migration/transfers with notification: *"KYC Verification Required: Your 60% migration quota is placed on Auto-Hold. Please complete identity verification to unlock your coins."*
   - Check **Migration Quota**: Calculate user's max migratable allowance (e.g. 60% of their mined DC). Prevent withdrawals exceeding this limit and clearly display: *"Authorized for Transfer: 60% (XX DC) • Locked in Custody: 40% (XX DC)"*.
   - Prompt user for 2FA confirmation before queueing the transfer into the Admin Pending Review Queue.

---

## 5. Verification & Testing Plan
- Test KYC auto-hold gating: verify that unverified users have their 60% migration quota marked as `Auto-Hold (KYC Required)` and are blocked from withdrawing.
- Test admin KYC approval: approve a user's KYC and verify that their 60% migration quota transitions to `Active Unlocked`.
- Test migration policy configuration: update global release percentage slider (e.g. 60%) and verify that individual user balances correctly reflect 60% unlocked / 40% locked.
- Test creating, editing, and deleting reserve allocations.
- Test creating, editing, and unlocking individual account lock rules.
- Test live mining countdown, block discovery incrementer, and active miner telemetry.
- Test transfer submission from client:
  1. Confirm auto-rejection when circuit breaker is active.
  2. Confirm 2FA submission and quota validation (rejecting attempts exceeding 60%).
  3. Confirm pending queue in Admin Console with one-click approval/rejection.
- Run `compile_applet` and `lint_applet` to guarantee zero TypeScript or React errors.
