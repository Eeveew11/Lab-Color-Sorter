export const COLORS = [
    { label: 'red', center: [220, 55, 55] },
    { label: 'green', center: [55, 185, 75] },
    { label: 'blue', center: [55, 100, 220] },
];

const VARIATION = 45;

function variedChannel(center) {
    const variation = Math.round(Math.random() * VARIATION * 2 - VARIATION);
    return Math.max(0, Math.min(255, center + variation));
}

export function createColorExample(color) {
    const [red, green, blue] = color.center.map(variedChannel);
    return { red, green, blue, label: color.label };
}

export function createGameColors(count) {
    return Array.from({ length: count }, () => {
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        return { ...createColorExample(color), bin: null, element: null };
    });
}

export function toCssColor({ red, green, blue }) {
    return `rgb(${red}, ${green}, ${blue})`;
}
