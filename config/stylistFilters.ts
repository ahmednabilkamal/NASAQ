import AsyncStorage from '@react-native-async-storage/async-storage';

export const STYLIST_FILTERS_KEY = '@venus_stylists_filters_v1';

export interface StylistFilters {
    minPrice: number;
    maxPrice: number;
    selectedStyleIds: string[];
}

export const defaultStylistFilters: StylistFilters = {
    minPrice: 0,
    maxPrice: 720,
    selectedStyleIds: [],
};

export const saveStylistFilters = async (filters: StylistFilters): Promise<void> => {
    await AsyncStorage.setItem(STYLIST_FILTERS_KEY, JSON.stringify(filters));
};

export const loadStylistFilters = async (): Promise<StylistFilters> => {
    try {
        const raw = await AsyncStorage.getItem(STYLIST_FILTERS_KEY);
        if (!raw) return defaultStylistFilters;

        const parsed = JSON.parse(raw) as Partial<StylistFilters>;
        return {
            minPrice: typeof parsed.minPrice === 'number' ? parsed.minPrice : defaultStylistFilters.minPrice,
            maxPrice: typeof parsed.maxPrice === 'number' ? parsed.maxPrice : defaultStylistFilters.maxPrice,
            selectedStyleIds: Array.isArray(parsed.selectedStyleIds)
                ? parsed.selectedStyleIds.map((id) => String(id))
                : defaultStylistFilters.selectedStyleIds,
        };
    } catch {
        return defaultStylistFilters;
    }
};

export const clearStylistFilters = async (): Promise<void> => {
    await AsyncStorage.removeItem(STYLIST_FILTERS_KEY);
};

