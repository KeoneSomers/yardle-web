<script setup>
import { CloudArrowDownIcon } from "@heroicons/vue/20/solid";
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
      class="inline-flex items-center rounded-md border border-transparent bg-pink-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
    >
      <CloudArrowDownIcon class="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
      Download Report
    </button>
    <slot />
  </div>
</template>
