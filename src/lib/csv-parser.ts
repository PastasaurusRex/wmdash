import Papa from 'papaparse';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Post, Network, PostType, FollowerData } from '@/types/post';

dayjs.extend(customParseFormat);

interface RawCSVRow {
    'Post ID': string;
    'Network': string;
    'Published time (America/Toronto)': string;
    'Post Type': string;
    'Placement': string;
    'Boosted': string;
    'Post text': string;
    'Post URL': string;
    'Impressions': string;
    'Engagements': string;
    'Reach': string;
    'Engagement rate': string;
    [key: string]: string;
}


export const fetchAndParseData = async (): Promise<Post[]> => {
    try {
        const response = await fetch('/wm2025.csv');
        if (!response.ok) {
            throw new Error(`Failed to fetch CSV: ${response.statusText}`);
        }
        const csvString = await response.text();
        const result = Papa.parse(csvString, {
            header: true,
            skipEmptyLines: true,
        });

        return (result.data as RawCSVRow[]).map((row) => {
            const parsePercentage = (val: string): number => {
                if (!val) return 0;
                const parsed = parseFloat(val.replace('%', ''));
                return isNaN(parsed) ? 0 : parsed / 100;
            };

            const parseNumber = (val: string): number => {
                if (!val || val === '-' || val === '') return 0;
                const parsed = parseInt(val.replace(/,/g, ''));
                return isNaN(parsed) ? 0 : parsed;
            };

            // Date formats vary: "MMM DD" or "YYYY-MM-DD HH:mm:ss"
            const dateStr = row['Published time (America/Toronto)'];
            let publishedAt: Date;
            
            // Detect ISO-like format by hyphen
            if (dateStr && dateStr.includes('-')) {
                publishedAt = dayjs(dateStr).toDate();
            } else {
                // Fallback to MMM DD
                const parsed = dayjs(dateStr, 'MMM DD');
                const month = parsed.month(); // 0 = January
                const year = month === 0 ? 2026 : 2025;
                publishedAt = parsed.year(year).toDate();
            }

            // Fiscal year calculation: 
            // FY26: Feb 2025 to Jan 2026
            // FY27: Feb 2026 to Jan 2027
            const d = dayjs(publishedAt);
            const m = d.month(); // 0-indexed
            const y = d.year();
            const fyYear = m >= 1 ? y + 1 : y; // Feb (1) to Dec (11) -> year + 1; Jan (0) -> year
            const fiscalYear = `FY${fyYear.toString().slice(-2)}`;

            return {
                id: row['Post ID'],
                network: row['Network'] as Network,
                publishedAt,
                postType: row['Post Type'] as PostType,
                placement: row['Placement'],
                boosted: row['Boosted'] === 'Yes',
                text: row['Post text'] || '',
                url: row['Post URL'] || '',
                impressions: parseNumber(row['Impressions']),
                reach: row['Reach'] === '-' ? null : parseNumber(row['Reach']),
                engagementRate: parsePercentage(row['Engagement rate']),
                engagements: parseNumber(row['Engagements']),
                fiscalYear,
            };
        });
    } catch (error) {
        console.error('Error fetching/parsing CSV data:', error);
        throw error;
    }
};

interface RawFollowerRow {
    'Date': string;
    'FB followers': string;
    'IG followers': string;
    'TT followers': string;
}

export const fetchFollowerData = async (): Promise<FollowerData[]> => {
    try {
        const response = await fetch('/wm-followers.csv');
        if (!response.ok) {
            throw new Error(`Failed to fetch followers CSV: ${response.statusText}`);
        }
        const csvString = await response.text();
        const result = Papa.parse(csvString, {
            header: true,
            skipEmptyLines: true,
        });

        return (result.data as RawFollowerRow[]).map((row) => {
            const parseNumber = (val: string): number => {
                if (!val || val === '-' || val === '') return 0;
                return parseInt(val.replace(/,/g, ''));
            };

            const date = dayjs(row['Date']).toDate();
            
            // Fiscal year calculation: 
            const d = dayjs(date);
            const m = d.month(); // 0-indexed
            const y = d.year();
            const fyYear = m >= 1 ? y + 1 : y; // Feb (1) to Dec (11) -> year + 1; Jan (0) -> year
            const fiscalYear = `FY${fyYear.toString().slice(-2)}`;

            return {
                date,
                month: dayjs(date).format('MMMM'),
                facebook: parseNumber(row['FB followers']),
                instagram: parseNumber(row['IG followers']),
                tiktok: parseNumber(row['TT followers']),
                fiscalYear,
            };
        });
    } catch (error) {
        console.error('Error fetching/parsing follower data:', error);
        throw error;
    }
};
