const DEMOGRAPHICS_DATA = (() => {
    const years = [2019, 2020, 2021, 2022, 2023, 2024];
    const ageGroups = [
        { key: 'under18', label: 'Under 18' },
        { key: 'age18to24', label: '18 to 24' },
        { key: 'age25to34', label: '25 to 34' },
        { key: 'age35to44', label: '35 to 44' },
        { key: 'age45to54', label: '45 to 54' },
        { key: 'age55to64', label: '55 to 64' },
        { key: 'age65to74', label: '65 to 74' },
        { key: 'age75plus', label: '75 and over' }
    ];
    const raceGroups = [
        { key: 'white', label: 'White', color: '#4E8446' },
        { key: 'black', label: 'Black', color: '#9CD4DC' },
        { key: 'asian', label: 'Asian', color: '#4A90E2' },
        { key: 'other', label: 'Other / Multiracial', color: '#BEDFB5' }
    ];

    const locationConfigs = {
        'Tyler, TX Metro Area': {
            totalPopulation: 235100,
            populationGrowth: [0, 0.4, 0.9, 1.5, 2.2, 3.0],
            medianAge: 35.9,
            medianAgeStep: 0.08,
            veteranShare: 7.9,
            veteranShareStep: -0.05,
            hispanicShare: 23.0,
            hispanicShareStep: 0.34,
            ageDistribution: { under18: 24.7, age18to24: 9.4, age25to34: 13.8, age35to44: 12.7, age45to54: 12.1, age55to64: 12.0, age65to74: 8.6, age75plus: 6.7 },
            ageShift: { under18: -0.05, age18to24: -0.03, age25to34: 0.03, age35to44: 0.02, age45to54: 0.01, age55to64: 0.01, age65to74: 0.00, age75plus: 0.01 },
            raceComposition: { white: 56.2, black: 11.6, asian: 2.1, other: 30.1 },
            raceShift: { white: -0.20, black: 0.01, asian: 0.03, other: 0.16 }
        },
        'Waco, TX Metro Area': {
            totalPopulation: 285400,
            populationGrowth: [0, 0.5, 1.0, 1.7, 2.5, 3.3],
            medianAge: 34.6,
            medianAgeStep: 0.06,
            veteranShare: 6.9,
            veteranShareStep: -0.04,
            hispanicShare: 28.2,
            hispanicShareStep: 0.29,
            ageDistribution: { under18: 25.6, age18to24: 10.3, age25to34: 15.0, age35to44: 13.0, age45to54: 11.2, age55to64: 10.7, age65to74: 7.9, age75plus: 6.3 },
            ageShift: { under18: -0.04, age18to24: -0.02, age25to34: 0.02, age35to44: 0.02, age45to54: 0.00, age55to64: 0.01, age65to74: 0.00, age75plus: 0.01 },
            raceComposition: { white: 52.8, black: 12.4, asian: 2.0, other: 32.8 },
            raceShift: { white: -0.18, black: 0.01, asian: 0.02, other: 0.15 }
        },
        'Dallas-Fort Worth-Arlington, TX Metro Area': {
            totalPopulation: 7810000,
            populationGrowth: [0, 0.7, 1.4, 2.2, 3.1, 4.0],
            medianAge: 35.1,
            medianAgeStep: 0.08,
            veteranShare: 5.8,
            veteranShareStep: -0.03,
            hispanicShare: 30.4,
            hispanicShareStep: 0.33,
            ageDistribution: { under18: 25.4, age18to24: 9.7, age25to34: 15.6, age35to44: 14.2, age45to54: 12.5, age55to64: 11.4, age65to74: 7.1, age75plus: 4.1 },
            ageShift: { under18: -0.05, age18to24: -0.03, age25to34: 0.05, age35to44: 0.03, age45to54: 0.01, age55to64: 0.00, age65to74: 0.00, age75plus: -0.01 },
            raceComposition: { white: 44.9, black: 15.7, asian: 8.2, other: 31.2 },
            raceShift: { white: -0.22, black: 0.00, asian: 0.05, other: 0.17 }
        },
        'Houston-The Woodlands-Sugar Land, TX Metro Area': {
            totalPopulation: 7140000,
            populationGrowth: [0, 0.8, 1.5, 2.4, 3.2, 4.1],
            medianAge: 34.3,
            medianAgeStep: 0.08,
            veteranShare: 4.7,
            veteranShareStep: -0.03,
            hispanicShare: 36.5,
            hispanicShareStep: 0.29,
            ageDistribution: { under18: 25.8, age18to24: 9.9, age25to34: 15.9, age35to44: 14.0, age45to54: 12.3, age55to64: 10.9, age65to74: 6.9, age75plus: 4.3 },
            ageShift: { under18: -0.05, age18to24: -0.03, age25to34: 0.04, age35to44: 0.03, age45to54: 0.01, age55to64: 0.00, age65to74: 0.00, age75plus: 0.00 },
            raceComposition: { white: 37.2, black: 16.9, asian: 7.9, other: 38.0 },
            raceShift: { white: -0.18, black: 0.00, asian: 0.04, other: 0.14 }
        },
        'Austin-Round Rock-Georgetown, TX Metro Area': {
            totalPopulation: 2460000,
            populationGrowth: [0, 0.9, 1.8, 2.8, 3.9, 5.1],
            medianAge: 33.8,
            medianAgeStep: 0.08,
            veteranShare: 5.2,
            veteranShareStep: -0.03,
            hispanicShare: 33.1,
            hispanicShareStep: 0.31,
            ageDistribution: { under18: 23.5, age18to24: 10.8, age25to34: 18.1, age35to44: 15.0, age45to54: 11.5, age55to64: 9.8, age65to74: 6.7, age75plus: 4.6 },
            ageShift: { under18: -0.06, age18to24: -0.02, age25to34: 0.06, age35to44: 0.03, age45to54: 0.00, age55to64: 0.00, age65to74: 0.00, age75plus: -0.01 },
            raceComposition: { white: 46.1, black: 8.1, asian: 7.6, other: 38.2 },
            raceShift: { white: -0.25, black: 0.00, asian: 0.05, other: 0.20 }
        },
        'San Antonio-New Braunfels, TX Metro Area': {
            totalPopulation: 2640000,
            populationGrowth: [0, 0.7, 1.3, 2.0, 2.8, 3.7],
            medianAge: 34.6,
            medianAgeStep: 0.08,
            veteranShare: 8.2,
            veteranShareStep: -0.05,
            hispanicShare: 44.4,
            hispanicShareStep: 0.26,
            ageDistribution: { under18: 24.6, age18to24: 10.0, age25to34: 14.9, age35to44: 13.2, age45to54: 12.0, age55to64: 11.1, age65to74: 8.2, age75plus: 6.0 },
            ageShift: { under18: -0.05, age18to24: -0.03, age25to34: 0.04, age35to44: 0.02, age45to54: 0.01, age55to64: 0.00, age65to74: 0.00, age75plus: 0.01 },
            raceComposition: { white: 35.8, black: 6.7, asian: 3.1, other: 54.4 },
            raceShift: { white: -0.17, black: 0.00, asian: 0.02, other: 0.15 }
        },
        'Longview, TX Metro Area': {
            totalPopulation: 221000,
            populationGrowth: [0, 0.2, 0.6, 1.1, 1.7, 2.2],
            medianAge: 37.4,
            medianAgeStep: 0.10,
            veteranShare: 8.8,
            veteranShareStep: -0.05,
            hispanicShare: 17.7,
            hispanicShareStep: 0.25,
            ageDistribution: { under18: 23.8, age18to24: 8.8, age25to34: 12.8, age35to44: 11.9, age45to54: 12.0, age55to64: 12.9, age65to74: 10.0, age75plus: 7.8 },
            ageShift: { under18: -0.05, age18to24: -0.03, age25to34: 0.02, age35to44: 0.01, age45to54: 0.01, age55to64: 0.01, age65to74: 0.01, age75plus: 0.02 },
            raceComposition: { white: 62.4, black: 13.5, asian: 1.5, other: 22.6 },
            raceShift: { white: -0.18, black: 0.01, asian: 0.01, other: 0.16 }
        },
        'Beaumont-Port Arthur, TX Metro Area': {
            totalPopulation: 388000,
            populationGrowth: [0, 0.1, 0.4, 0.8, 1.3, 1.8],
            medianAge: 37.9,
            medianAgeStep: 0.09,
            veteranShare: 9.1,
            veteranShareStep: -0.05,
            hispanicShare: 21.9,
            hispanicShareStep: 0.21,
            ageDistribution: { under18: 23.2, age18to24: 8.7, age25to34: 12.1, age35to44: 11.7, age45to54: 12.2, age55to64: 13.1, age65to74: 10.4, age75plus: 8.6 },
            ageShift: { under18: -0.05, age18to24: -0.03, age25to34: 0.02, age35to44: 0.01, age45to54: 0.01, age55to64: 0.01, age65to74: 0.01, age75plus: 0.02 },
            raceComposition: { white: 49.0, black: 19.5, asian: 2.2, other: 29.3 },
            raceShift: { white: -0.17, black: 0.01, asian: 0.02, other: 0.14 }
        }
    };

    function roundTo(value, digits = 1) {
        const factor = 10 ** digits;
        return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
    }

    function normalizeDistribution(source, orderedKeys, digits = 1) {
        const factor = 10 ** digits;
        const normalized = {};
        const total = orderedKeys.reduce((sum, key) => sum + Number(source[key] || 0), 0) || 1;
        let running = 0;

        orderedKeys.forEach((key, index) => {
            if (index === orderedKeys.length - 1) {
                normalized[key] = roundTo(100 - running, digits);
                return;
            }

            const raw = (Number(source[key] || 0) / total) * 100;
            const rounded = Math.round(raw * factor) / factor;
            normalized[key] = rounded;
            running = roundTo(running + rounded, digits);
        });

        return normalized;
    }

    function buildData() {
        const ageKeys = ageGroups.map((group) => group.key);
        const raceKeys = raceGroups.map((group) => group.key);
        const data = {};

        Object.entries(locationConfigs).forEach(([location, config]) => {
            data[location] = {};

            years.forEach((year, index) => {
                const growthPercent = config.populationGrowth[index] || 0;
                const totalPopulation = Math.round(config.totalPopulation * (1 + growthPercent / 100));

                const ageDistribution = {};
                ageKeys.forEach((key) => {
                    ageDistribution[key] = Number(config.ageDistribution[key] || 0) + (Number(config.ageShift[key] || 0) * index);
                });

                const raceComposition = {};
                raceKeys.forEach((key) => {
                    raceComposition[key] = Number(config.raceComposition[key] || 0) + (Number(config.raceShift[key] || 0) * index);
                });

                data[location][year] = {
                    totalPopulation,
                    medianAge: roundTo(config.medianAge + (config.medianAgeStep * index), 1),
                    veteranShare: roundTo(config.veteranShare + (config.veteranShareStep * index), 1),
                    hispanicShare: roundTo(config.hispanicShare + (config.hispanicShareStep * index), 1),
                    ageDistribution: normalizeDistribution(ageDistribution, ageKeys),
                    raceComposition: normalizeDistribution(raceComposition, raceKeys)
                };
            });
        });

        return data;
    }

    return {
        years,
        locations: Object.keys(locationConfigs),
        ageGroups,
        raceGroups,
        data: buildData()
    };
})();

window.DEMOGRAPHICS_DATA = DEMOGRAPHICS_DATA;