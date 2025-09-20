import * as React from "react"

type ToastType = "default" | "success" | "error" | "warning" | "info"

type Toast = {
  id: string
  title: string
  description?: string
  type?: ToastType
  duration?: number
}

type ToastOptions = Omit<Toast, "id">

type ToastContextType = {
  toasts: Toast[]
  toast: (options: ToastOptions) => string
  dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | null>(null)

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback(({ title, description, type = "default", duration = 5000 }: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9)
    
    setToasts((currentToasts) => [
      ...currentToasts,
      {
        id,
        title,
        description,
        type,
      },
    ])

    if (duration) {
      setTimeout(() => {
        setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id))
      }, duration)
    }

    return id
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <Toaster toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  )
}

function Toaster({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
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
