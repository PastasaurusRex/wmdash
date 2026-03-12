'use client';

import React from 'react';
import { useData } from '@/lib/data-context';
import { Network, PostType } from '@/types/post';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { DeviceMobile } from '@phosphor-icons/react/dist/ssr/DeviceMobile';
import { MapPin } from '@phosphor-icons/react/dist/ssr/MapPin';
import { X } from '@phosphor-icons/react/dist/ssr/X';
import { Globe } from '@phosphor-icons/react/dist/ssr/Globe';
import { Calendar as CalendarIcon } from '@phosphor-icons/react/dist/ssr/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { WeeklyFilter } from '@/components/weekly-filter';
import dayjs from 'dayjs';

const MONTHS = [
    'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December', 'January'
];

export const FiltersBar: React.FC = () => {
    const { filters, setFilters, allPlacements, allFYs } = useData();

    const toggleNetwork = (network: Network) => {
        setFilters(prev => ({
            ...prev,
            networks: prev.networks.includes(network)
                ? prev.networks.filter(n => n !== network)
                : [...prev.networks, network]
        }));
    };

    const togglePostType = (type: PostType) => {
        setFilters(prev => ({
            ...prev,
            postTypes: prev.postTypes.includes(type)
                ? prev.postTypes.filter(t => t !== type)
                : [...prev.postTypes, type]
        }));
    };

    const togglePlacement = (placement: string) => {
        setFilters(prev => ({
            ...prev,
            placements: prev.placements.includes(placement)
                ? prev.placements.filter(p => p !== placement)
                : [...prev.placements, placement]
        }));
    };

    const toggleMonth = (month: string) => {
        setFilters(prev => ({
            ...prev,
            selectedMonths: prev.selectedMonths.includes(month)
                ? prev.selectedMonths.filter(m => m !== month)
                : [...prev.selectedMonths, month]
        }));
    };

    const toggleFY = (fy: string) => {
        setFilters(prev => ({
            ...prev,
            selectedFYs: prev.selectedFYs.includes(fy)
                ? prev.selectedFYs.filter(f => f !== fy)
                : [...prev.selectedFYs, fy]
        }));
    };

    const resetFilters = () => {
        setFilters({
            networks: [],
            postTypes: [],
            placements: [],
            selectedMonths: [],
            selectedWeeks: [],
            selectedFYs: ['FY27'],
            searchQuery: '',
            dateRange: undefined,
        });
    };

    return (
        <div className="space-y-4 animate-in" style={{ animationDelay: '200ms' }}>
            <div className="flex flex-wrap items-center gap-3">
                {/* Network Filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9 gap-2">
                            <Globe className="w-4 h-4" />
                            Network
                            {filters.networks.length > 0 && (
                                <Badge variant="secondary" className="ml-1 rounded-sm px-1 font-normal">
                                    {filters.networks.length}
                                </Badge>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[200px]">
                        <DropdownMenuLabel>Social Platforms</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {['TIKTOK', 'INSTAGRAM'].map((n) => (
                            <DropdownMenuCheckboxItem
                                key={n}
                                checked={filters.networks.includes(n as Network)}
                                onCheckedChange={() => toggleNetwork(n as Network)}
                            >
                                {n}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Post Type Filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9 gap-2">
                            <DeviceMobile className="w-4 h-4" />
                            Post Type
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[200px]">
                        <DropdownMenuLabel>Content Format</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {['VIDEO', 'IMAGE', 'REELS', 'CAROUSEL', 'TEXT'].map((t) => (
                            <DropdownMenuCheckboxItem
                                key={t}
                                checked={filters.postTypes.includes(t as PostType)}
                                onCheckedChange={() => togglePostType(t as PostType)}
                            >
                                {t}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Placement Filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9 gap-2">
                            <MapPin className="w-4 h-4" />
                            Placement
                            {filters.placements.length > 0 && (
                                <Badge variant="secondary" className="ml-1 rounded-sm px-1 font-normal">
                                    {filters.placements.length}
                                </Badge>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[200px]">
                        <DropdownMenuLabel>Ad Placement</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {allPlacements.map((p) => (
                            <DropdownMenuCheckboxItem
                                key={p}
                                checked={filters.placements.includes(p)}
                                onCheckedChange={() => togglePlacement(p)}
                            >
                                {p}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Weekly Filter */}
                <WeeklyFilter />

                {/* Date Range Filter */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                                "h-9 justify-start text-left font-bold text-[11px] uppercase tracking-wider gap-2 border-border/50",
                                !filters.dateRange && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="w-4 h-4" />
                            {filters.dateRange?.from ? (
                                filters.dateRange.to ? (
                                    <>
                                        {dayjs(filters.dateRange.from).format("MMM DD")} -{" "}
                                        {dayjs(filters.dateRange.to).format("MMM DD")}
                                    </>
                                ) : (
                                    dayjs(filters.dateRange.from).format("MMM DD")
                                )
                            ) : (
                                <span>Date Range</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={filters.dateRange?.from}
                            selected={filters.dateRange}
                            onSelect={(range) => setFilters(prev => ({ ...prev, dateRange: range }))}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>

                {/* Reset */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                    onClick={resetFilters}
                >
                    <X className="w-4 h-4 mr-2" />
                    Reset All
                </Button>
            </div>

            {/* Month Selector */}
            <div className="relative">
                <ScrollArea className="w-full">
                    <div className="flex gap-2 pb-2">
                        {MONTHS.map((month) => {
                            const isSelected = filters.selectedMonths.includes(month);
                            return (
                                <Button
                                    key={month}
                                    variant={isSelected ? 'default' : 'outline'}
                                    size="sm"
                                    className={`h-8 px-4 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${isSelected
                                        ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                                        : 'text-muted-foreground hover:border-primary/50'
                                        }`}
                                    onClick={() => toggleMonth(month)}
                                >
                                    {month}
                                </Button>
                            );
                        })}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>

            {/* FY Selector */}
            <div className="relative">
                <ScrollArea className="w-full">
                    <div className="flex gap-2 pb-2">
                        {allFYs.map((fy) => {
                            const isSelected = filters.selectedFYs.includes(fy);
                            return (
                                <Button
                                    key={fy}
                                    variant={isSelected ? 'default' : 'outline'}
                                    size="sm"
                                    className={`h-8 px-6 rounded-full text-[12px] font-black tracking-widest transition-all ${isSelected
                                        ? 'bg-secondary text-secondary-foreground border-secondary shadow-md shadow-secondary/20 scale-105'
                                        : 'text-muted-foreground hover:border-secondary/50'
                                        }`}
                                    onClick={() => toggleFY(fy)}
                                >
                                    {fy}
                                </Button>
                            );
                        })}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
        </div>
    );
};
