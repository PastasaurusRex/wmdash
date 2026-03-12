'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Post, Filters, DashboardStats, FollowerData } from '@/types/post';
import { fetchAndParseData, fetchFollowerData } from '@/lib/csv-parser';
import { getWalmartWeeks, isDateInWeeks } from '@/lib/week-utils';
import dayjs from 'dayjs';

interface DataContextType {
    posts: Post[];
    filteredPosts: Post[];
    followerData: FollowerData[];
    filteredFollowerData: FollowerData[];
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
    stats: DashboardStats;
    allPlacements: string[];
    allFYs: string[];
    isLoading: boolean;
    error: string | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [followerData, setFollowerData] = useState<FollowerData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<Filters>({
        networks: [],
        postTypes: [],
        placements: [],
        selectedMonths: [],
        selectedWeeks: [],
        selectedFYs: ['FY27'],
        searchQuery: '',
        dateRange: undefined,
    });

    useEffect(() => {
        Promise.all([
            fetchAndParseData(),
            fetchFollowerData()
        ])
            .then(([postsData, followers]) => {
                setPosts(postsData);
                setFollowerData(followers);
                setIsLoading(false);
            })
            .catch((err) => {
                setError(err.message || 'Failed to load dashboard data');
                setIsLoading(false);
            });
    }, []);

    const allWeeks = useMemo(() => getWalmartWeeks(), []);

    const allPlacements = useMemo(() => {
        const placements = new Set<string>();
        posts.forEach((post) => {
            if (post.placement) placements.add(post.placement);
        });
        return Array.from(placements).sort();
    }, [posts]);

    const allFYs = useMemo(() => {
        const fys = new Set<string>();
        posts.forEach((post) => {
            if (post.fiscalYear) fys.add(post.fiscalYear);
        });
        return Array.from(fys).sort((a, b) => b.localeCompare(a)); // Descending order: FY27, FY26
    }, [posts]);

    const filteredPosts = useMemo(() => {
        return posts.filter((post) => {
            if (filters.networks.length > 0 && !filters.networks.includes(post.network)) return false;
            if (filters.postTypes.length > 0 && !filters.postTypes.includes(post.postType)) return false;
            if (filters.placements.length > 0 && !filters.placements.includes(post.placement)) return false;

            if (filters.selectedFYs.length > 0) {
                if (!filters.selectedFYs.includes(post.fiscalYear)) return false;
            }

            if (filters.selectedMonths.length > 0) {
                const postMonth = dayjs(post.publishedAt).format('MMMM');
                if (!filters.selectedMonths.includes(postMonth)) return false;
            }

            if (filters.selectedWeeks.length > 0) {
                if (!isDateInWeeks(post.publishedAt, filters.selectedWeeks, allWeeks)) return false;
            }

            if (filters.dateRange?.from) {
                const postDate = dayjs(post.publishedAt);
                const from = dayjs(filters.dateRange.from).startOf('day');
                if (postDate.isBefore(from)) return false;

                if (filters.dateRange.to) {
                    const to = dayjs(filters.dateRange.to).endOf('day');
                    if (postDate.isAfter(to)) return false;
                }
            }

            if (filters.searchQuery) {
                const q = filters.searchQuery.toLowerCase();
                const match =
                    post.text.toLowerCase().includes(q) ||
                    post.network.toLowerCase().includes(q);
                if (!match) return false;
            }

            return true;
        });
    }, [posts, filters, allWeeks]);

    const filteredFollowerData = useMemo(() => {
        return followerData.filter((data) => {
            if (filters.selectedFYs.length > 0) {
                if (!filters.selectedFYs.includes(data.fiscalYear)) return false;
            }

            if (filters.selectedMonths.length > 0) {
                if (!filters.selectedMonths.includes(data.month)) return false;
            }

            return true;
        });
    }, [followerData, filters.selectedFYs, filters.selectedMonths]);



    const stats = useMemo<DashboardStats>(() => {
        const totalPosts = filteredPosts.length;
        const totalImpressions = filteredPosts.reduce((acc, post) => acc + post.impressions, 0);
        const totalEngagements = filteredPosts.reduce((acc, post) => acc + post.engagements, 0);
        const totalReach = filteredPosts.reduce((acc, post) => acc + (post.reach || 0), 0);

        const avgEngagementRate = totalReach > 0 ? (totalEngagements * 100) / totalReach : 0;

        return {
            totalPosts,
            totalImpressions,
            totalEngagements,
            avgEngagementRate,
        };
    }, [filteredPosts]);

    return (
        <DataContext.Provider
            value={{
                posts,
                filteredPosts,
                followerData,
                filteredFollowerData,
                filters,
                setFilters,
                stats,
                allPlacements,
                allFYs,
                isLoading,
                error,
            }}
        >
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
