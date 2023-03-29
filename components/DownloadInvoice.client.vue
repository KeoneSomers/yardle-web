<script setup>
const { isDisabled, fileName } = defineProps(["isDisabled", "fileName"]);

const downloadReportImage = () => {
  const report = document.getElementById("invoice-report");

  // return;

  const newScale = report.offsetWidth / 1410;

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
      class="mt-2 inline-flex w-full items-center justify-center rounded-lg border border-transparent bg-pink-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 md:mt-0"
    >
      <icon
        name="heroicons:cloud-arrow-down-solid"
        class="-ml-1 mr-3 h-5 w-5"
        aria-hidden="true"
      />
      Download Invoice
    </button>
  </div>
</template>
