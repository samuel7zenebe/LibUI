import { useEffect, useRef } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="rounded-lg p-6 backdrop:bg-black/40 w-96"
      onCancel={onCancel} // ESC key
    >
      <h2 className="text-lg font-semibold mb-3">{title}</h2>

      {description && (
        <p className="text-sm text-gray-600 mb-6">{description}</p>
      )}

      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-1 border rounded">
          Cancel
        </button>

        <button
          onClick={onConfirm}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          Confirm
        </button>
      </div>
    </dialog>
  );
}
