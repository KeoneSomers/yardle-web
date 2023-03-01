<script setup>
import { CloudArrowDownIcon } from "@heroicons/vue/20/solid";
// import * as htmlToImage from "html-to-image";
//import { toPng } from "html-to-image";
//import download from "downloadjs";
//import { exportToPDF } from "#imports";
// import jsPDF from "jspdf";

const { isDisabled, fileName } = defineProps(["isDisabled", "fileName"]);

const imgUrl = ref("");
const pdfSection = ref(null);

const downloadReportImage = () => {
  const report = document.getElementById("invoice-report");

  console.log(report.offsetWidth);

  // return;

  const newScale = report.offsetWidth / 1400;

  // save pdf
  exportToPDF(
    `${fileName}.pdf`,
    report,
    {
      orientation: "portrait",
      format: "A4",
    },
    {
      html2canvas: {
        scale: newScale,
        letterRendering: true,
        svgRendering: true,
      },
    }
  );
};
</script>

<template>
  <div>
    <button
      @click="downloadReportImage"
      :disabled="isDisabled"
      type="button"
      class="inline-flex mr-3 items-center rounded-md border border-transparent bg-pink-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
    >
      <CloudArrowDownIcon class="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
      Download Invoice
    </button>
    <div class="fixed right-0 top-0 -z-50">
      <img ref="pdfSection" :src="imgUrl" />
    </div>
  </div>
  <!-- <button
    @click="downloadReportImage"
    @click="
      exportToPDF('my-pdf-file.pdf', pdfSection, {
        format: 'A4',
        orientation: 'portrait',
      })
    "
    :disabled="client_email == '' || client_name == ''"
    class="shadow rounded border py-2 px-3 mr-2"
  >
    Download
  </button> -->
</template>
