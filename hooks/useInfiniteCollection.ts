import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useSystem } from './useSystem';
import { getStorageItem } from '../lib/storage';

export function useInfiniteCollection(collectionName: string, filters: Record<string, string> = {}) {
    const { currentUser } = useAuth();
    const { activeServer } = useSystem();
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
            const tenantId = activeServer?.id || getStorageItem('nexus_server_id') || currentUser?.serverId || 'srv-001';
            const res = await fetch(buildUrl(offset), {
                headers: {
                    'X-Tenant-ID': tenantId,
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
            } else {
                setHasMore(false);
            }
        } catch (e) {
            console.error('Infinite Fetch Error', e);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [collectionName, currentUser, filtersString, activeServer?.id]);

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
