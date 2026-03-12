'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartLineUp } from '@phosphor-icons/react/dist/ssr/ChartLineUp';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useData } from '@/lib/data-context';
import { FollowerData } from '@/types/post';

const PLATFORM_COLORS: Record<string, string> = {
    facebook: '#1d4ed8', // blue-700
    instagram: '#db2777', // pink-600
    tiktok: '#000000',    // black
};

type Platform = 'facebook' | 'instagram' | 'tiktok';

export const FollowersChart: React.FC = () => {
    const { filteredFollowerData, isLoading } = useData();
    const [selectedPlatform, setSelectedPlatform] = useState<Platform>('facebook');

    const bounds = useMemo(() => {
        if (filteredFollowerData.length === 0) return { min: 0, max: 100 };
        const values = filteredFollowerData.map((d: FollowerData) => d[selectedPlatform]);
        const min = Math.min(...values);
        const max = Math.max(...values);
        // Add 5% padding to the top and bottom
        const padding = (max - min) * 0.05 || max * 0.05;
        return {
            min: Math.floor(Math.max(0, min - padding)),
            max: Math.ceil(max + padding)
        };
    }, [filteredFollowerData, selectedPlatform]);

    if (isLoading) {
        return (
            <Card className="w-full border-border/50 animate-in" style={{ animationDelay: '800ms' }}>
                <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <ChartLineUp className="w-5 h-5 text-primary" />
                        Follower Trends
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full border-border/50 animate-in" style={{ animationDelay: '800ms' }}>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <ChartLineUp className="w-5 h-5 text-primary" />
                        Follower Trends
                    </CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest">
                        Monthly growth across social platforms
                    </CardDescription>
                </div>
                <div className="flex bg-muted/50 rounded-lg p-1 border border-border/50">
                    {(['facebook', 'instagram', 'tiktok'] as Platform[]).map((p) => (
                        <Button
                            key={p}
                            variant={selectedPlatform === p ? 'secondary' : 'ghost'}
                            size="sm"
                            className={`h-7 px-3 text-[10px] font-bold uppercase tracking-wider transition-all ${selectedPlatform === p
                                ? 'bg-background shadow-sm border border-border/50'
                                : 'text-muted-foreground'
                                }`}
                            onClick={() => setSelectedPlatform(p)}
                        >
                            <div
                                className="w-1.5 h-1.5 rounded-full mr-1.5"
                                style={{ backgroundColor: PLATFORM_COLORS[p] }}
                            />
                            {p}
                        </Button>
                    ))}
                </div>
            </CardHeader>
            <CardContent className="h-[350px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredFollowerData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis
                            domain={[bounds.min, bounds.max]}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                            tickFormatter={(val) => {
                                if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                                if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                                return val;
                            }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600',
                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                            }}
                            formatter={((value: number) => [value.toLocaleString(), selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)]) as never}
                        />
                        <Line
                            type="monotone"
                            dataKey={selectedPlatform}
                            stroke={PLATFORM_COLORS[selectedPlatform]}
                            strokeWidth={3}
                            dot={{ r: 4, fill: PLATFORM_COLORS[selectedPlatform], strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                            animationDuration={1500}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};
