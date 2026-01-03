# Hydration Error Prevention Guide

## 🚨 Common Hydration Error Causes

### 1. **Window/Document Objects**
- **Problem**: `window`, `document`, `localStorage` not available during SSR
- **Solution**: Use `typeof window !== 'undefined'` checks

### 2. **Date/Time Mismatches**
- **Problem**: Server and client render at different times
- **Solution**: Use consistent fallback times

### 3. **Random Values**
- **Problem**: Different random values on server vs client
- **Solution**: Generate random values only client-side

### 4. **Dynamic Styles**
- **Problem**: CSS-in-JS causing different renders
- **Solution**: Use CSS variables or stable styles

## ✅ Implementation Strategies

### 1. **Client-Only Components**
```tsx
import dynamic from 'next/dynamic'

const ClientComponent = dynamic(() => import('./Component'), {
  ssr: false,
  loading: () => <div>Loading...</div>
})
```

### 2. **Hydration Guard Pattern**
```tsx
'use client'
import { useEffect, useState } from 'react'

export default function SafeComponent() {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  if (!isClient) {
    return <div>Loading...</div>
  }
  
  return <div>Client content</div>
}
```

### 3. **Error Boundaries**
```tsx
'use client'
import React from 'react'

class HydrationBoundary extends React.Component {
  static getDerivedStateFromError(error: Error) {
    if (error.message.includes('Hydration')) {
      return { hasHydrationError: true }
    }
    return { hasHydrationError: false }
  }
  
  render() {
    if (this.state.hasHydrationError) {
      return <div>Fallback UI</div>
    }
    return this.props.children
  }
}
```

### 4. **Safe Window Access**
```tsx
const safeWindowAccess = () => {
  if (typeof window === 'undefined') return null
  
  return window.someProperty
}
```

### 5. **Consistent Data Fetching**
```tsx
// Server Component
async function ServerComponent() {
  const data = await fetch('/api/data') // Server-safe
  
  return <ClientComponent initialData={data} />
}

// Client Component
'use client'
function ClientComponent({ initialData }) {
  const [data, setData] = useState(initialData)
  
  // Only update client-side
  useEffect(() => {
    // Client-side updates
  }, [])
}
```

## 🔧 Best Practices

### **DO ✅**
- Use `typeof window !== 'undefined'` checks
- Implement loading states for client-side data
- Use error boundaries for graceful fallbacks
- Separate server and client components
- Use CSS variables for dynamic styling
- Implement proper loading skeletons

### **DON'T ❌**
- Access `window`, `document` without checks
- Use `Math.random()` in renders
- Generate different timestamps on server vs client
- Use localStorage during SSR
- Create dynamic styles that differ between renders

## 🛠️ Quick Fix Checklist

1. **Add window checks**: `if (typeof window !== 'undefined')`
2. **Use hydration guards**: `useEffect(() => setIsClient(true), [])`
3. **Wrap client-only code**: Dynamic imports with `ssr: false`
4. **Add error boundaries**: Catch hydration errors
5. **Test in production**: Hydration errors often only appear in build

## 📋 File Templates

### **Client-Only Hook**
```tsx
import { useEffect, useState } from 'react'

export function useClientOnly<T>(value: T): T | null {
  const [isClient, setIsClient] = useState(false)
  const [clientValue, setClientValue] = useState<T | null>(null)

  useEffect(() => {
    setIsClient(true)
    setClientValue(value)
  }, [value])

  return isClient ? clientValue : null
}
```

### **Safe Date Component**
```tsx
export function SafeDate({ timestamp }: { timestamp: string }) {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  if (!isClient) {
    return <div>Loading time...</div>
  }
  
  return <div>{new Date(timestamp).toLocaleString()}</div>
}
```

### **Dynamic Import Template**
```tsx
import dynamic from 'next/dynamic'

export const ChartComponent = dynamic(
  () => import('./expensive-chart'),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse bg-gray-200 h-64 rounded">
        Loading chart...
      </div>
    )
  }
)
```