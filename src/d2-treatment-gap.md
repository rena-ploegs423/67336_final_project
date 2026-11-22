---
title: The Treatment Gap
toc: false
theme: [air, wide]
---

# The Treatment Gap

```js
const data = await FileAttachment("data/nsduh_2025_cleaned.csv").csv({typed: true});

const colors = {
  mental: "#2468A2",
  drug: "#E58A9D",
  both: "#754387",
  neither: "#777D85",
  neutral: "#D4D6D8",
  text: "#222222"
};
```

<style>
  #observablehq-main {
    max-width: none !important;
    width: 100%;
    box-sizing: border-box;
    padding-left: clamp(24px, 3vw, 64px);
    padding-right: clamp(24px, 3vw, 64px);
  }

  /* FULL-WIDTH INTRODUCTION */

  .treatment-intro {
    min-height: 85vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-sizing: border-box;
    padding: 35px 0 65px;
    width: 100%;
  }

  .treatment-intro-heading {
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: clamp(30px, 3vw, 46px);
    font-weight: 650;
    line-height: 1.2;
    letter-spacing: -0.02em;
    max-width: 1000px;
    margin: 0 0 14px;
  }

  .treatment-intro-description {
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: clamp(16px, 1.25vw, 19px);
    line-height: 1.5;
    max-width: 800px;
    margin: 0 0 50px;
    color: var(--theme-foreground-muted);
  }

  .treatment-intro .treatment-visual {
    width: 100%;
  }

  .treatment-intro .treatment-legend {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  /* SCROLLING SECTIONS */

  .treatment-scrolly {
    display: grid;
    grid-template-columns: minmax(0, 0.65fr) minmax(0, 1.35fr);
    column-gap: clamp(28px, 3vw, 60px);
    align-items: start;
    width: 100%;
    margin-top: 20px;
  }

  .treatment-story {
    min-width: 0;
  }

  .treatment-step {
    min-height: 82vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-sizing: border-box;
    padding: 30px 0;
  }

  .treatment-step h2 {
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: clamp(25px, 2.2vw, 36px);
    font-weight: 650;
    line-height: 1.25;
    letter-spacing: -0.015em;
    margin: 0 0 14px;
    max-width: 480px;
  }

  .treatment-step p {
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: clamp(16px, 1.2vw, 18px);
    line-height: 1.55;
    margin: 0;
    max-width: 430px;
  }

  .treatment-stat {
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: clamp(58px, 5vw, 88px);
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.035em;
    margin-bottom: 18px;
  }

  .treatment-sticky {
    position: sticky;
    top: 10vh;
    height: 80vh;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-sizing: border-box;
  }

  /* CHART */

  .treatment-visual {
    width: 100%;
    min-width: 0;
  }

  .treatment-context {
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: 17px;
    font-weight: 600;
    margin-bottom: 20px;
  }

  .treatment-visual svg {
    display: block;
    width: 100%;
    height: auto;
    max-width: none;
  }

  .treatment-axis {
    display: flex;
    justify-content: space-between;
    margin-top: 12px;
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: 14px;
    color: var(--theme-foreground-muted);
  }

  .treatment-legend {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 24px;
    row-gap: 15px;
    margin-top: 30px;
  }

  .treatment-legend-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: 15px;
    line-height: 1.4;
  }

  .treatment-swatch {
    display: inline-block;
    width: 14px;
    height: 14px;
    flex: 0 0 14px;
  }

  .treatment-note {
    margin-top: 22px;
    color: var(--theme-foreground-muted);
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: 14px;
    line-height: 1.55;
    max-width: 700px;
  }

  .treatment-bar-label {
    fill: white;
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: 28px;
    font-weight: 700;
    pointer-events: none;
  }

  .treatment-source {
    margin-top: 35px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--theme-foreground-muted);
  }

  @media (max-width: 900px) {
    .treatment-scrolly {
      grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
      column-gap: 24px;
    }

    .treatment-step h2 {
      font-size: 27px;
    }

    .treatment-stat {
      font-size: 60px;
    }

    .treatment-legend {
      column-gap: 12px;
      row-gap: 10px;
    }

    .treatment-legend-item {
      font-size: 13px;
    }
  }

  @media (max-width: 700px) {
    #observablehq-main {
      padding-left: 16px;
      padding-right: 16px;
    }

    .treatment-intro {
      min-height: 75vh;
      padding: 35px 0;
    }

    .treatment-intro-heading {
      font-size: 30px;
    }

    .treatment-intro-description {
      font-size: 16px;
      margin-bottom: 35px;
    }

    .treatment-intro .treatment-legend {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .treatment-scrolly {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .treatment-story {
      width: 100%;
    }

    .treatment-sticky {
      order: -1;
      position: sticky;
      align-self: stretch;
      top: 0;
      height: auto;
      min-height: 250px;
      padding: 20px 0;
      background: var(--theme-background);
      z-index: 2;
    }

    .treatment-step {
      min-height: 72vh;
      padding: 25px 0;
    }

    .treatment-step h2 {
      font-size: 27px;
    }

    .treatment-stat {
      font-size: clamp(52px, 11vw, 72px);
    }

    .treatment-context {
      font-size: 14px;
    }

    .treatment-legend {
      margin-top: 18px;
    }

    .treatment-legend-item {
      font-size: 12px;
    }

    .treatment-note {
      font-size: 12px;
    }
  }
</style>

## Who receives treatment for both conditions?

```js
const bothConditions = data.filter(
  d => d.mental_illness === 1 && d.drug_use_disorder === 1
);

function getTreatmentCategory(d) {
  const mental = d.mental_health_treatment;
  const drug = d.drug_treatment;

  if (mental !== 0 && mental !== 1) return "Unspecified";
  if (drug !== 0 && drug !== 1) return "Unspecified";

  if (mental === 1 && drug === 1) return "Both treatments";
  if (mental === 1) return "Mental health only";
  if (drug === 1) return "Drug treatment only";

  return "Neither";
}

const treatmentCategories = [
  {
    category: "Both treatments",
    color: colors.both
  },
  {
    category: "Mental health only",
    color: colors.mental
  },
  {
    category: "Drug treatment only",
    color: colors.drug
  },
  {
    category: "Neither",
    color: colors.neither
  },
  {
    category: "Unspecified",
    color: colors.neutral
  }
];

const totalBothWeight = d3.sum(
  bothConditions,
  d => d.survey_weight
);

const treatmentResults = treatmentCategories.map(d => {
  const weight = d3.sum(
    bothConditions.filter(
      row => getTreatmentCategory(row) === d.category
    ),
    row => row.survey_weight
  );

  return {
    ...d,
    weight,
    percent: totalBothWeight
      ? weight / totalBothWeight * 100
      : 0
  };
});

const treatmentByCategory = Object.fromEntries(
  treatmentResults.map(d => [d.category, d])
);

const bothTreatmentPercent =
  treatmentByCategory["Both treatments"].percent;

const mentalOnlyTreatmentPercent =
  treatmentByCategory["Mental health only"].percent;

const drugOnlyTreatmentPercent =
  treatmentByCategory["Drug treatment only"].percent;

const neitherTreatmentPercent =
  treatmentByCategory["Neither"].percent;

const unspecifiedTreatmentPercent =
  treatmentByCategory["Unspecified"].percent;
```

```js
// Calculate the position of each bar segment.
let barPosition = 0;

const treatmentBarData = treatmentResults.map(d => {
  const result = {
    ...d,
    start: barPosition
  };

  barPosition += d.percent;

  return result;
});

// Create the SVG bar.
const treatmentBar = d3.create("svg")
  .attr("viewBox", "0 0 1000 170")
  .attr("role", "img")
  .attr(
    "aria-label",
    "Treatment received among adults with both mental illness and a drug use disorder."
  );

const treatmentSegments = treatmentBar
  .selectAll(".treatment-segment")
  .data(treatmentBarData)
  .join("rect")
  .attr("class", "treatment-segment")
  .attr("data-category", d => d.category)
  .attr("x", d => d.start * 10)
  .attr("y", 0)
  .attr("width", d => d.percent * 10)
  .attr("height", 170)
  .attr("fill", d => d.color);

// Add labels to segments large enough to fit them.
const treatmentBarLabels = treatmentBar
  .selectAll(".treatment-bar-label")
  .data(treatmentBarData.filter(d => d.percent >= 9))
  .join("text")
  .attr("class", "treatment-bar-label")
  .attr("x", d => (d.start + d.percent / 2) * 10)
  .attr("y", 85)
  .attr("text-anchor", "middle")
  .attr("dominant-baseline", "middle")
  .text(d => `${d.percent.toFixed(1)}%`);

const treatmentSvg = treatmentBar.node();
```

```js
const treatmentChart = html`
  <div class="treatment-visual">

    <div class="treatment-context">
      Among adults with both conditions
    </div>

    ${treatmentSvg}

    <div class="treatment-axis">
      <span>0%</span>
      <span>25%</span>
      <span>50%</span>
      <span>75%</span>
      <span>100%</span>
    </div>

    <div class="treatment-legend">
      ${treatmentResults.map(d => html`
        <div
          class="treatment-legend-item"
          data-category="${d.category}"
        >
          <span
            class="treatment-swatch"
            style="background: ${d.color}"
          ></span>
          <span>
            ${d.category}: ${d.percent.toFixed(1)}%
          </span>
        </div>
      `)}
    </div>

    <div class="treatment-note">
      Percentages are survey-weighted.
      Missing treatment responses are shown separately
      rather than counted as receiving no treatment.
    </div>

  </div>
`;
```

```js
// First screen: full-width text and bar.
const treatmentIntro = html`
  <section class="treatment-intro">

    <h2 class="treatment-intro-heading">
      Having both conditions does not mean
      receiving treatment for both.
    </h2>

    <p class="treatment-intro-description">
      Here's how treatment breaks down among adults
      who experienced both conditions.
    </p>

    ${treatmentChart.cloneNode(true)}

  </section>
`;
```

${treatmentIntro}

```js
// Remaining screens: text on the left, chart on the right.
const treatmentNarrative = html`
  <div class="treatment-story">

    <div class="treatment-step" data-stage="1">
      <div
        class="treatment-stat"
        style="color: ${colors.both}"
      >
        ${bothTreatmentPercent.toFixed(1)}%
      </div>

      <h2>
        received treatment for both conditions.
      </h2>
    </div>

    <div class="treatment-step" data-stage="2">
      <div
        class="treatment-stat"
        style="color: ${colors.mental}"
      >
        ${mentalOnlyTreatmentPercent.toFixed(1)}%
      </div>

      <h2>
        received mental health treatment only.
      </h2>
    </div>

    <div class="treatment-step" data-stage="3">
      <div
        class="treatment-stat"
        style="color: ${colors.drug}"
      >
        ${drugOnlyTreatmentPercent.toFixed(1)}%
      </div>

      <h2>
        received drug use treatment only.
      </h2>
    </div>

    <div class="treatment-step" data-stage="4">
      <div
        class="treatment-stat"
        style="color: ${colors.neither}"
      >
        ${neitherTreatmentPercent.toFixed(1)}%
      </div>

      <h2>
        received neither type of treatment.
      </h2>
    </div>

    <div class="treatment-step" data-stage="5">
      <div
        class="treatment-stat"
        style="color: ${colors.both}"
      >
        ${bothTreatmentPercent.toFixed(1)}%
      </div>

      <h2>
        received treatment for both conditions.
      </h2>

      <p>
        The remaining adults received only one type of treatment,
        neither type, or had unspecified responses.
      </p>
    </div>

  </div>
`;
```

```js
const treatmentSection = html`
  <div class="treatment-scrolly">

    ${treatmentNarrative}

    <div class="treatment-sticky">
      ${treatmentChart}
    </div>

  </div>
`;
```

${treatmentSection}

```js
const treatmentSteps =
  treatmentNarrative.querySelectorAll(".treatment-step");

const legendItems = d3.select(treatmentChart)
  .selectAll(".treatment-legend-item");

const treatmentHighlight = [
  null,
  "Both treatments",
  "Mental health only",
  "Drug treatment only",
  "Neither",
  "Both treatments"
];

function renderTreatment(stageIndex) {
  const selected = treatmentHighlight[stageIndex];

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const duration = reducedMotion ? 0 : 600;

  treatmentSegments
    .interrupt()
    .transition()
    .duration(duration)
    .ease(d3.easeCubicInOut)
    .attr("opacity", d =>
      !selected || d.category === selected ? 1 : 0.2
    );

  treatmentBarLabels
    .interrupt()
    .transition()
    .duration(duration)
    .attr("opacity", d =>
      !selected || d.category === selected ? 1 : 0.2
    );

  legendItems
    .interrupt()
    .transition()
    .duration(duration)
    .style("opacity", function() {
      const category = this.getAttribute("data-category");

      return !selected || category === selected
        ? 1
        : 0.3;
    });
}
```

```js
function getTreatmentStage() {
  const screenMiddle = window.innerHeight / 2;

  let closestStage = 1;
  let closestDistance = Infinity;

  treatmentSteps.forEach(step => {
    const bounds = step.getBoundingClientRect();
    const middle = bounds.top + bounds.height / 2;

    const distance = Math.abs(middle - screenMiddle);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestStage = Number(step.dataset.stage);
    }
  });

  return closestStage;
}

let activeTreatmentStage = -1;

function handleTreatmentScroll() {
  if (!treatmentSection.isConnected) return;

  const nextStage = getTreatmentStage();

  if (nextStage !== activeTreatmentStage) {
    activeTreatmentStage = nextStage;
    renderTreatment(nextStage);
  }
}

window.addEventListener(
  "scroll",
  handleTreatmentScroll,
  {passive: true}
);

window.addEventListener(
  "resize",
  handleTreatmentScroll
);

const treatmentFrame =
  requestAnimationFrame(handleTreatmentScroll);

invalidation.then(() => {
  cancelAnimationFrame(treatmentFrame);

  treatmentSegments.interrupt();
  treatmentBarLabels.interrupt();
  legendItems.interrupt();

  window.removeEventListener(
    "scroll",
    handleTreatmentScroll
  );

  window.removeEventListener(
    "resize",
    handleTreatmentScroll
  );
});
```

<div class="treatment-source">
Source: SAMHSA, 2025 National Survey on Drug Use and Health (NSDUH). Estimates are survey-weighted for U.S. adults aged 18 and older. Receiving both treatment types does not necessarily mean treatment was integrated or simultaneous.
</div>