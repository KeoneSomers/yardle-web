<script setup>
import { toPng } from "html-to-image";
import download from "downloadjs";

const downloadReportImage = () => {
  const report = document.getElementById("feed-report");

  // const newScale = report.offsetWidth / 4000;

  const NodesToRemove = report.querySelectorAll("#feed-report-actions");

  // hide some elements from pdf
  NodesToRemove.forEach((node) => {
    node.style.display = "none";
  });

  // exportToPDF(
  //   `feedreport.pdf`,
  //   report,
  //   {
  //     orientation: "landscape",
  //     format: "A4",
  //   },
  //   {
  //     html2canvas: {
  //       scale: newScale,
  //       letterRendering: true,
  //       svgRendering: true,
  //     },
  //   }
  // );

  // // show elements again
  // NodesToRemove.forEach((node) => {
  //   node.style.display = "";
  // });

  toPng(report).then(function (dataUrl) {
    // download image
    download(dataUrl, "feed-report.png");

    // show elements again
    NodesToRemove.forEach((node) => {
      node.style.display = "";
    });
  });
};
</script>

<template>
  <div class="hidden lg:block">
    <button
      @click="downloadReportImage"
      type="button"
      class="inline-flex items-center whitespace-nowrap rounded-md border border-transparent bg-pink-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
    >
      <icon
        name="heroicons:cloud-arrow-down-solid"
        class="-ml-1 mr-3 h-5 w-5"
        aria-hidden="true"
      />
      Download Report
    </button>
    <slot />
  </div>
</template>
