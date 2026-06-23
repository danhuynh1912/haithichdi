const BOOKING_IDS_STORAGE_KEY = 'haithichdi.booking_ids';
const BOOKING_IDS_CHANGED_EVENT = 'haithichdi.booking_ids.changed';
const MAX_BOOKING_IDS = 50;

function isClient() {
  return typeof window !== 'undefined';
}

function normalizeBookingIds(input: unknown): number[] {
  if (!Array.isArray(input)) return [];

  const unique: number[] = [];
  for (const item of input) {
    const value = Number(item);
    if (!Number.isInteger(value) || value <= 0) continue;
    if (unique.includes(value)) continue;
    unique.push(value);
    if (unique.length >= MAX_BOOKING_IDS) break;
  }

  return unique;
}

function emitBookingIdsChanged() {
  if (!isClient()) return;
  window.dispatchEvent(new Event(BOOKING_IDS_CHANGED_EVENT));
}

function setStoredBookingIds(next: number[]) {
  if (!isClient()) return;
  window.localStorage.setItem(BOOKING_IDS_STORAGE_KEY, JSON.stringify(next));
  emitBookingIdsChanged();
}

export function getStoredBookingIds(): number[] {
  if (!isClient()) return [];

  try {
    const raw = window.localStorage.getItem(BOOKING_IDS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const normalized = normalizeBookingIds(parsed);

    if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
      window.localStorage.setItem(
        BOOKING_IDS_STORAGE_KEY,
        JSON.stringify(normalized),
      );
    }

    return normalized;
  } catch (error) {
    console.error('Cannot parse booking ids from localStorage', error);
    return [];
  }
}

export function saveBookingId(bookingId: number) {
  const value = Number(bookingId);
  if (!Number.isInteger(value) || value <= 0) return;

  const current = getStoredBookingIds();
  const next = [value, ...current.filter((id) => id !== value)].slice(
    0,
    MAX_BOOKING_IDS,
  );
  setStoredBookingIds(next);
}

export function getLatestStoredBookingId() {
  return getStoredBookingIds()[0] ?? null;
}

export function hasStoredBookingIds() {
  return getStoredBookingIds().length > 0;
}

export function subscribeBookingIdsChanged(listener: () => void) {
  if (!isClient()) return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key === BOOKING_IDS_STORAGE_KEY) {
      listener();
    }
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(BOOKING_IDS_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(BOOKING_IDS_CHANGED_EVENT, listener);
  };
}
