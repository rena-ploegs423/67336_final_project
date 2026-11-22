// See https://observablehq.com/framework/config for documentation.
export default {
  // The app’s title; used in the sidebar and webpage titles.
  title: "Final Project",

  // The pages and sections in the sidebar. 
  pages: [
    {name: "Overdose Deaths", path: "/d0-overdose-trend"},
    {name: "Overdose Deaths Option 2", path: "/d0-v2-overdose-trend"},
    {name: "Mental Illness & Drug Use", path: "/d1-mental-health-and-drug-use"},
    {name: "The Treatment Gap", path: "/d2-treatment-gap"},
    {name: "Geographic Treatment Gaps", path: "/d3-state-treatment-gaps"}
  ],

  // Content to add to the head of the page, e.g. for a favicon:
  head: '<link rel="icon" href="observable.png" type="image/png" sizes="32x32">',

  // The path to the source root.
  root: "src",

  // Some additional configuration options and their defaults:
  // Light theme everywhere so pages don't flip to dark with the OS setting.
  theme: ["air", "wide"],
  // header: "", // what to show in the header (HTML)
  // footer: "Built with Observable.", // what to show in the footer (HTML)
  // sidebar: true, // whether to show the sidebar
  // toc: true, // whether to show the table of contents
  // pager: true, // whether to show previous & next links in the footer
  // output: "dist", // path to the output root for build
  // search: true, // activate search
  // linkify: true, // convert URLs in Markdown to links
  // typographer: false, // smart quotes and other typographic improvements
  cleanUrls: false, // drop .html from URLs
};
