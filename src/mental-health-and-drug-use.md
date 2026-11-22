---
title: Treatment Gap in the U.S.
toc: false
---

```js
// Load data
const data = await FileAttachment("data/nsduh_2025_cleaned.csv").csv({typed: true});
```

```js
// Color scheme
const colors = {
  mental: "#2468A2",
  drug: "#E58A9D",
  both: "#754387",
  neutral: "#D4D6D8",
  text: "#222222"
};
```

```js
// Estimate total adult population using survey weights
const totalAdults = d3.sum(
  data,
  d => d.survey_weight
);

// Estimate the adult population with mental illness
const totalMentalIllness = d3.sum(
  data.filter(d => d.mental_illness === 1),
  d => d.survey_weight
);

// Estimate the adult population with a drug use disorder
const totalDrugUseDisorder = d3.sum(
  data.filter(d => d.drug_use_disorder === 1),
  d => d.survey_weight
);

// Calculate weighted prevalence percentages
const mentalIllnessPercent = (totalMentalIllness / totalAdults) * 100;
const drugUseDisorderPercent = (totalDrugUseDisorder / totalAdults) * 100;
```

```js
// Create 100 dots arranged in a 10-by-10 grid
const dots = d3.range(100).map(i => ({
  index: i,
  x: i % 10,
  y: Math.floor(i / 10)
}));
```

```js
// Define the three stages of the narrative
const stages = [
  {
    label: "All U.S. adults",
    headline: "Start with 100 American adults.",
    description: "Each dot represents approximately 1% of the U.S. adult population.",
    percent: 0,
    color: colors.neutral
  },
  {
    label: "Mental illness",
    headline: "How common is mental illness?",
    description: `${mentalIllnessPercent.toFixed(1)}% of U.S. adults experienced mental illness in the past year.`,
    percent: mentalIllnessPercent,
    color: colors.mental
  },
  {
    label: "Drug use disorder",
    headline: "How common are drug use disorders?",
    description: `${drugUseDisorderPercent.toFixed(1)}% of U.S. adults had a drug use disorder in the past year.`,
    percent: drugUseDisorderPercent,
    color: colors.drug
  }
];
```

```js
// Temporarily select a narrative stage to test the visualization
const stage = view(Inputs.radio([0, 1, 2], {
  format: i => stages[i].label,
  value: 0
}));
```

### ${stages[stage].headline}

${stages[stage].description}

```js
// Render the population grid for the selected narrative stage
Plot.plot({
  width: 320,
  height: 320,
  margin: 15,

  // Hide axes because coordinates only determine layout
  x: {axis: null, domain: [0, 9]},
  y: {axis: null, domain: [0, 9], reverse: true},

  marks: [
    Plot.dot(dots, {
      x: "x",
      y: "y",

      // Equal-sized dots represent equal population shares
      r: 12,

      // Highlight the relevant population for each stage
      fill: d => d.index < Math.round(stages[stage].percent)
        ? stages[stage].color
        : colors.neutral
    })
  ]
})
```

*Each dot represents approximately 1% of U.S. adults.*

*Source: 2025 National Survey on Drug Use and Health (NSDUH). Estimates are survey weighted.*