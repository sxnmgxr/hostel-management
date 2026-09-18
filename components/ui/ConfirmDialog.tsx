'use client'

export function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-600 mt-2">{message}</p>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onCancel} className="px-4 py-2 rounded-md text-sm font-medium border border-slate-300 hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-md text-sm font-medium bg-red-700 text-white hover:bg-red-800">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}