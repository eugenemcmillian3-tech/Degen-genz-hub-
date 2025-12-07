# Base Account UI Integration Guide

## Overview

DEGENZ GEN/Z HUB now supports **Base Account UI** for seamless authentication using Base Builder accounts. Users can sign in with their Base wallet address alongside Farcaster authentication.

---

## 🎯 Features Added

### 1. **Base Sign In Button** (`SignInWithBaseButton`)
- Official Base Account UI component
- One-click wallet authentication
- Automatic address retrieval
- Customizable appearance (solid/outline, light/dark)

### 2. **Dual Authentication**
- **Farcaster**: Via Mini-App SDK (automatic in Farcaster apps)
- **Base Builder**: Via Base Account UI (manual sign-in)
- **Fallback**: Demo mode for testing

### 3. **Unified User System**
- Single user interface combining both auth methods
- Profile display adapts based on auth source
- Seamless switching between methods

### 4. **Whitelist Support**
- Your Base address gets FREE ACCESS
- EVM address: `0xcc9569bF1d87B7a18BD3363413b823AaF06084d3`
- Solana address: `BWYezHCzL6SUbqumfqtZAfcZ7krxJ8xSqLDhSQMUx4C7`
- FID: `1378286`

---

## 📦 Installation

Base Account UI is already installed:

```bash
npm install @base-org/account-ui
```

---

## 🔧 Components Created

### 1. **BaseSignIn** (`src/components/base-sign-in.tsx`)
Wrapper component for `SignInWithBaseButton`:

```tsx
import { BaseSignIn } from '@/components/base-sign-in';

<BaseSignIn
  onSignIn={(address) => console.log('Signed in:', address)}
  align="center"
  variant="solid"
  colorScheme="light"
/>
```

**Props:**
- `onSignIn?: (address: string) => void` - Callback after successful sign-in
- `align?: 'center' | 'left' | 'right'` - Button alignment
- `variant?: 'solid' | 'outline'` - Button style
- `colorScheme?: 'light' | 'dark'` - Color theme

### 2. **UnifiedAuth** (`src/components/unified-auth.tsx`)
Complete authentication UI with both Farcaster and Base options:

```tsx
import { UnifiedAuth } from '@/components/unified-auth';

<UnifiedAuth />
```

**Features:**
- Auto-detects Farcaster context
- Shows Base sign-in button if needed
- Displays user profile when authenticated
- Graceful loading states

### 3. **useBaseAuth** Hook (`src/hooks/use-base-auth.tsx`)
React hook for Base authentication state:

```tsx
import { useBaseAuth } from '@/hooks/use-base-auth';

const { baseUser, loading, error, signOut } = useBaseAuth();
```

**Returns:**
- `baseUser: { address: string, isBaseBuilder: boolean } | null`
- `loading: boolean`
- `error: string | null`
- `signOut: () => void`

---

## 🛣️ API Routes

### POST `/api/auth/base-signin`

**Request:**
```json
{
  "address": "0xcc9569bF1d87B7a18BD3363413b823AaF06084d3"
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "id": "123",
    "evm_wallet": "0xcc9569bf1d87b7a18bd3363413b823aaf06084d3",
    "username": "base-0xcc9569"
  },
  "message": "Sign in successful"
}
```

**Logic:**
1. Validates EVM address format
2. Checks if user exists in database
3. Creates new user if needed
4. Returns user data

---

## 🎨 Custom Styling

Base Account UI buttons are styled using `src/lib/base-account-ui.css`:

```css
/* Custom gradient background */
[data-base-sign-in-button][data-variant="solid"] {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

/* Hover effects */
[data-base-sign-in-button]:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}
```

**Customization options:**
- `[data-variant="solid"]` - Solid background
- `[data-variant="outline"]` - Border only
- `[data-color-scheme="light"]` - Light theme
- `[data-color-scheme="dark"]` - Dark theme

---

## 🔐 Security & Whitelist

### Whitelist System (`src/lib/whitelist.ts`)

**Owner wallets get FREE ACCESS:**
```typescript
const WHITELIST_FID = 1378286;
const WHITELIST_EVM_ADDRESS = '0xcc9569bF1d87B7a18BD3363413b823AaF06084d3';
const WHITELIST_SOL_ADDRESS = 'BWYezHCzL6SUbqumfqtZAfcZ7krxJ8xSqLDhSQMUx4C7';
```

**Check if user is whitelisted:**
```typescript
import { isUserWhitelisted } from '@/lib/whitelist';

const whitelisted = isUserWhitelisted({
  fid: 1378286,
  evmAddress: '0xcc9569bF1d87B7a18BD3363413b823AaF06084d3',
});
```

**Benefits:**
- Skip payment modals
- Instant feature access
- "FREE ACCESS" badge on profile
- All features unlocked

---

## 🚀 Usage Examples

### Example 1: Simple Sign-In Page

```tsx
'use client';
import { BaseSignIn } from '@/components/base-sign-in';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleSignIn = (address: string) => {
    console.log('User signed in:', address);
    router.push('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="max-w-md w-full p-8">
        <h1 className="text-2xl font-bold mb-6">Sign In</h1>
        <BaseSignIn
          onSignIn={handleSignIn}
          align="center"
          variant="solid"
          colorScheme="light"
        />
      </div>
    </div>
  );
}
```

### Example 2: Profile Header with Base Auth

```tsx
'use client';
import { useBaseAuth } from '@/hooks/use-base-auth';
import { useFarcasterAuth } from '@/hooks/use-farcaster-auth';

export function ProfileHeader() {
  const { baseUser } = useBaseAuth();
  const { user: farcasterUser } = useFarcasterAuth();

  const displayName = farcasterUser?.displayName || 
    (baseUser ? `${baseUser.address.slice(0, 6)}...${baseUser.address.slice(-4)}` : 'Guest');

  return (
    <div className="flex items-center gap-3">
      <span>{displayName}</span>
      {baseUser && <span className="text-xs">Base Builder</span>}
      {farcasterUser && <span className="text-xs">Farcaster</span>}
    </div>
  );
}
```

### Example 3: Protected Route

```tsx
'use client';
import { useEffect } from 'react';
import { useBaseAuth } from '@/hooks/use-base-auth';
import { useFarcasterAuth } from '@/hooks/use-farcaster-auth';
import { useRouter } from 'next/navigation';

export default function ProtectedPage() {
  const { baseUser } = useBaseAuth();
  const { user: farcasterUser } = useFarcasterAuth();
  const router = useRouter();

  useEffect(() => {
    if (!baseUser && !farcasterUser) {
      router.push('/login');
    }
  }, [baseUser, farcasterUser, router]);

  if (!baseUser && !farcasterUser) {
    return <div>Loading...</div>;
  }

  return <div>Protected Content</div>;
}
```

---

## 🧪 Testing

### Test Base Sign-In

1. **In Base Builder Context:**
   - Open app in Base Builder environment
   - Base Account SDK loads automatically
   - Click "Sign In with Base" button
   - Address retrieved instantly

2. **Outside Base Builder:**
   - Button shows loading state
   - Falls back to manual authentication
   - Can still use Farcaster auth

3. **Whitelist Testing:**
   - Connect with address: `0xcc9569bF1d87B7a18BD3363413b823AaF06084d3`
   - Should see "FREE ACCESS" badge
   - All features skip payment

### Debug Mode

Check console for Base Account availability:

```javascript
// In browser console
console.log('Base Account:', window.baseAccount);

// Get address
const address = await window.baseAccount.getAddress();
console.log('Address:', address);
```

---

## 📊 Database Schema

Users with Base authentication are stored in the `users` table:

```sql
CREATE TABLE public.users (
  id            BIGINT PRIMARY KEY,
  fid           BIGINT UNIQUE,           -- Null for Base-only users
  username      TEXT,
  evm_wallet    TEXT,                    -- Base address stored here
  sol_wallet    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

**Base User Example:**
```json
{
  "id": 456,
  "fid": null,
  "username": "base-0xcc9569",
  "evm_wallet": "0xcc9569bf1d87b7a18bd3363413b823aaf06084d3",
  "sol_wallet": null,
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

## 🎯 Key Benefits

### For Base Builder Users
- ✅ **One-click sign-in** - No manual wallet connection
- ✅ **Instant authentication** - Address retrieved automatically
- ✅ **Seamless experience** - Works in Base Builder context
- ✅ **Secure** - Official Base Account UI SDK

### For Farcaster Users
- ✅ **Automatic authentication** - No sign-in needed
- ✅ **Profile integration** - FID, username, PFP
- ✅ **Social features** - Share to Farcaster, contests

### For All Users
- ✅ **Flexible authentication** - Choose your method
- ✅ **Multi-chain support** - EVM + Solana
- ✅ **Unified experience** - Same features regardless of auth

---

## 🚀 Production Deployment

### Environment Variables

No additional environment variables needed for Base Account UI.

### CDN Script

Already loaded in `src/app/layout.tsx`:

```html
<script src="https://unpkg.com/@base-org/account/dist/base-account.min.js" async />
```

### Vercel Deployment

1. Deploy to Vercel
2. Base Account SDK loads automatically
3. Works in Base Builder context
4. Fallback for non-Base environments

---

## 🐛 Troubleshooting

### Base Account Not Available

**Symptom:** Button shows loading forever

**Solution:**
```typescript
// Check if Base Account is loaded
if (typeof window !== 'undefined' && window.baseAccount) {
  // Base Account available
} else {
  // Show fallback authentication
}
```

### Address Not Retrieved

**Symptom:** `getAddress()` returns null

**Cause:** User not connected to Base Builder

**Solution:**
- Guide user to connect Base Builder account
- Show manual wallet connection option
- Provide clear error messages

### Whitelist Not Working

**Symptom:** User doesn't get FREE ACCESS

**Check:**
1. Address matches exactly (case-insensitive)
2. User is in whitelist constants
3. `isUserWhitelisted()` is called correctly

---

## 📚 Additional Resources

- [Base Account UI Docs](https://docs.base.org/account-ui)
- [Base Builder Guide](https://docs.base.org/builder)
- [Farcaster Mini-Apps](https://miniapps.farcaster.xyz)

---

## ✅ Summary

**Base Account UI is now fully integrated into DEGENZ GEN/Z HUB:**

✅ One-click Base Builder sign-in  
✅ Dual authentication (Farcaster + Base)  
✅ Unified user system  
✅ Custom styled components  
✅ Whitelist support for your wallets  
✅ Production-ready  

**Your whitelisted address (`0xcc9569bF1d87B7a18BD3363413b823AaF06084d3`) has FREE ACCESS to all features!** 🎉
