"use client"

import * as React from "react"
import { useToast } from "./use-toast"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  if (toasts.length <= 0) return null

  return (
    <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center justify-between gap-4 rounded-md p-4 text-sm font-medium ${
            toast.type === "success"
              ? "bg-green-100 text-green-700"
              : toast.type === "error"
              ? "bg-red-100 text-red-700"
              : toast.type === "warning"
              ? "bg-yellow-100 text-yellow-700"
              : toast.type === "info"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          <div>
            <div className="font-semibold">{toast.title}</div>
            {toast.description && <div className="text-sm opacity-90">{toast.description}</div>}
          </div>
          <button
            onClick={() => dismiss(toast.id)}
            className="opacity-70 hover:opacity-100"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}

export { useToast } from "./use-toast"
