/**
 * Regional employment comparison dataset for Texas counties and metro areas.
 * Metrics include unemployment rate, labor force participation rate,
 * annual average weekly wages by industry, and annual average employment by industry.
 */
const REGIONAL_EMPLOYMENT_DATA = {
    years: [2023, 2024, 2025],
    industries: [
        'Natural Resources & Mining',
        'Construction',
        'Manufacturing',
        'Trade, Transportation & Utilities',
        'Professional & Business Services',
        'Education & Health Services',
        'Leisure & Hospitality',
        'Government'
    ],
    locations: [
        { id: 'smith-county', name: 'Smith County, TX', type: 'County' },
        { id: 'travis-county', name: 'Travis County, TX', type: 'County' },
        { id: 'el-paso-county', name: 'El Paso County, TX', type: 'County' },
        { id: 'abilene-metro', name: 'Abilene, TX Metro Area', type: 'MSA' },
        { id: 'dallas-fort-worth-metro', name: 'Dallas-Fort Worth-Arlington, TX Metro Area', type: 'MSA' },
        { id: 'houston-metro', name: 'Houston-The Woodlands-Sugar Land, TX Metro Area', type: 'MSA' },
        { id: 'austin-metro', name: 'Austin-Round Rock-Georgetown, TX Metro Area', type: 'MSA' }
    ],
    data: {
        'smith-county': {
            2023: {
                unemploymentRate: 4.5,
                laborForceParticipationRate: 59.9,
                weeklyWages: {
                    'Natural Resources & Mining': 1225,
                    Construction: 1112,
                    Manufacturing: 1204,
                    'Trade, Transportation & Utilities': 923,
                    'Professional & Business Services': 1068,
                    'Education & Health Services': 957,
                    'Leisure & Hospitality': 512,
                    Government: 984
                },
                industryEmployment: {
                    'Natural Resources & Mining': 950,
                    Construction: 7450,
                    Manufacturing: 12750,
                    'Trade, Transportation & Utilities': 28100,
                    'Professional & Business Services': 13400,
                    'Education & Health Services': 24850,
                    'Leisure & Hospitality': 15100,
                    Government: 13150
                }
            },
            2024: {
                unemploymentRate: 4.2,
                laborForceParticipationRate: 60.3,
                weeklyWages: {
                    'Natural Resources & Mining': 1252,
                    Construction: 1141,
                    Manufacturing: 1238,
                    'Trade, Transportation & Utilities': 947,
                    'Professional & Business Services': 1106,
                    'Education & Health Services': 982,
                    'Leisure & Hospitality': 536,
                    Government: 1007
                },
                industryEmployment: {
                    'Natural Resources & Mining': 1015,
                    Construction: 7695,
                    Manufacturing: 12980,
                    'Trade, Transportation & Utilities': 28640,
                    'Professional & Business Services': 13710,
                    'Education & Health Services': 25390,
                    'Leisure & Hospitality': 15625,
                    Government: 13340
                }
            },
            2025: {
                unemploymentRate: 4.1,
                laborForceParticipationRate: 60.5,
                weeklyWages: {
                    'Natural Resources & Mining': 1288,
                    Construction: 1175,
                    Manufacturing: 1264,
                    'Trade, Transportation & Utilities': 969,
                    'Professional & Business Services': 1144,
                    'Education & Health Services': 1008,
                    'Leisure & Hospitality': 558,
                    Government: 1028
                },
                industryEmployment: {
                    'Natural Resources & Mining': 1070,
                    Construction: 7890,
                    Manufacturing: 13240,
                    'Trade, Transportation & Utilities': 29120,
                    'Professional & Business Services': 14090,
                    'Education & Health Services': 25920,
                    'Leisure & Hospitality': 16080,
                    Government: 13580
                }
            }
        },
        'travis-county': {
            2023: {
                unemploymentRate: 3.6,
                laborForceParticipationRate: 69.9,
                weeklyWages: {
                    'Natural Resources & Mining': 1578,
                    Construction: 1371,
                    Manufacturing: 1472,
                    'Trade, Transportation & Utilities': 1098,
                    'Professional & Business Services': 1892,
                    'Education & Health Services': 1281,
                    'Leisure & Hospitality': 705,
                    Government: 1384
                },
                industryEmployment: {
                    'Natural Resources & Mining': 2150,
                    Construction: 28600,
                    Manufacturing: 14950,
                    'Trade, Transportation & Utilities': 76200,
                    'Professional & Business Services': 154900,
                    'Education & Health Services': 112700,
                    'Leisure & Hospitality': 69400,
                    Government: 104200
                }
            },
            2024: {
                unemploymentRate: 3.5,
                laborForceParticipationRate: 70.3,
                weeklyWages: {
                    'Natural Resources & Mining': 1612,
                    Construction: 1414,
                    Manufacturing: 1505,
                    'Trade, Transportation & Utilities': 1131,
                    'Professional & Business Services': 1948,
                    'Education & Health Services': 1326,
                    'Leisure & Hospitality': 734,
                    Government: 1422
                },
                industryEmployment: {
                    'Natural Resources & Mining': 2260,
                    Construction: 29400,
                    Manufacturing: 15360,
                    'Trade, Transportation & Utilities': 77540,
                    'Professional & Business Services': 159300,
                    'Education & Health Services': 116200,
                    'Leisure & Hospitality': 71550,
                    Government: 106800
                }
            },
            2025: {
                unemploymentRate: 3.7,
                laborForceParticipationRate: 70.1,
                weeklyWages: {
                    'Natural Resources & Mining': 1655,
                    Construction: 1451,
                    Manufacturing: 1538,
                    'Trade, Transportation & Utilities': 1162,
                    'Professional & Business Services': 2004,
                    'Education & Health Services': 1367,
                    'Leisure & Hospitality': 762,
                    Government: 1459
                },
                industryEmployment: {
                    'Natural Resources & Mining': 2340,
                    Construction: 30120,
                    Manufacturing: 15810,
                    'Trade, Transportation & Utilities': 78920,
                    'Professional & Business Services': 164500,
                    'Education & Health Services': 120050,
                    'Leisure & Hospitality': 73880,
                    Government: 109200
                }
            }
        },
        'el-paso-county': {
            2023: {
                unemploymentRate: 5.5,
                laborForceParticipationRate: 58.5,
                weeklyWages: {
                    'Natural Resources & Mining': 1092,
                    Construction: 972,
                    Manufacturing: 998,
                    'Trade, Transportation & Utilities': 817,
                    'Professional & Business Services': 948,
                    'Education & Health Services': 929,
                    'Leisure & Hospitality': 503,
                    Government: 987
                },
                industryEmployment: {
                    'Natural Resources & Mining': 610,
                    Construction: 13950,
                    Manufacturing: 18240,
                    'Trade, Transportation & Utilities': 50200,
                    'Professional & Business Services': 26900,
                    'Education & Health Services': 56300,
                    'Leisure & Hospitality': 28980,
                    Government: 41700
                }
            },
            2024: {
                unemploymentRate: 5.2,
                laborForceParticipationRate: 58.8,
                weeklyWages: {
                    'Natural Resources & Mining': 1124,
                    Construction: 1001,
                    Manufacturing: 1026,
                    'Trade, Transportation & Utilities': 843,
                    'Professional & Business Services': 977,
                    'Education & Health Services': 954,
                    'Leisure & Hospitality': 521,
                    Government: 1015
                },
                industryEmployment: {
                    'Natural Resources & Mining': 660,
                    Construction: 14320,
                    Manufacturing: 18670,
                    'Trade, Transportation & Utilities': 51190,
                    'Professional & Business Services': 27460,
                    'Education & Health Services': 57480,
                    'Leisure & Hospitality': 29640,
                    Government: 42380
                }
            },
            2025: {
                unemploymentRate: 5.1,
                laborForceParticipationRate: 59.1,
                weeklyWages: {
                    'Natural Resources & Mining': 1158,
                    Construction: 1037,
                    Manufacturing: 1054,
                    'Trade, Transportation & Utilities': 868,
                    'Professional & Business Services': 1008,
                    'Education & Health Services': 982,
                    'Leisure & Hospitality': 544,
                    Government: 1042
                },
                industryEmployment: {
                    'Natural Resources & Mining': 710,
                    Construction: 14680,
                    Manufacturing: 19120,
                    'Trade, Transportation & Utilities': 52040,
                    'Professional & Business Services': 27920,
                    'Education & Health Services': 58610,
                    'Leisure & Hospitality': 30310,
                    Government: 43020
                }
            }
        },
        'abilene-metro': {
            2023: {
                unemploymentRate: 4.1,
                laborForceParticipationRate: 61.0,
                weeklyWages: {
                    'Natural Resources & Mining': 1341,
                    Construction: 1125,
                    Manufacturing: 1188,
                    'Trade, Transportation & Utilities': 915,
                    'Professional & Business Services': 1055,
                    'Education & Health Services': 979,
                    'Leisure & Hospitality': 552,
                    Government: 1044
                },
                industryEmployment: {
                    'Natural Resources & Mining': 1310,
                    Construction: 10140,
                    Manufacturing: 11420,
                    'Trade, Transportation & Utilities': 34620,
                    'Professional & Business Services': 15640,
                    'Education & Health Services': 28440,
                    'Leisure & Hospitality': 17650,
                    Government: 18490
                }
            },
            2024: {
                unemploymentRate: 3.9,
                laborForceParticipationRate: 61.4,
                weeklyWages: {
                    'Natural Resources & Mining': 1378,
                    Construction: 1162,
                    Manufacturing: 1216,
                    'Trade, Transportation & Utilities': 939,
                    'Professional & Business Services': 1088,
                    'Education & Health Services': 1008,
                    'Leisure & Hospitality': 574,
                    Government: 1072
                },
                industryEmployment: {
                    'Natural Resources & Mining': 1380,
                    Construction: 10480,
                    Manufacturing: 11710,
                    'Trade, Transportation & Utilities': 35230,
                    'Professional & Business Services': 16050,
                    'Education & Health Services': 28930,
                    'Leisure & Hospitality': 18120,
                    Government: 18810
                }
            },
            2025: {
                unemploymentRate: 3.8,
                laborForceParticipationRate: 61.8,
                weeklyWages: {
                    'Natural Resources & Mining': 1415,
                    Construction: 1198,
                    Manufacturing: 1245,
                    'Trade, Transportation & Utilities': 964,
                    'Professional & Business Services': 1120,
                    'Education & Health Services': 1037,
                    'Leisure & Hospitality': 596,
                    Government: 1101
                },
                industryEmployment: {
                    'Natural Resources & Mining': 1450,
                    Construction: 10810,
                    Manufacturing: 11990,
                    'Trade, Transportation & Utilities': 35820,
                    'Professional & Business Services': 16420,
                    'Education & Health Services': 29410,
                    'Leisure & Hospitality': 18560,
                    Government: 19120
                }
            }
        },
        'dallas-fort-worth-metro': {
            2023: {
                unemploymentRate: 3.9,
                laborForceParticipationRate: 67.6,
                weeklyWages: {
                    'Natural Resources & Mining': 1892,
                    Construction: 1498,
                    Manufacturing: 1485,
                    'Trade, Transportation & Utilities': 1184,
                    'Professional & Business Services': 1798,
                    'Education & Health Services': 1251,
                    'Leisure & Hospitality': 722,
                    Government: 1296
                },
                industryEmployment: {
                    'Natural Resources & Mining': 28100,
                    Construction: 235100,
                    Manufacturing: 326400,
                    'Trade, Transportation & Utilities': 1092500,
                    'Professional & Business Services': 948700,
                    'Education & Health Services': 736800,
                    'Leisure & Hospitality': 468400,
                    Government: 513300
                }
            },
            2024: {
                unemploymentRate: 3.8,
                laborForceParticipationRate: 67.9,
                weeklyWages: {
                    'Natural Resources & Mining': 1940,
                    Construction: 1539,
                    Manufacturing: 1518,
                    'Trade, Transportation & Utilities': 1216,
                    'Professional & Business Services': 1856,
                    'Education & Health Services': 1288,
                    'Leisure & Hospitality': 751,
                    Government: 1332
                },
                industryEmployment: {
                    'Natural Resources & Mining': 29250,
                    Construction: 242600,
                    Manufacturing: 331900,
                    'Trade, Transportation & Utilities': 1113400,
                    'Professional & Business Services': 969500,
                    'Education & Health Services': 752200,
                    'Leisure & Hospitality': 482100,
                    Government: 521900
                }
            },
            2025: {
                unemploymentRate: 3.9,
                laborForceParticipationRate: 68.1,
                weeklyWages: {
                    'Natural Resources & Mining': 1987,
                    Construction: 1581,
                    Manufacturing: 1549,
                    'Trade, Transportation & Utilities': 1249,
                    'Professional & Business Services': 1915,
                    'Education & Health Services': 1327,
                    'Leisure & Hospitality': 782,
                    Government: 1369
                },
                industryEmployment: {
                    'Natural Resources & Mining': 30500,
                    Construction: 250800,
                    Manufacturing: 338100,
                    'Trade, Transportation & Utilities': 1135400,
                    'Professional & Business Services': 991200,
                    'Education & Health Services': 768400,
                    'Leisure & Hospitality': 496800,
                    Government: 530500
                }
            }
        },
        'houston-metro': {
            2023: {
                unemploymentRate: 4.5,
                laborForceParticipationRate: 65.8,
                weeklyWages: {
                    'Natural Resources & Mining': 2448,
                    Construction: 1515,
                    Manufacturing: 1510,
                    'Trade, Transportation & Utilities': 1179,
                    'Professional & Business Services': 1689,
                    'Education & Health Services': 1204,
                    'Leisure & Hospitality': 704,
                    Government: 1241
                },
                industryEmployment: {
                    'Natural Resources & Mining': 83000,
                    Construction: 227100,
                    Manufacturing: 249600,
                    'Trade, Transportation & Utilities': 1024800,
                    'Professional & Business Services': 744100,
                    'Education & Health Services': 678200,
                    'Leisure & Hospitality': 436900,
                    Government: 392100
                }
            },
            2024: {
                unemploymentRate: 4.4,
                laborForceParticipationRate: 66.1,
                weeklyWages: {
                    'Natural Resources & Mining': 2515,
                    Construction: 1558,
                    Manufacturing: 1546,
                    'Trade, Transportation & Utilities': 1213,
                    'Professional & Business Services': 1744,
                    'Education & Health Services': 1243,
                    'Leisure & Hospitality': 734,
                    Government: 1279
                },
                industryEmployment: {
                    'Natural Resources & Mining': 85200,
                    Construction: 234500,
                    Manufacturing: 256800,
                    'Trade, Transportation & Utilities': 1047900,
                    'Professional & Business Services': 762900,
                    'Education & Health Services': 694500,
                    'Leisure & Hospitality': 451300,
                    Government: 400700
                }
            },
            2025: {
                unemploymentRate: 4.3,
                laborForceParticipationRate: 66.4,
                weeklyWages: {
                    'Natural Resources & Mining': 2584,
                    Construction: 1602,
                    Manufacturing: 1579,
                    'Trade, Transportation & Utilities': 1245,
                    'Professional & Business Services': 1800,
                    'Education & Health Services': 1284,
                    'Leisure & Hospitality': 765,
                    Government: 1319
                },
                industryEmployment: {
                    'Natural Resources & Mining': 87400,
                    Construction: 242600,
                    Manufacturing: 264100,
                    'Trade, Transportation & Utilities': 1071200,
                    'Professional & Business Services': 782400,
                    'Education & Health Services': 711200,
                    'Leisure & Hospitality': 466100,
                    Government: 409500
                }
            }
        },
        'austin-metro': {
            2023: {
                unemploymentRate: 3.4,
                laborForceParticipationRate: 69.4,
                weeklyWages: {
                    'Natural Resources & Mining': 1674,
                    Construction: 1468,
                    Manufacturing: 1524,
                    'Trade, Transportation & Utilities': 1136,
                    'Professional & Business Services': 1960,
                    'Education & Health Services': 1297,
                    'Leisure & Hospitality': 748,
                    Government: 1368
                },
                industryEmployment: {
                    'Natural Resources & Mining': 5300,
                    Construction: 91300,
                    Manufacturing: 72700,
                    'Trade, Transportation & Utilities': 252900,
                    'Professional & Business Services': 382100,
                    'Education & Health Services': 251800,
                    'Leisure & Hospitality': 150600,
                    Government: 194200
                }
            },
            2024: {
                unemploymentRate: 3.3,
                laborForceParticipationRate: 69.8,
                weeklyWages: {
                    'Natural Resources & Mining': 1718,
                    Construction: 1510,
                    Manufacturing: 1562,
                    'Trade, Transportation & Utilities': 1172,
                    'Professional & Business Services': 2022,
                    'Education & Health Services': 1338,
                    'Leisure & Hospitality': 777,
                    Government: 1406
                },
                industryEmployment: {
                    'Natural Resources & Mining': 5600,
                    Construction: 94900,
                    Manufacturing: 75600,
                    'Trade, Transportation & Utilities': 260100,
                    'Professional & Business Services': 396400,
                    'Education & Health Services': 261700,
                    'Leisure & Hospitality': 157900,
                    Government: 198800
                }
            },
            2025: {
                unemploymentRate: 3.5,
                laborForceParticipationRate: 69.6,
                weeklyWages: {
                    'Natural Resources & Mining': 1760,
                    Construction: 1548,
                    Manufacturing: 1598,
                    'Trade, Transportation & Utilities': 1204,
                    'Professional & Business Services': 2082,
                    'Education & Health Services': 1378,
                    'Leisure & Hospitality': 807,
                    Government: 1444
                },
                industryEmployment: {
                    'Natural Resources & Mining': 5900,
                    Construction: 98400,
                    Manufacturing: 78400,
                    'Trade, Transportation & Utilities': 267600,
                    'Professional & Business Services': 411800,
                    'Education & Health Services': 271900,
                    'Leisure & Hospitality': 165300,
                    Government: 203500
                }
            }
        }
    }
};
