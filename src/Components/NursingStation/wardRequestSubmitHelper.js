/**
 * Shared client-side submission helpers for Ward Request screens
 * (Lab, Radiology, Medicine, Implant).
 */

export function createClientRequestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `wreq_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Checks whether an apiRequest failure is a backend same-day duplicate confirmation
 * prompt (HTTP 409 with `duplicate_warning: true`).
 * Returns the confirmation prompt text if applicable, otherwise null.
 */
export function getDuplicateWarningMessage(res) {
  if (res && res.status === 409 && res.data && res.data.duplicate_warning) {
    return (
      res.data.error ||
      "Identical items have already been requested today for this patient. Raise another request anyway?"
    );
  }
  return null;
}
