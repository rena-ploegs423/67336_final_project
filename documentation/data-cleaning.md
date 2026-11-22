# 2025 NSDUH Data Cleaning

## Raw Data
```js
const raw = await FileAttachment("data/nsduh.csv").csv({typed: true});
```

## Data Quality Checks
// Display the original number of rows and columns
```js
display(`Rows: ${raw.length}`);
```

// Preview the first five entries of the dataset
```js
Inputs.table(raw.slice(0, 5))
```

// Inspect the original variable names
```js
Object.keys(raw[0])
```

## Data Cleaning
### Select and Rename Variables

```js
// Select variables relevant to research questions 1-4
// Rename variables for readability
const selected = raw.map(d => ({
  // Respondent identification and demographics
  respondent_id: d.QUESTID2,
  age_category: d.CATAGE,

  // Past-year mental illness and drug use disorder indicators
  mental_illness: d.AMI5YR,
  drug_use_disorder: d.UD5ILLANY,

  // Past-year treatment indicators
  mental_health_treatment: d.MHTRTPY3,
  drug_treatment: d.SUTRTDRGPY3,
  drug_alcohol_treatment: d.SUTRTDRALPY3,

  // Survey weight and sampling design variables
  survey_weight: d.ANALWT2_C,
  survey_stratum: d.VESTR_C,
  survey_replicate: d.VEREP
}));
```

```js
// Verify that column selection preserved all respondents
display(`Rows: ${selected.length}`);
display(`Columns: ${Object.keys(selected[0]).length}`);
```

```js
// Preview the selected and renamed variables
Inputs.table(selected.slice(0, 5))
```

### Missing Values

```js
// Count missing values in the selected demographic variables
const missingIds = selected.filter(d => d.respondent_id == null).length;
const missingAge = selected.filter(d => d.age_category == null).length;

// Count missing values in mental health and drug use variables
const missingAMI = selected.filter(d => d.mental_illness == null).length;
const missingDUD = selected.filter(d => d.drug_use_disorder == null).length;

// Count missing values in treatment variables
const missingMHTreatment = selected.filter(d => d.mental_health_treatment == null).length;
const missingDrugTreatment = selected.filter(d => d.drug_treatment == null).length;
const missingDrugAlcoholTreatment = selected.filter(d => d.drug_alcohol_treatment == null).length;

// Count missing values in survey weight and design variables
const missingWeights = selected.filter(d => d.survey_weight == null).length;
const missingStratum = selected.filter(d => d.survey_stratum == null).length;
const missingReplicate = selected.filter(d => d.survey_replicate == null).length;

// Display the missing value counts
display(`Missing respondent IDs: ${missingIds}`);
display(`Missing age categories: ${missingAge}`);
display(`Missing mental illness values: ${missingAMI}`);
display(`Missing drug use disorder values: ${missingDUD}`);
display(`Missing mental health treatment values: ${missingMHTreatment}`);
display(`Missing drug treatment values: ${missingDrugTreatment}`);
display(`Missing drug and alcohol treatment values: ${missingDrugAlcoholTreatment}`);
display(`Missing survey weights: ${missingWeights}`);
display(`Missing survey strata: ${missingStratum}`);
display(`Missing survey replicates: ${missingReplicate}`);
```

### Duplicate Respondents

```js
// Extract all respondent IDs
const ids = selected.map(d => d.respondent_id);

// Compare the total number of IDs with the number of unique IDs
const extraCopies = ids.length - new Set(ids).size;

// Display the number of duplicate records
display(`Extra rows with a repeated respondent ID: ${extraCopies}`);
```

### Incorrect Data Types

```js
// Check that demographic variables are numeric
display(`Respondent IDs stored as numbers: ${selected.filter(d => typeof d.respondent_id === "number").length}`);
display(`Age categories stored as numbers: ${selected.filter(d => typeof d.age_category === "number").length}`);

// Check that nonmissing illness and disorder indicators are numeric
display(`Mental illness values with incorrect types: ${selected.filter(d => d.mental_illness != null && typeof d.mental_illness !== "number").length}`);
display(`Drug use disorder values with incorrect types: ${selected.filter(d => d.drug_use_disorder != null && typeof d.drug_use_disorder !== "number").length}`);

// Check that treatment indicators are numeric
display(`Mental health treatment values with incorrect types: ${selected.filter(d => d.mental_health_treatment != null && typeof d.mental_health_treatment !== "number").length}`);
display(`Drug treatment values with incorrect types: ${selected.filter(d => d.drug_treatment != null && typeof d.drug_treatment !== "number").length}`);
display(`Drug and alcohol treatment values with incorrect types: ${selected.filter(d => d.drug_alcohol_treatment != null && typeof d.drug_alcohol_treatment !== "number").length}`);

// Check that survey weights and design variables are numeric
display(`Survey weights with incorrect types: ${selected.filter(d => typeof d.survey_weight !== "number").length}`);
display(`Survey strata with incorrect types: ${selected.filter(d => typeof d.survey_stratum !== "number").length}`);
display(`Survey replicates with incorrect types: ${selected.filter(d => typeof d.survey_replicate !== "number").length}`);
```

### Unique Category Values

```js
// Identify all unique age category codes
const ageCategories = [...new Set(selected.map(d => d.age_category))].sort();

// Identify all unique mental illness and drug use disorder codes
const mentalIllnessCategories = [...new Set(selected.map(d => d.mental_illness))].sort();
const drugDisorderCategories = [...new Set(selected.map(d => d.drug_use_disorder))].sort();

// Identify all unique treatment codes
const mentalTreatmentCategories = [...new Set(selected.map(d => d.mental_health_treatment))].sort();
const drugTreatmentCategories = [...new Set(selected.map(d => d.drug_treatment))].sort();
const drugAlcoholTreatmentCategories = [...new Set(selected.map(d => d.drug_alcohol_treatment))].sort();

// Display the unique values for each variable
display("Age categories:");
display(ageCategories);

display("Mental illness categories:");
display(mentalIllnessCategories);

display("Drug use disorder categories:");
display(drugDisorderCategories);

display("Mental health treatment categories:");
display(mentalTreatmentCategories);

display("Drug treatment categories:");
display(drugTreatmentCategories);

display("Drug and alcohol treatment categories:");
display(drugAlcoholTreatmentCategories);
```

### Investigate Missing Mental Illness Values

```js
// Identify respondents with missing mental illness values
const missingMentalIllness = selected.filter(d => d.mental_illness == null);

// Identify the age categories of these respondents
const missingAMIAgeCategories = [...new Set(
  missingMentalIllness.map(d => d.age_category)
)].sort();

// Count respondents in the youngest age category
const youngestRespondents = selected.filter(d => d.age_category === 1).length;

// Check for missing mental illness values outside the youngest age category
const missingAMIOutsideYoungest = selected.filter(d =>
  d.age_category !== 1 && d.mental_illness == null
).length;

// Display the results
display(`Respondents with missing mental illness values: ${missingMentalIllness.length}`);

display("Age categories with missing mental illness values:");
display(missingAMIAgeCategories);

display(`Respondents in age category 1: ${youngestRespondents}`);
display(`Missing mental illness values outside age category 1: ${missingAMIOutsideYoungest}`);
```


### Outliers and Placeholder Values

```js
// Find the minimum and maximum survey weights
display(`Minimum survey weight: ${d3.min(selected, d => d.survey_weight)}`);
display(`Maximum survey weight: ${d3.max(selected, d => d.survey_weight)}`);

// Calculate the mean and median survey weights
display(`Mean survey weight: ${d3.mean(selected, d => d.survey_weight)}`);
display(`Median survey weight: ${d3.median(selected, d => d.survey_weight)}`);

// Check for zero or negative survey weights
const invalidWeights = selected.filter(d =>
  d.survey_weight <= 0
).length;

// Display the number of invalid weights
display(`Zero or negative survey weights: ${invalidWeights}`);
```

## Cleaned Data
### Filter to Adult Respondents

```js
// Respondents 18 and older
const adults = selected.filter(d =>
  d.age_category === 2 ||
  d.age_category === 3 ||
  d.age_category === 4
);

// Compare the original and adult analysis populations
display(`Original respondents: ${selected.length}`);
display(`Adult respondents: ${adults.length}`);
display(`Respondents excluded: ${selected.length - adults.length}`);
```

```js
// Define age category labels using the 2024 NSDUH codebook
const ageLabels = {
  1: "12-17",
  2: "18-25",
  3: "26-34",
  4: "35+"
};

// Convert an age code into a readable age group
function cleanAge(code) {
  return ageLabels[code] ?? "Unknown";
}

// Convert binary survey indicators into readable labels
function cleanBinary(code) {
  if (code === 1) return "Yes";
  if (code === 0) return "No";
  return "Unknown";
}

// Convert drug treatment codes using the codebook definitions
// Convert drug treatment codes using the 2025 codebook
function cleanDrugTreatment(code) {
  if (code === 1) return "Yes";
  if (code === 0) return "No";
  return "Unspecified";
}
```

```js
// Apply cleaning rules to the adult dataset
// Preserve original numerical codes and add readable labels
const normalized = adults.map(d => ({
  ...d,

  // Convert age category into a readable age group
  age_group: cleanAge(d.age_category),

  // Add readable mental illness and drug use disorder labels
  mental_illness_label: cleanBinary(d.mental_illness),
  drug_use_disorder_label: cleanBinary(d.drug_use_disorder),

  // Add readable treatment labels
  mental_health_treatment_label: cleanBinary(d.mental_health_treatment),
  drug_treatment_label: cleanDrugTreatment(d.drug_treatment)
}));
```
### Before and After Comparison

```js
// Compare the original and cleaned datasets
display(`Raw rows: ${raw.length}`);
display(`Cleaned rows: ${normalized.length}`);
display(`Rows excluded: ${raw.length - normalized.length}`);
```

### Validate Cleaned Categories

```js
// Verify the cleaned age groups
display("Age groups:");
display([...new Set(normalized.map(d => d.age_group))].sort());

// Verify the cleaned mental illness and drug use disorder labels
display("Mental illness:");
display([...new Set(normalized.map(d => d.mental_illness_label))].sort());

display("Drug use disorder:");
display([...new Set(normalized.map(d => d.drug_use_disorder_label))].sort());

// Verify the cleaned treatment labels
display("Mental health treatment:");
display([...new Set(normalized.map(d => d.mental_health_treatment_label))].sort());

display("Drug treatment:");
display([...new Set(normalized.map(d => d.drug_treatment_label))].sort());
```

### Export Cleaned Data

```js
// Convert the cleaned dataset into CSV format
const cleanedCSV = d3.csvFormat(normalized);

// Create a downloadable CSV file
display(Inputs.button("Download Cleaned CSV", {
  reduce: () => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob([cleanedCSV], {type: "text/csv"})
    );
    link.download = "nsduh_2025_cleaned.csv";
    link.click();
  }
}));
```