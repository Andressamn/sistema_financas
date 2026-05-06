import Modal from './Modal';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  destructive?: boolean;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  destructive = false,
}: Props) {
  function handleConfirm() {
    onConfirm();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-gray-700 dark:text-gray-300 mb-6">{message}</p>
      <div className="flex gap-2">
        <button onClick={onClose} className="btn-secondary flex-1 py-2.5">
          Cancelar
        </button>
        <button
          onClick={handleConfirm}
          className={
            destructive
              ? 'flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition active:scale-95'
              : 'btn-primary flex-1 py-2.5'
          }
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
