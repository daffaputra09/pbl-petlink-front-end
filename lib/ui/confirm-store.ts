export type ConfirmRequest = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

let pending: ConfirmRequest | null = null;
let resolveFn: ((value: boolean) => void) | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribeConfirm(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getConfirmSnapshot(): ConfirmRequest | null {
  return pending;
}

export function confirmAction(request: ConfirmRequest): Promise<boolean> {
  return new Promise((resolve) => {
    pending = request;
    resolveFn = resolve;
    emit();
  });
}

export function finishConfirm(result: boolean) {
  resolveFn?.(result);
  resolveFn = null;
  pending = null;
  emit();
}
