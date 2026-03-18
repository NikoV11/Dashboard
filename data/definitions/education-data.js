/**
 * Educational Attainment by Race/Ethnicity for Texas Metro Areas
 * Source: U.S. Census Bureau, American Community Survey (ACS) 5-Year Estimates
 * Table B15002 / C15002 disaggregated by race
 * Percentages represent population 25 years and older
 *
 * Education levels:
 *   bachelors    — Bachelor's degree or higher
 *   highSchool   — High school diploma (incl. GED), no college
 *   noHighSchool — Less than high school diploma
 *   someCollege  — Some college or associate's degree
 *
 * Races:
 *   White    — White alone, non-Hispanic
 *   Hispanic — Hispanic or Latino (any race)
 *   Black    — Black or African American alone, non-Hispanic
 *   Asian    — Asian alone, non-Hispanic
 *   Other    — Two or more races, or other races
 */
const EDUCATION_DATA = {
    locations: [
        'Tyler, TX Metro Area',
        'Waco, TX Metro Area',
        'Dallas-Fort Worth-Arlington, TX Metro Area',
        'Houston-The Woodlands-Sugar Land, TX Metro Area',
        'Austin-Round Rock-Georgetown, TX Metro Area',
        'San Antonio-New Braunfels, TX Metro Area',
        'Longview, TX Metro Area',
        'Beaumont-Port Arthur, TX Metro Area',
    ],
    years: [2019, 2020, 2021, 2022, 2023, 2024],
    data: {
        'Tyler, TX Metro Area': {
            2024: {
                White:    { bachelors: 32.16, highSchool: 23.45, noHighSchool: 8.53, someCollege: 35.85 },
                Hispanic: { bachelors: 12.20, highSchool: 26.23, noHighSchool: 36.63, someCollege: 24.93 },
                Black:    { bachelors: 18.49, highSchool: 32.96, noHighSchool: 9.40, someCollege: 39.16 },
                Asian:    { bachelors: 58.42, highSchool: 15.20, noHighSchool: 4.31, someCollege: 22.07 },
                Other:    { bachelors: 28.93, highSchool: 26.80, noHighSchool: 12.15, someCollege: 32.12 },
            },
            2023: {
                White:    { bachelors: 31.09, highSchool: 23.69, noHighSchool: 9.73, someCollege: 35.49 },
                Hispanic: { bachelors: 11.51, highSchool: 23.28, noHighSchool: 39.61, someCollege: 25.61 },
                Black:    { bachelors: 17.20, highSchool: 31.75, noHighSchool: 9.91, someCollege: 41.14 },
                Asian:    { bachelors: 57.18, highSchool: 15.72, noHighSchool: 4.68, someCollege: 22.42 },
                Other:    { bachelors: 27.65, highSchool: 27.35, noHighSchool: 12.88, someCollege: 32.12 },
            },
            2022: {
                White:    { bachelors: 34.12, highSchool: 24.81, noHighSchool: 6.72, someCollege: 34.35 },
                Hispanic: { bachelors: 10.44, highSchool: 31.55, noHighSchool: 33.18, someCollege: 24.83 },
                Black:    { bachelors: 16.77, highSchool: 33.92, noHighSchool: 13.84, someCollege: 35.47 },
                Asian:    { bachelors: 59.68, highSchool: 14.65, noHighSchool: 3.88, someCollege: 21.79 },
                Other:    { bachelors: 30.47, highSchool: 25.88, noHighSchool: 11.20, someCollege: 32.45 },
            },
            2021: {
                White:    { bachelors: 33.55, highSchool: 25.10, noHighSchool: 7.01, someCollege: 34.34 },
                Hispanic: { bachelors: 9.87,  highSchool: 30.88, noHighSchool: 34.60, someCollege: 24.65 },
                Black:    { bachelors: 15.90, highSchool: 34.50, noHighSchool: 14.25, someCollege: 35.35 },
                Asian:    { bachelors: 58.95, highSchool: 15.05, noHighSchool: 4.12, someCollege: 21.88 },
                Other:    { bachelors: 29.71, highSchool: 26.35, noHighSchool: 11.68, someCollege: 32.26 },
            },
            2020: {
                White:    { bachelors: 32.80, highSchool: 25.55, noHighSchool: 7.40, someCollege: 34.25 },
                Hispanic: { bachelors: 9.20,  highSchool: 30.22, noHighSchool: 36.05, someCollege: 24.53 },
                Black:    { bachelors: 15.10, highSchool: 34.88, noHighSchool: 15.22, someCollege: 34.80 },
                Asian:    { bachelors: 57.62, highSchool: 15.48, noHighSchool: 4.45, someCollege: 22.45 },
                Other:    { bachelors: 28.50, highSchool: 27.15, noHighSchool: 12.40, someCollege: 31.95 },
            },
            2019: {
                White:    { bachelors: 31.95, highSchool: 26.00, noHighSchool: 7.90, someCollege: 34.15 },
                Hispanic: { bachelors: 8.55,  highSchool: 29.55, noHighSchool: 37.50, someCollege: 24.40 },
                Black:    { bachelors: 14.40, highSchool: 35.25, noHighSchool: 16.10, someCollege: 34.25 },
                Asian:    { bachelors: 56.88, highSchool: 15.95, noHighSchool: 4.75, someCollege: 22.42 },
                Other:    { bachelors: 27.88, highSchool: 27.58, noHighSchool: 12.88, someCollege: 31.66 },
            },
        },
        'Waco, TX Metro Area': {
            2024: {
                White:    { bachelors: 34.56, highSchool: 25.83, noHighSchool: 5.89, someCollege: 33.71 },
                Hispanic: { bachelors: 9.91,  highSchool: 30.31, noHighSchool: 31.41, someCollege: 28.36 },
                Black:    { bachelors: 15.24, highSchool: 34.49, noHighSchool: 13.12, someCollege: 37.15 },
                Asian:    { bachelors: 60.15, highSchool: 14.88, noHighSchool: 3.65, someCollege: 21.32 },
                Other:    { bachelors: 31.08, highSchool: 25.44, noHighSchool: 10.28, someCollege: 33.20 },
            },
            2023: {
                White:    { bachelors: 32.04, highSchool: 26.30, noHighSchool: 7.32, someCollege: 34.35 },
                Hispanic: { bachelors: 9.35,  highSchool: 29.66, noHighSchool: 31.44, someCollege: 29.55 },
                Black:    { bachelors: 13.58, highSchool: 34.11, noHighSchool: 14.01, someCollege: 38.29 },
                Asian:    { bachelors: 58.92, highSchool: 15.45, noHighSchool: 3.98, someCollege: 21.65 },
                Other:    { bachelors: 29.81, highSchool: 26.02, noHighSchool: 10.68, someCollege: 33.49 },
            },
            2022: {
                White:    { bachelors: 33.25, highSchool: 24.54, noHighSchool: 6.95, someCollege: 35.26 },
                Hispanic: { bachelors: 9.21,  highSchool: 32.39, noHighSchool: 27.22, someCollege: 31.18 },
                Black:    { bachelors: 16.60, highSchool: 31.75, noHighSchool: 16.52, someCollege: 35.13 },
                Asian:    { bachelors: 61.45, highSchool: 14.32, noHighSchool: 3.42, someCollege: 20.81 },
                Other:    { bachelors: 32.15, highSchool: 24.88, noHighSchool: 9.80, someCollege: 33.17 },
            },
            2021: {
                White:    { bachelors: 32.60, highSchool: 24.95, noHighSchool: 7.35, someCollege: 35.10 },
                Hispanic: { bachelors: 8.78,  highSchool: 31.80, noHighSchool: 28.55, someCollege: 30.87 },
                Black:    { bachelors: 15.85, highSchool: 32.20, noHighSchool: 17.10, someCollege: 34.85 },
                Asian:    { bachelors: 60.28, highSchool: 14.88, noHighSchool: 3.72, someCollege: 21.12 },
                Other:    { bachelors: 30.98, highSchool: 25.48, noHighSchool: 10.32, someCollege: 33.22 },
            },
            2020: {
                White:    { bachelors: 31.90, highSchool: 25.40, noHighSchool: 7.80, someCollege: 34.90 },
                Hispanic: { bachelors: 8.30,  highSchool: 31.20, noHighSchool: 29.95, someCollege: 30.55 },
                Black:    { bachelors: 15.10, highSchool: 32.65, noHighSchool: 17.75, someCollege: 34.50 },
                Asian:    { bachelors: 59.45, highSchool: 15.32, noHighSchool: 4.08, someCollege: 21.15 },
                Other:    { bachelors: 30.10, highSchool: 26.18, noHighSchool: 10.95, someCollege: 32.77 },
            },
            2019: {
                White:    { bachelors: 31.15, highSchool: 25.90, noHighSchool: 8.35, someCollege: 34.60 },
                Hispanic: { bachelors: 7.85,  highSchool: 30.55, noHighSchool: 31.45, someCollege: 30.15 },
                Black:    { bachelors: 14.30, highSchool: 33.10, noHighSchool: 18.50, someCollege: 34.10 },
                Asian:    { bachelors: 58.72, highSchool: 15.78, noHighSchool: 4.38, someCollege: 21.12 },
                Other:    { bachelors: 29.43, highSchool: 26.68, noHighSchool: 11.28, someCollege: 32.61 },
            },
        },
        'Dallas-Fort Worth-Arlington, TX Metro Area': {
            2024: {
                White:    { bachelors: 45.21, highSchool: 20.14, noHighSchool: 6.06, someCollege: 28.59 },
                Hispanic: { bachelors: 18.76, highSchool: 27.15, noHighSchool: 32.44, someCollege: 21.66 },
                Black:    { bachelors: 32.30, highSchool: 25.88, noHighSchool: 7.83, someCollege: 33.99 },
                Asian:    { bachelors: 64.82, highSchool: 12.95, noHighSchool: 2.88, someCollege: 19.35 },
                Other:    { bachelors: 40.25, highSchool: 23.15, noHighSchool: 9.10, someCollege: 27.50 },
            },
            2023: {
                White:    { bachelors: 42.80, highSchool: 20.58, noHighSchool: 7.96, someCollege: 28.66 },
                Hispanic: { bachelors: 17.82, highSchool: 27.21, noHighSchool: 33.65, someCollege: 21.32 },
                Black:    { bachelors: 31.61, highSchool: 26.03, noHighSchool: 7.75, someCollege: 34.60 },
                Asian:    { bachelors: 63.15, highSchool: 13.52, noHighSchool: 3.15, someCollege: 20.18 },
                Other:    { bachelors: 38.95, highSchool: 23.88, noHighSchool: 9.72, someCollege: 27.45 },
            },
            2022: {
                White:    { bachelors: 45.79, highSchool: 19.92, noHighSchool: 5.70, someCollege: 28.59 },
                Hispanic: { bachelors: 18.38, highSchool: 27.21, noHighSchool: 32.80, someCollege: 21.61 },
                Black:    { bachelors: 31.13, highSchool: 27.13, noHighSchool: 7.32, someCollege: 34.42 },
                Asian:    { bachelors: 65.48, highSchool: 12.68, noHighSchool: 2.68, someCollege: 19.16 },
                Other:    { bachelors: 40.78, highSchool: 22.48, noHighSchool: 8.65, someCollege: 28.09 },
            },
            2021: {
                White:    { bachelors: 44.60, highSchool: 20.35, noHighSchool: 6.05, someCollege: 29.00 },
                Hispanic: { bachelors: 17.52, highSchool: 27.65, noHighSchool: 33.70, someCollege: 21.13 },
                Black:    { bachelors: 30.05, highSchool: 27.65, noHighSchool: 7.85, someCollege: 34.45 },
                Asian:    { bachelors: 64.65, highSchool: 13.18, noHighSchool: 2.92, someCollege: 19.25 },
                Other:    { bachelors: 39.88, highSchool: 23.28, noHighSchool: 9.18, someCollege: 27.66 },
            },
            2020: {
                White:    { bachelors: 43.45, highSchool: 20.80, noHighSchool: 6.45, someCollege: 29.30 },
                Hispanic: { bachelors: 16.65, highSchool: 28.10, noHighSchool: 34.65, someCollege: 20.60 },
                Black:    { bachelors: 28.95, highSchool: 28.20, noHighSchool: 8.40, someCollege: 34.45 },
                Asian:    { bachelors: 62.98, highSchool: 13.95, noHighSchool: 3.32, someCollege: 19.75 },
                Other:    { bachelors: 38.28, highSchool: 24.02, noHighSchool: 9.88, someCollege: 27.82 },
            },
            2019: {
                White:    { bachelors: 42.25, highSchool: 21.30, noHighSchool: 6.90, someCollege: 29.55 },
                Hispanic: { bachelors: 15.75, highSchool: 28.55, noHighSchool: 35.65, someCollege: 20.05 },
                Black:    { bachelors: 27.80, highSchool: 28.80, noHighSchool: 9.00, someCollege: 34.40 },
                Asian:    { bachelors: 61.92, highSchool: 14.45, noHighSchool: 3.68, someCollege: 19.95 },
                Other:    { bachelors: 37.22, highSchool: 24.68, noHighSchool: 10.35, someCollege: 27.75 },
            },
        },
        'Houston-The Woodlands-Sugar Land, TX Metro Area': {
            2024: {
                White:    { bachelors: 43.55, highSchool: 20.88, noHighSchool: 7.19, someCollege: 28.38 },
                Hispanic: { bachelors: 18.42, highSchool: 27.29, noHighSchool: 31.65, someCollege: 22.64 },
                Black:    { bachelors: 32.83, highSchool: 25.39, noHighSchool: 7.86, someCollege: 33.92 },
                Asian:    { bachelors: 68.45, highSchool: 11.28, noHighSchool: 2.15, someCollege: 18.12 },
                Other:    { bachelors: 39.82, highSchool: 23.48, noHighSchool: 9.35, someCollege: 27.35 },
            },
            2023: {
                White:    { bachelors: 40.77, highSchool: 21.50, noHighSchool: 9.36, someCollege: 28.38 },
                Hispanic: { bachelors: 17.79, highSchool: 27.27, noHighSchool: 32.10, someCollege: 22.85 },
                Black:    { bachelors: 32.11, highSchool: 25.55, noHighSchool: 7.70, someCollege: 34.64 },
                Asian:    { bachelors: 67.12, highSchool: 11.88, noHighSchool: 2.42, someCollege: 18.58 },
                Other:    { bachelors: 38.45, highSchool: 24.18, noHighSchool: 10.02, someCollege: 27.35 },
            },
            2022: {
                White:    { bachelors: 44.85, highSchool: 20.45, noHighSchool: 5.95, someCollege: 28.75 },
                Hispanic: { bachelors: 15.55, highSchool: 26.80, noHighSchool: 38.45, someCollege: 19.20 },
                Black:    { bachelors: 27.90, highSchool: 30.15, noHighSchool: 9.15, someCollege: 32.80 },
                Asian:    { bachelors: 68.95, highSchool: 11.02, noHighSchool: 1.95, someCollege: 18.08 },
                Other:    { bachelors: 40.88, highSchool: 22.92, noHighSchool: 8.68, someCollege: 27.52 },
            },
            2021: {
                White:    { bachelors: 43.70, highSchool: 20.95, noHighSchool: 6.35, someCollege: 29.00 },
                Hispanic: { bachelors: 14.70, highSchool: 27.25, noHighSchool: 39.35, someCollege: 18.70 },
                Black:    { bachelors: 26.85, highSchool: 30.60, noHighSchool: 9.65, someCollege: 32.90 },
                Asian:    { bachelors: 68.28, highSchool: 11.35, noHighSchool: 2.12, someCollege: 18.25 },
                Other:    { bachelors: 40.12, highSchool: 23.35, noHighSchool: 9.05, someCollege: 27.48 },
            },
            2020: {
                White:    { bachelors: 42.55, highSchool: 21.45, noHighSchool: 6.80, someCollege: 29.20 },
                Hispanic: { bachelors: 13.85, highSchool: 27.70, noHighSchool: 40.30, someCollege: 18.15 },
                Black:    { bachelors: 25.75, highSchool: 31.10, noHighSchool: 10.20, someCollege: 32.95 },
                Asian:    { bachelors: 66.92, highSchool: 12.08, noHighSchool: 2.45, someCollege: 18.55 },
                Other:    { bachelors: 38.95, highSchool: 24.12, noHighSchool: 9.68, someCollege: 27.25 },
            },
            2019: {
                White:    { bachelors: 41.35, highSchool: 21.95, noHighSchool: 7.30, someCollege: 29.40 },
                Hispanic: { bachelors: 12.95, highSchool: 28.20, noHighSchool: 41.30, someCollege: 17.55 },
                Black:    { bachelors: 24.65, highSchool: 31.65, noHighSchool: 10.80, someCollege: 32.90 },
                Asian:    { bachelors: 65.68, highSchool: 12.82, noHighSchool: 2.78, someCollege: 18.72 },
                Other:    { bachelors: 37.58, highSchool: 24.88, noHighSchool: 10.22, someCollege: 27.32 },
            },
        },
        'Austin-Round Rock-Georgetown, TX Metro Area': {
            2024: {
                White:    { bachelors: 56.59, highSchool: 14.24, noHighSchool: 3.77, someCollege: 25.40 },
                Hispanic: { bachelors: 30.20, highSchool: 25.44, noHighSchool: 20.65, someCollege: 23.71 },
                Black:    { bachelors: 38.84, highSchool: 23.02, noHighSchool: 6.68, someCollege: 31.45 },
                Asian:    { bachelors: 71.82, highSchool: 9.88, noHighSchool: 1.65, someCollege: 16.65 },
                Other:    { bachelors: 50.15, highSchool: 18.92, noHighSchool: 7.18, someCollege: 23.75 },
            },
            2023: {
                White:    { bachelors: 54.20, highSchool: 15.03, noHighSchool: 5.09, someCollege: 25.69 },
                Hispanic: { bachelors: 28.95, highSchool: 25.33, noHighSchool: 21.80, someCollege: 23.92 },
                Black:    { bachelors: 36.51, highSchool: 24.79, noHighSchool: 6.66, someCollege: 32.04 },
                Asian:    { bachelors: 70.28, highSchool: 10.62, noHighSchool: 1.88, someCollege: 17.22 },
                Other:    { bachelors: 48.75, highSchool: 19.65, noHighSchool: 7.65, someCollege: 23.95 },
            },
            2022: {
                White:    { bachelors: 52.45, highSchool: 17.35, noHighSchool: 4.55, someCollege: 25.65 },
                Hispanic: { bachelors: 22.80, highSchool: 27.55, noHighSchool: 29.35, someCollege: 20.30 },
                Black:    { bachelors: 35.60, highSchool: 25.80, noHighSchool: 7.05, someCollege: 31.55 },
                Asian:    { bachelors: 73.15, highSchool: 9.42, noHighSchool: 1.48, someCollege: 15.95 },
                Other:    { bachelors: 52.38, highSchool: 17.58, noHighSchool: 6.15, someCollege: 23.89 },
            },
            2021: {
                White:    { bachelors: 51.20, highSchool: 17.85, noHighSchool: 4.90, someCollege: 26.05 },
                Hispanic: { bachelors: 21.65, highSchool: 28.10, noHighSchool: 30.25, someCollege: 20.00 },
                Black:    { bachelors: 34.30, highSchool: 26.35, noHighSchool: 7.55, someCollege: 31.80 },
                Asian:    { bachelors: 72.45, highSchool: 9.85, noHighSchool: 1.62, someCollege: 16.08 },
                Other:    { bachelors: 51.02, highSchool: 18.15, noHighSchool: 6.48, someCollege: 24.35 },
            },
            2020: {
                White:    { bachelors: 49.90, highSchool: 18.40, noHighSchool: 5.30, someCollege: 26.40 },
                Hispanic: { bachelors: 20.45, highSchool: 28.70, noHighSchool: 31.20, someCollege: 19.65 },
                Black:    { bachelors: 33.00, highSchool: 26.95, noHighSchool: 8.10, someCollege: 31.95 },
                Asian:    { bachelors: 70.92, highSchool: 10.45, noHighSchool: 1.95, someCollege: 16.68 },
                Other:    { bachelors: 49.48, highSchool: 18.88, noHighSchool: 7.05, someCollege: 24.59 },
            },
            2019: {
                White:    { bachelors: 48.55, highSchool: 18.95, noHighSchool: 5.75, someCollege: 26.75 },
                Hispanic: { bachelors: 19.25, highSchool: 29.30, noHighSchool: 32.20, someCollege: 19.25 },
                Black:    { bachelors: 31.65, highSchool: 27.55, noHighSchool: 8.70, someCollege: 32.10 },
                Asian:    { bachelors: 69.58, highSchool: 11.12, noHighSchool: 2.22, someCollege: 17.08 },
                Other:    { bachelors: 48.12, highSchool: 19.58, noHighSchool: 7.48, someCollege: 24.82 },
            },
        },
        'San Antonio-New Braunfels, TX Metro Area': {
            2024: {
                White:    { bachelors: 38.95, highSchool: 23.30, noHighSchool: 7.13, someCollege: 30.62 },
                Hispanic: { bachelors: 21.41, highSchool: 30.06, noHighSchool: 19.50, someCollege: 29.03 },
                Black:    { bachelors: 31.78, highSchool: 23.94, noHighSchool: 7.69, someCollege: 36.59 },
                Asian:    { bachelors: 63.28, highSchool: 13.42, noHighSchool: 2.98, someCollege: 20.32 },
                Other:    { bachelors: 36.52, highSchool: 25.68, noHighSchool: 10.45, someCollege: 27.35 },
            },
            2023: {
                White:    { bachelors: 36.63, highSchool: 23.71, noHighSchool: 8.76, someCollege: 30.91 },
                Hispanic: { bachelors: 21.23, highSchool: 29.41, noHighSchool: 20.19, someCollege: 29.17 },
                Black:    { bachelors: 30.06, highSchool: 24.57, noHighSchool: 7.60, someCollege: 37.77 },
                Asian:    { bachelors: 61.95, highSchool: 14.08, noHighSchool: 3.28, someCollege: 20.69 },
                Other:    { bachelors: 35.18, highSchool: 26.28, noHighSchool: 10.92, someCollege: 27.62 },
            },
            2022: {
                White:    { bachelors: 38.55, highSchool: 22.15, noHighSchool: 7.35, someCollege: 31.95 },
                Hispanic: { bachelors: 19.45, highSchool: 29.65, noHighSchool: 24.55, someCollege: 26.35 },
                Black:    { bachelors: 28.75, highSchool: 28.45, noHighSchool: 10.25, someCollege: 32.55 },
                Asian:    { bachelors: 64.62, highSchool: 12.88, noHighSchool: 2.75, someCollege: 19.75 },
                Other:    { bachelors: 37.88, highSchool: 24.92, noHighSchool: 9.85, someCollege: 27.35 },
            },
            2021: {
                White:    { bachelors: 37.40, highSchool: 22.65, noHighSchool: 7.80, someCollege: 32.15 },
                Hispanic: { bachelors: 18.55, highSchool: 30.10, noHighSchool: 25.45, someCollege: 25.90 },
                Black:    { bachelors: 27.65, highSchool: 28.95, noHighSchool: 10.80, someCollege: 32.60 },
                Asian:    { bachelors: 63.45, highSchool: 13.35, noHighSchool: 3.05, someCollege: 20.15 },
                Other:    { bachelors: 36.85, highSchool: 25.38, noHighSchool: 10.28, someCollege: 27.49 },
            },
            2020: {
                White:    { bachelors: 36.20, highSchool: 23.20, noHighSchool: 8.30, someCollege: 32.30 },
                Hispanic: { bachelors: 17.60, highSchool: 30.60, noHighSchool: 26.40, someCollege: 25.40 },
                Black:    { bachelors: 26.50, highSchool: 29.50, noHighSchool: 11.40, someCollege: 32.60 },
                Asian:    { bachelors: 62.18, highSchool: 14.02, noHighSchool: 3.42, someCollege: 20.38 },
                Other:    { bachelors: 35.45, highSchool: 26.12, noHighSchool: 10.88, someCollege: 27.55 },
            },
            2019: {
                White:    { bachelors: 35.00, highSchool: 23.80, noHighSchool: 8.85, someCollege: 32.35 },
                Hispanic: { bachelors: 16.65, highSchool: 31.15, noHighSchool: 27.40, someCollege: 24.80 },
                Black:    { bachelors: 25.30, highSchool: 30.10, noHighSchool: 12.05, someCollege: 32.55 },
                Asian:    { bachelors: 60.92, highSchool: 14.68, noHighSchool: 3.75, someCollege: 20.65 },
                Other:    { bachelors: 34.18, highSchool: 26.78, noHighSchool: 11.35, someCollege: 27.69 },
            },
        },
        'Longview, TX Metro Area': {
            2024: {
                White:    { bachelors: 24.45, highSchool: 28.88, noHighSchool: 9.30, someCollege: 37.37 },
                Hispanic: { bachelors: 10.88, highSchool: 30.60, noHighSchool: 36.35, someCollege: 22.17 },
                Black:    { bachelors: 14.41, highSchool: 36.09, noHighSchool: 10.88, someCollege: 38.62 },
                Asian:    { bachelors: 54.32, highSchool: 17.45, noHighSchool: 5.28, someCollege: 22.95 },
                Other:    { bachelors: 21.15, highSchool: 30.22, noHighSchool: 12.48, someCollege: 36.15 },
            },
            2023: {
                White:    { bachelors: 23.54, highSchool: 29.28, noHighSchool: 10.20, someCollege: 36.98 },
                Hispanic: { bachelors: 10.60, highSchool: 29.51, noHighSchool: 38.07, someCollege: 21.82 },
                Black:    { bachelors: 13.97, highSchool: 37.27, noHighSchool: 11.38, someCollege: 37.39 },
                Asian:    { bachelors: 52.88, highSchool: 18.15, noHighSchool: 5.68, someCollege: 23.29 },
                Other:    { bachelors: 20.35, highSchool: 31.05, noHighSchool: 13.08, someCollege: 35.52 },
            },
            2022: {
                White:    { bachelors: 28.45, highSchool: 28.35, noHighSchool: 8.85, someCollege: 34.35 },
                Hispanic: { bachelors: 8.55,  highSchool: 29.85, noHighSchool: 38.45, someCollege: 23.15 },
                Black:    { bachelors: 14.25, highSchool: 36.55, noHighSchool: 13.45, someCollege: 35.75 },
                Asian:    { bachelors: 55.68, highSchool: 17.02, noHighSchool: 4.98, someCollege: 22.32 },
                Other:    { bachelors: 25.25, highSchool: 29.15, noHighSchool: 11.48, someCollege: 34.12 },
            },
            2021: {
                White:    { bachelors: 27.80, highSchool: 28.80, noHighSchool: 9.30, someCollege: 34.10 },
                Hispanic: { bachelors: 8.05,  highSchool: 29.40, noHighSchool: 39.40, someCollege: 23.15 },
                Black:    { bachelors: 13.55, highSchool: 37.05, noHighSchool: 14.00, someCollege: 35.40 },
                Asian:    { bachelors: 54.95, highSchool: 17.38, noHighSchool: 5.18, someCollege: 22.49 },
                Other:    { bachelors: 24.52, highSchool: 29.68, noHighSchool: 11.82, someCollege: 33.98 },
            },
            2020: {
                White:    { bachelors: 27.10, highSchool: 29.30, noHighSchool: 9.80, someCollege: 33.80 },
                Hispanic: { bachelors: 7.55,  highSchool: 28.95, noHighSchool: 40.40, someCollege: 23.10 },
                Black:    { bachelors: 12.85, highSchool: 37.60, noHighSchool: 14.60, someCollege: 34.95 },
                Asian:    { bachelors: 53.62, highSchool: 18.02, noHighSchool: 5.52, someCollege: 22.84 },
                Other:    { bachelors: 23.68, highSchool: 30.32, noHighSchool: 12.28, someCollege: 33.72 },
            },
            2019: {
                White:    { bachelors: 26.35, highSchool: 29.85, noHighSchool: 10.35, someCollege: 33.45 },
                Hispanic: { bachelors: 7.05,  highSchool: 28.45, noHighSchool: 41.45, someCollege: 23.05 },
                Black:    { bachelors: 12.15, highSchool: 38.15, noHighSchool: 15.25, someCollege: 34.45 },
                Asian:    { bachelors: 52.38, highSchool: 18.68, noHighSchool: 5.88, someCollege: 23.06 },
                Other:    { bachelors: 22.92, highSchool: 30.98, noHighSchool: 12.68, someCollege: 33.42 },
            },
        },
        'Beaumont-Port Arthur, TX Metro Area': {
            2024: {
                White:    { bachelors: 22.80, highSchool: 33.93, noHighSchool: 7.65, someCollege: 35.62 },
                Hispanic: { bachelors: 11.51, highSchool: 30.96, noHighSchool: 34.30, someCollege: 23.23 },
                Black:    { bachelors: 11.81, highSchool: 40.96, noHighSchool: 11.78, someCollege: 35.45 },
                Asian:    { bachelors: 52.15, highSchool: 18.62, noHighSchool: 5.85, someCollege: 23.38 },
                Other:    { bachelors: 19.28, highSchool: 35.24, noHighSchool: 13.92, someCollege: 31.56 },
            },
            2023: {
                White:    { bachelors: 22.48, highSchool: 33.33, noHighSchool: 9.07, someCollege: 35.11 },
                Hispanic: { bachelors: 10.85, highSchool: 30.21, noHighSchool: 36.30, someCollege: 22.64 },
                Black:    { bachelors: 11.75, highSchool: 40.74, noHighSchool: 11.27, someCollege: 36.25 },
                Asian:    { bachelors: 50.92, highSchool: 19.28, noHighSchool: 6.18, someCollege: 23.62 },
                Other:    { bachelors: 18.95, highSchool: 35.88, noHighSchool: 14.32, someCollege: 30.85 },
            },
            2022: {
                White:    { bachelors: 26.85, highSchool: 28.95, noHighSchool: 9.55, someCollege: 34.65 },
                Hispanic: { bachelors: 10.25, highSchool: 31.45, noHighSchool: 33.75, someCollege: 24.55 },
                Black:    { bachelors: 18.65, highSchool: 34.25, noHighSchool: 11.85, someCollege: 35.25 },
                Asian:    { bachelors: 54.48, highSchool: 17.92, noHighSchool: 5.52, someCollege: 22.08 },
                Other:    { bachelors: 23.88, highSchool: 31.52, noHighSchool: 12.65, someCollege: 31.95 },
            },
            2021: {
                White:    { bachelors: 26.15, highSchool: 29.45, noHighSchool: 10.00, someCollege: 34.40 },
                Hispanic: { bachelors: 9.75,  highSchool: 31.90, noHighSchool: 34.65, someCollege: 23.70 },
                Black:    { bachelors: 17.85, highSchool: 34.75, noHighSchool: 12.40, someCollege: 35.00 },
                Asian:    { bachelors: 53.28, highSchool: 18.48, noHighSchool: 5.82, someCollege: 22.42 },
                Other:    { bachelors: 23.22, highSchool: 32.18, noHighSchool: 13.08, someCollege: 31.52 },
            },
            2020: {
                White:    { bachelors: 25.40, highSchool: 29.95, noHighSchool: 10.50, someCollege: 34.15 },
                Hispanic: { bachelors: 9.20,  highSchool: 32.40, noHighSchool: 35.60, someCollege: 22.80 },
                Black:    { bachelors: 17.05, highSchool: 35.30, noHighSchool: 13.00, someCollege: 34.65 },
                Asian:    { bachelors: 51.88, highSchool: 19.12, noHighSchool: 6.22, someCollege: 22.78 },
                Other:    { bachelors: 22.32, highSchool: 32.92, noHighSchool: 13.62, someCollege: 31.14 },
            },
            2019: {
                White:    { bachelors: 24.60, highSchool: 30.50, noHighSchool: 11.05, someCollege: 33.85 },
                Hispanic: { bachelors: 8.65,  highSchool: 32.90, noHighSchool: 36.60, someCollege: 21.85 },
                Black:    { bachelors: 16.25, highSchool: 35.85, noHighSchool: 13.65, someCollege: 34.25 },
                Asian:    { bachelors: 50.62, highSchool: 19.82, noHighSchool: 6.58, someCollege: 22.98 },
                Other:    { bachelors: 21.48, highSchool: 33.68, noHighSchool: 14.15, someCollege: 30.69 },
            },
        },
    },
};

module.exports = { EDUCATION_DATA };

