import { createSale } from './client';

export interface PendingSaleItem {
  productId: number;
  quantity: number;
  productName: string;
  price: number;
}

export interface PendingSale {
  localId: string;
  paymentMethod: string;
  items: PendingSaleItem[];
  total: number;
  queuedAt: string;
}

export interface FailedSale extends PendingSale {
  errorMessage: string;
}

const QUEUE_KEY = 'pendingSales';
const FAILED_KEY = 'failedSales';
const STOCK_ADJUSTMENTS_KEY = 'localStockAdjustments';

export function getPendingSales(): PendingSale[] {
  const raw = localStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function savePendingSales(sales: PendingSale[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(sales));
}

export function getFailedSales(): FailedSale[] {
  const raw = localStorage.getItem(FAILED_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveFailedSales(sales: FailedSale[]) {
  localStorage.setItem(FAILED_KEY, JSON.stringify(sales));
}

export function getLocalStockAdjustments(): Record<number, number> {
  const raw = localStorage.getItem(STOCK_ADJUSTMENTS_KEY);
  return raw ? JSON.parse(raw) : {};
}

function saveLocalStockAdjustments(adjustments: Record<number, number>) {
  localStorage.setItem(STOCK_ADJUSTMENTS_KEY, JSON.stringify(adjustments));
}

function releaseLocalStockAdjustment(items: PendingSaleItem[]) {
  const adjustments = getLocalStockAdjustments();
  items.forEach((item) => {
    if (adjustments[item.productId] != null) {
      adjustments[item.productId] -= item.quantity;
      if (adjustments[item.productId] <= 0) delete adjustments[item.productId];
    }
  });
  saveLocalStockAdjustments(adjustments);
}

export function queueSale(paymentMethod: string, items: PendingSaleItem[], total: number): void {
  const sales = getPendingSales();
  const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  sales.push({ localId, paymentMethod, items, total, queuedAt: new Date().toISOString() });
  savePendingSales(sales);

  const adjustments = getLocalStockAdjustments();
  items.forEach((item) => {
    adjustments[item.productId] = (adjustments[item.productId] || 0) + item.quantity;
  });
  saveLocalStockAdjustments(adjustments);
}

export function isNetworkError(err: unknown): boolean {
  return err instanceof TypeError;
}

let syncing = false;

export async function trySyncPendingSales(onSynced?: (count: number) => void): Promise<void> {
  if (syncing) return;
  const sales = getPendingSales();
  if (sales.length === 0) return;

  syncing = true;
  let syncedCount = 0;
  const stillPending: PendingSale[] = [];
  const newlyFailed: FailedSale[] = [];

  for (const sale of sales) {
    try {
      await createSale(
        sale.paymentMethod,
        sale.items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
      );
      syncedCount++;
      releaseLocalStockAdjustment(sale.items);
    } catch (err) {
      if (isNetworkError(err)) {
        stillPending.push(sale);
      } else {
        newlyFailed.push({
          ...sale,
          errorMessage: err instanceof Error ? err.message : 'Sync failed',
        });
        releaseLocalStockAdjustment(sale.items);
      }
    }
  }

  savePendingSales(stillPending);
  if (newlyFailed.length > 0) {
    saveFailedSales([...getFailedSales(), ...newlyFailed]);
  }
  syncing = false;
  if (syncedCount > 0 && onSynced) onSynced(syncedCount);
}