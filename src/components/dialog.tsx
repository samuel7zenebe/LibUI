import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

export function Dialog({
  open,
  onClose,
  children,
  className = "",
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const handleClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === ref.current) {
      onClose(); // backdrop click
    }
  };

  return (
    <dialog
      ref={ref}
      onCancel={onClose} // ESC key
      onClose={onClose}
      onClick={handleClick}
      className={`rounded-lg p-6 backdrop:bg-black/40 ${className}`}
    >
      {children}
    </dialog>
  );
}
