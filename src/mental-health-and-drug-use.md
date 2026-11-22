---
title: Treatment Gap in the U.S.
toc: false
---

```js
// Load data
const data = await FileAttachment("data/nsduh_2024_cleaned.csv").csv({typed: true});
```

```js
// Verify that the data loaded correctly
display(`Total adult respondents: ${data.length}`);
```