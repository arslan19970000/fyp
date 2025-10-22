"use client"

import { useAuth } from "@/stores/auth-store"
import { useEffect, useState } from "react"

export default function DebugPage() {
  const { user, token, isAuthenticated, isSeller, isAdmin, isBuyer } = useAuth()
  const [localStorageData, setLocalStorageData] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('ecommerce-auth')
      if (data) {
        setLocalStorageData(JSON.parse(data))
      }
    }
  }, [])

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Debug Authentication</h1>

      <div className="space-y-6">
        {/* Auth Store State */}
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold text-lg mb-3">Auth Store State</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Has Token:</strong> {token ? '✅ Yes' : '❌ No'}</p>
            <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}</p>
          </div>
        </div>

        {/* Role Checks */}
        {user && (
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold text-lg mb-3">Role Checks</h2>
            <div className="space-y-2 text-sm">
              <p><strong>User Role:</strong> {user.role}</p>
              <p><strong>Is Seller:</strong> {isSeller() ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Is Admin:</strong> {isAdmin() ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Is Buyer:</strong> {isBuyer() ? '✅ Yes' : '❌ No'}</p>
              {user.shopName && <p><strong>Shop Name:</strong> {user.shopName}</p>}
            </div>
          </div>
        )}

        {/* LocalStorage */}
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold text-lg mb-3">LocalStorage Data</h2>
          <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-auto">
            {localStorageData ? JSON.stringify(localStorageData, null, 2) : 'No data'}
          </pre>
        </div>

        {/* Token in localStorage */}
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold text-lg mb-3">Token</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Token from Auth Store:</strong> {token ? '✅ Yes' : '❌ No'}</p>
            <p className="text-xs text-muted-foreground break-all">
              Token: {token ? token.substring(0, 50) + '...' : 'null'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold text-lg mb-3">Actions</h2>
          <div className="space-y-2">
            {!isAuthenticated ? (
              <p className="text-sm text-muted-foreground">
                You need to <a href="/login" className="text-blue-600 underline">login</a> or{' '}
                <a href="/signup" className="text-blue-600 underline">sign up</a> first.
              </p>
            ) : (
              <>
                {isSeller() || isAdmin() ? (
                  <a href="/seller" className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Go to Seller Dashboard
                  </a>
                ) : (
                  <p className="text-sm text-red-600">
                    ❌ Your role is "{user?.role}" - you need to be a "seller" to access the seller dashboard.
                    <br />
                    <span className="text-xs">You signed up as a buyer. Please create a new account with the seller role.</span>
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
