import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export function useInfiniteCollection(collectionName: string, filters: Record<string, string> = {}) {
    const { currentUser } = useAuth();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [total, setTotal] = useState(0);
    const limit = 50;

    const buildUrl = (offset: number) => {
        const query = new URLSearchParams({
            paginated: 'true',
            limit: String(limit),
            offset: String(offset),
        });
        Object.entries(filters).forEach(([k, v]) => {
            if (v) query.append(k, v);
        });
        return `/api/collections/${collectionName}?${query.toString()}`;
    };

    const filtersString = JSON.stringify(filters);

    const fetchPage = useCallback(async (offset: number, replace = false) => {
        if (loading || !currentUser) return;
        setLoading(true);
        try {
            const res = await fetch(buildUrl(offset), {
                headers: {
                    'X-Tenant-ID': 'srv-001',
                    'X-User-Level': String(currentUser.level || 1),
                    'X-User-ID': String(currentUser.id || 'unknown'),
                }
            });
            if (res.ok) {
                const json = await res.json();
                const items = json.data || [];
                setTotal(json.total || 0);
                setData(prev => replace ? items : [...prev, ...items]);
                setHasMore(items.length >= limit);
            }
        } catch (e) {
            console.error('Infinite Fetch Error', e);
        } finally {
            setLoading(false);
        }
    }, [collectionName, currentUser, filtersString]);

    useEffect(() => {
        setHasMore(true);
        fetchPage(0, true);
    }, [fetchPage]);

    const fetchNextPage = useCallback(() => {
        if (hasMore && !loading) {
            fetchPage(data.length);
        }
    }, [hasMore, loading, data.length, fetchPage]);

    const refresh = useCallback(() => {
        setHasMore(true);
        fetchPage(0, true);
    }, [fetchPage]);

    return { data, loading, hasMore, fetchNextPage, total, refresh };
}
