const builderRecord = {
    "text": "Alice",
    "id": "alice.jones@company.com",
    "phone": "720453674",
    "url": "https://www.example.com",
    "number": 12345678,
    "decimal": 54321.123,
    "dateonly": "2024-10-05",
    "datetime": "2023-01-15T08:45:30",
    "duration": 8000,
    "currency": 450000,
    "optionset": 2,
    "optionsetcolorful": 2,
    "multiselectoptionset": "1",
    "multiselectoptionsetcolorful": "1",
    "multilinetext": "Alice is a senior project manager with expertise in tech solutions.",
    "twooptions": true,
    "twooptionscolorful": 1,
}

export const builderMetadata = {
    PrimaryIdAttribute: "id",
    PrimaryNameAttribute: "text",
}

export const getBuilderRecord = () => builderRecord
