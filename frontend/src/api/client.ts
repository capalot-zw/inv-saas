import type { Product } from '../types';

const BASE_URL = 'http://127.0.0.1:8000/api';

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(`${BASE_URL}/products/`);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return response.json();
}

export async function login(username: string, password: string): Promise<string> {
  const response = await fetch(`${BASE_URL}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    throw new Error('Invalid username or password');
  }
  const data = await response.json();
  return data.token;
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Token ${token}` } : {};
}
export async function createSale(
  paymentMethod: string,
  items: { productId: number; quantity: number }[]
): Promise<void> {
  const response = await fetch(`${BASE_URL}/sales/checkout/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      payment_method: paymentMethod,
      items: items.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
      })),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Checkout failed');
  }
}

export interface Sale {
  id: number;
  total: string;
  payment_method: string;
  time_stamp: string;
  synced: boolean;
  cashier: number;
}

export async function fetchMySales(): Promise<Sale[]> {
  const response = await fetch(`${BASE_URL}/sales/`, {
    headers: { ...getAuthHeaders() },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch sales');
  }
  return response.json();
}

export interface CurrentUser {
  username: string;
  role: string;
}

export async function fetchCurrentUser(): Promise<CurrentUser> {
  const response = await fetch(`${BASE_URL}/users/me/`, {
    headers: { ...getAuthHeaders() },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch current user');
  }
  return response.json();
}

export async function fetchAllSales(): Promise<Sale[]> {
  const response = await fetch(`${BASE_URL}/sales/all/`, {
    headers: { ...getAuthHeaders() },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch all sales');
  }
  return response.json();
}

export async function updateProductStock(productId: number, quantity: number): Promise<Product> {
  const response = await fetch(`${BASE_URL}/products/${productId}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ quantity }),
  });
  if (!response.ok) {
    throw new Error('Failed to update stock');
  }
  return response.json();
}

export interface BusinessSettings {
  business_name: string;
  receipt_header: string | null;
  receipt_footer: string | null;
}

export async function fetchBusinessSettings(): Promise<BusinessSettings | null> {
  const response = await fetch(`${BASE_URL}/core/`);
  if (!response.ok) return null;
  const data = await response.json();
  return data.length > 0 ? data[0] : null;
}