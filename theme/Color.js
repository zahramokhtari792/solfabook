const palate = [
    {
        //purple
        color: "#961d5a",
        bgColor: (opacity) => `rgba(150, 29, 90, ${opacity})`,
    },
    {
        //gray
        color: "#9C9C9C",
        bgColor: (opacity) => `rgba(156, 156, 156, ${opacity})`,
    },
    {
        //blue
        color: "#082D81",
        bgColor: (opacity) => `rgba(8, 45, 129, ${opacity})`,
    },
    {
        //gray
        color: "#999999",
        bgColor: (opacity) => `rgba(129, 127, 127, ${opacity})`,
    },
    {
        //white
        color: "#FFFFFF",
        bgColor: (opacity) => `rgba(255, 255, 255, ${opacity})`,
    },
    {
        //background white
        color: "#FFFFFF",
        bgColor: (opacity) => `rgba(255, 255, 255, ${opacity})`,
    },
    {
        //red
        color: "#D12929",
        bgColor: (opacity) => `rgba(209, 41, 41, ${opacity})`,
    },
    {
        //green
        color: "green",
        bgColor: (opacity) => `rgba(0, 128, 0, ${opacity})`,
    },
    {
        //blue
        color: "#6495ED",
        bgColor: (opacity) => `rgba(100, 149, 237, ${opacity})`,
    },
    {
        //purple
        color: "#6C3BAA",
        bgColor: (opacity) => `rgba(108, 59, 170, ${opacity})`,
    },
    {
        //black
        color: "#000000",
        bgColor: (opacity) => `rgba(0, 0, 0, ${opacity})`,
    },
    {
        //orange
        color: "#ee8a00",
        bgColor: (opacity) => `rgba(238, 138, 0, ${opacity})`,
    },
    {
        //dark gray
        color: "#F3AF00",
        bgColor: (opacity) => `rgba(243, 175, 0, ${opacity})`,
    },
];

export const themeColor0 = {
    //purple
    ...palate[0],
};

export const themeColor1 = {
    //gray
    ...palate[1],
};

export const themeColor2 = {
    //mid gray
    ...palate[2],
};

export const themeColor3 = {
    //gray
    ...palate[3],
};

export const themeColor4 = {
    //white
    ...palate[4],
};

export const themeColor5 = {
    //background white
    ...palate[5],
};

export const themeColor6 = {
    //red
    ...palate[6],
};

export const themeColor7 = {
    //green
    ...palate[7],
};

export const themeColor8 = {
    //blue
    ...palate[8],
};

export const themeColor9 = {
    //purple
    ...palate[9],
};

export const themeColor10 = {
    //black
    ...palate[10],
};

export const themeColor11 = {
    //orange
    ...palate[11],
};

export const themeColor12 = {
    //dark gray
    ...palate[12],
};

// Semantic colors for the Light / Dark UI.
// Keep themeColor0..themeColor12 above unchanged for existing imports and bgColor(opacity).
// The light palette reuses the actual legacy bgColor() outputs, including their rgba format.
// Both "primary" and "primaryText" retain the exact legacy brand purple in each theme.
// A surface color must never be used as the foreground of a primary button: use onPrimary.
export const themePalettes = Object.freeze({
    light: Object.freeze({
        primary: themeColor0.bgColor(1),
        primaryText: themeColor0.bgColor(1),
        onPrimary: themeColor4.bgColor(1),
        background: themeColor5.bgColor(1),
        surface: themeColor4.bgColor(1),
        inputBackground: themeColor4.bgColor(1),
        text: themeColor10.bgColor(1),
        textSecondary: themeColor1.bgColor(1),
        textMuted: themeColor3.bgColor(1),
        textInverse: themeColor4.bgColor(1),
        border: themeColor3.bgColor(0.2),
        overlay: themeColor10.bgColor(0.5),
        shadow: themeColor3.bgColor(1),
        danger: themeColor6.bgColor(1),
        success: themeColor7.bgColor(1),
        warning: themeColor11.bgColor(1),
    }),
    dark: Object.freeze({
        primary: themeColor0.bgColor(1),
        primaryText: themeColor0.bgColor(1),
        onPrimary: '#FFFFFF',
        background: '#121212',
        surface: '#242424',
        inputBackground: '#292929',
        text: '#F5F5F5',
        textSecondary: '#B3B3B3',
        textMuted: '#969696',
        textInverse: '#FFFFFF',
        border: 'rgba(255, 255, 255, 0.14)',
        overlay: 'rgba(0, 0, 0, 0.65)',
        shadow: '#000000',
        danger: '#EF7777',
        success: '#63C68B',
        warning: '#FFB74D',
    }),
});
