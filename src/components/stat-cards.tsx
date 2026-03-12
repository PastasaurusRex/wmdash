'use client';

import React, { useMemo } from 'react';
import { useData } from '@/lib/data-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CountUp from 'react-countup';
import { FileText } from '@phosphor-icons/react/dist/ssr/FileText';
import { Eye } from '@phosphor-icons/react/dist/ssr/Eye';
import { ChatText } from '@phosphor-icons/react/dist/ssr/ChatText';
import { Percent } from '@phosphor-icons/react/dist/ssr/Percent';
import { UserPlus } from '@phosphor-icons/react/dist/ssr/UserPlus';
import { FacebookLogo } from '@phosphor-icons/react/dist/ssr/FacebookLogo';
import { InstagramLogo } from '@phosphor-icons/react/dist/ssr/InstagramLogo';
import { TiktokLogo } from '@phosphor-icons/react/dist/ssr/TiktokLogo';
import dayjs from 'dayjs';

export const StatCards: React.FC = () => {
    const { stats, filters, followerData } = useData();

    const followerStats = useMemo(() => {
        if (followerData.length === 0) return { value: 0, label: '...', icon: UserPlus };

        // We ignore individual month filters for the "Total Followers" snapshot.
        // Instead, we show the latest data for the selected Fiscal Year(s).
        let relevantData = followerData;
        if (filters.selectedFYs.length > 0) {
            relevantData = followerData.filter(d => filters.selectedFYs.includes(d.fiscalYear));
        }

        // Select the latest available month in the filtered set
        const targetRow = relevantData.length > 0 ? relevantData[relevantData.length - 1] : null;

        if (!targetRow) return { value: 0, label: '...', icon: UserPlus };

        const monthLabel = dayjs(targetRow.date).format('MMMM YYYY');

        // Calculate total based on network filters
        let total = 0;
        const selectedNetworks = filters.networks;
        const noFilter = selectedNetworks.length === 0;

        if (noFilter || selectedNetworks.includes('FACEBOOK')) {
            total += targetRow.facebook || 0;
        }
        if (noFilter || selectedNetworks.includes('INSTAGRAM')) {
            total += targetRow.instagram || 0;
        }
        if (noFilter || selectedNetworks.includes('TIKTOK')) {
            total += targetRow.tiktok || 0;
        }

        // Determine icon
        let icon = UserPlus;
        if (selectedNetworks.length === 1) {
            const net = selectedNetworks[0];
            if (net === 'FACEBOOK') icon = FacebookLogo;
            else if (net === 'INSTAGRAM') icon = InstagramLogo;
            else if (net === 'TIKTOK') icon = TiktokLogo;
        }

        return { value: total, label: `as of ${monthLabel}`, icon };
    }, [followerData, filters.selectedFYs, filters.networks]);

    const cards = [
        {
            title: 'Total Followers',
            value: followerStats.value,
            icon: followerStats.icon,
            color: 'text-primary',
            bg: 'bg-primary/10',
            isPercentage: false,
            subcopy: followerStats.label,
        },
        {
            title: 'Total Posts',
            value: stats.totalPosts,
            icon: FileText,
            color: 'text-primary',
            bg: 'bg-primary/10',
            isPercentage: false,
        },
        {
            title: 'Total Impressions',
            value: stats.totalImpressions,
            icon: Eye,
            color: 'text-primary',
            bg: 'bg-primary/10',
            isPercentage: false,
        },
        {
            title: 'Total Engagements',
            value: stats.totalEngagements,
            icon: ChatText,
            color: 'text-primary',
            bg: 'bg-primary/10',
            isPercentage: false,
        },
        {
            title: 'Avg. Engagement Rate',
            value: stats.avgEngagementRate,
            icon: Percent,
            color: 'text-primary',
            bg: 'bg-primary/10',
            isPercentage: true,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {cards.map((card, i) => (
                <Card key={card.title} className="card-hover border-border/50 animate-in" style={{ animationDelay: `${i * 100}ms` }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {card.title}
                        </CardTitle>
                        <div className={`p-2 rounded-lg ${card.bg}`}>
                            <card.icon className={`w-4 h-4 ${card.color}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold tracking-tight">
                            <CountUp
                                end={card.value}
                                duration={2}
                                separator=","
                                decimals={card.isPercentage ? 2 : 0}
                                suffix={card.isPercentage ? '%' : ''}
                            />
                        </div>
                        {card.subcopy && (
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1 opacity-70">
                                {card.subcopy}
                            </p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
