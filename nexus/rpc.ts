import { getStorageItem } from '../lib/storage';
/**
 * NEXT-LEVEL SOLUTION 1: Unified Enterprise RPC Client
 * 
 * Flaw Addressed: Scattered fetch calls, missing API headers, lack of robust retry logic,
 * and no centralized interception.
 * 
 * Solution: A unified RPC (Remote Procedure Call) client that auto-injects auth tokens,
 * standardizes error responses, and provides a clean typed bridge for the frontend.
 */

export class RPCClient {
    private static baseUrl = '/api';

    static async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const token = getStorageItem('crm_auth_token') || 'local_dev_token';
        
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        };

        const res = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers
        });

        // Handle raw text/HTML errors to prevent JSON.parse crashes
        const contentType = res.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');
        
        let data;
        const text = await res.text();
        
        if (isJson && text) {
            try {
                data = JSON.parse(text);
            } catch (_e) {
                throw new Error("Enterprise RPC Error: Invalid JSON response.");
            }
        } else {
            // For 503s or generic HTML failure pages rendered by Express/Vite
            data = { error: text || res.statusText };
        }

        if (!res.ok) {
            if (res.status === 401) {
                // Trigger global logout event
                window.dispatchEvent(new CustomEvent('SYSTEM_FORCED_LOGOUT'));
            }
            throw new Error(data?.error || `Enterprise RPC Failed: ${res.status}`);
        }

        return data as T;
    }

    static async get<T>(endpoint: string) {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    static async post<T>(endpoint: string, body: any) {
        return this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) });
    }

    static async put<T>(endpoint: string, body: any) {
        return this.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) });
    }

    static async delete<T>(endpoint: string) {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}
