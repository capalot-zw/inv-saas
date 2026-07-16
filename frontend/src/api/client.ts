import type { Product } from '../types';

const BASE_URL = 'https://inv-saas.onrender.com/api';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Token ${token}` } : {};
}

async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data.error || JSON.stringify(data);
  } catch {
    return `Server error (${response.status})`;
  }
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

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
}

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(`${BASE_URL}/products/`);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
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
    throw new Error(await parseErrorResponse(response));
  }
  return response.json();
}

export interface NewProduct {
  name: string;
  quantity: number;
  price: number;
  sku: string;
  category?: string;
  description?: string;
}

export async function createProduct(product: NewProduct): Promise<Product> {
  const response = await fetch(`${BASE_URL}/products/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(product),
  });
  if (!response.ok) {
    throw new Error(await parseErrorResponse(response));
  }
  return response.json();
}

export async function deleteProduct(productId: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/products/${productId}/`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  });
  if (!response.ok) {
    throw new Error(await parseErrorResponse(response));
  }
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
    throw new Error(await parseErrorResponse(response));
  }
}

export interface SaleItemDetail {
  id: number;
  product: number;
  product_name: string;
  quantity: number;
  price_at_sale: string;
}

export interface Sale {
  id: number;
  total: string;
  payment_method: string;
  time_stamp: string;
  synced: boolean;
  cashier: number;
  cashier_username?: string;
  items: SaleItemDetail[];
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

export async function fetchAllSales(): Promise<Sale[]> {
  const response = await fetch(`${BASE_URL}/sales/all/`, {
    headers: { ...getAuthHeaders() },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch all sales');
  }
  return response.json();
}

export interface BusinessSettings {
  business_name: string;
  logo: string | null;
  receipt_header: string | null;
  receipt_footer: string | null;
}

export async function fetchBusinessSettings(): Promise<BusinessSettings | null> {
  const response = await fetch(`${BASE_URL}/core/`);
  if (!response.ok) return null;
  const data = await response.json();
  return data.length > 0 ? data[0] : null;
}

export interface TopProduct {
  product__id: number;
  product__name: string;
  total_sold: number;
}

export async function fetchTopProducts(): Promise<TopProduct[]> {
  const response = await fetch(`${BASE_URL}/sales/top-products/`, {
    headers: { ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error('Failed to fetch top products');
  return response.json();
}

export interface StaffUser {
  id: number;
  username: string;
  role: string;
}

export async function fetchStaff(): Promise<StaffUser[]> {
  const response = await fetch(`${BASE_URL}/users/`, {
    headers: { ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error('Failed to fetch staff');
  return response.json();
}

export async function createStaff(username: string, password: string, role: string): Promise<StaffUser> {
  const response = await fetch(`${BASE_URL}/users/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ username, password, role }),
  });
  if (!response.ok) {
    throw new Error(await parseErrorResponse(response));
  }
  return response.json();
}

export async function updateStaffRole(userId: number, role: string): Promise<StaffUser> {
  const response = await fetch(`${BASE_URL}/users/${userId}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ role }),
  });
  if (!response.ok) {
    throw new Error(await parseErrorResponse(response));
  }
  return response.json();
}

export async function resetStaffPassword(userId: number, newPassword: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/users/${userId}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ password: newPassword }),
  });
  if (!response.ok) {
    throw new Error(await parseErrorResponse(response));
  }
}

export async function deleteStaff(userId: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/users/${userId}/`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  });
  if (!response.ok) {
    throw new Error(await parseErrorResponse(response));
  }
}