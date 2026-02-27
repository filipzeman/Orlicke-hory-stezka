export type IconName =
    | 'TentTree'
    | 'Hotel'
    | 'ShoppingBasket'
    | 'Signpost'
    | 'Coins'
    | 'Mountain'
    | 'TowerControl'
    | 'Building2'
    | 'Bed'
    | 'Utensils'
    | 'Droplets'

interface PointData {
    type: string;
    sleeping: string[];
    food: string[];
    water: boolean;
}

export function getPointIcons(point: PointData): IconName[] {
    const icons: IconName[] = [];

    // --- TYPE MAPPING ---
    const typeMap: Record<string, IconName> = {
        peak: 'Mountain',
        village: 'Building2',
        crossroad: 'Signpost',
    }

    if (typeMap[point.type]) {
        icons.push(typeMap[point.type]);
    }

    // --- SLEEPING MAPPING ---
    const sleepingMap: Record<string, IconName> = {
        tent: "TentTree",
        camp: "TentTree",
        hostel: "Hotel",
        hotel: "Hotel",
        trailangel: "Bed",
    }

    point.sleeping.forEach((s) => {
        const icon = sleepingMap[s];
        if (icon && !icons.includes(icon)) {
            icons.push(icon);
        }
    });

    // --- FOOD MAPPING ---
    const foodMap: Record<string, IconName> = {
        restaurant: "Utensils",
        pub: "Utensils",
        grocery: "ShoppingBasket",
        bakery: "ShoppingBasket",
    };

    point.food.forEach((f) => {
        const icon = foodMap[f];
        if (icon && !icons.includes(icon)) {
            icons.push(icon);
        }
    });

    // --- WATER ---
    if (point.water) {
        icons.push("Droplets");
    }

    return icons;

}