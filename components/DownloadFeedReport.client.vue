<script setup>
// import * as htmlToImage from "html-to-image";
import { toPng } from "html-to-image";
import download from "downloadjs";

const downloadReportImage = () => {
  const report = document.getElementById("feed-report");

  const NodesToRemove = report.querySelectorAll("#feed-report-actions");

  NodesToRemove.forEach((node) => {
    node.style.display = "none";
  });

  toPng(report).then(function (dataUrl) {
    download(dataUrl, "feed-report.png");

    NodesToRemove.forEach((node) => {
      node.style.display = "";
    });
  });
};
</script>

<template>
  <div>
    <button
      @click="downloadReportImage"
      type="button"
      class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
    >
      Download Report
    </button>
    <slot />
  </div>
</template>
