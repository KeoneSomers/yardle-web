<script setup lang="ts">
import { DateTime } from "luxon";

const {
  invoiceData,
  itemsData,
  client_name,
  client_email,
  yard,
  baseRate,
  subtotal,
  discount,
  discountNote,
} = defineProps([
  "invoiceData",
  "itemsData",
  "client_name",
  "client_email",
  "yard",
  "baseRate",
  "subtotal",
  "discount",
  "discountNote",
]);

const currencyFormatter = Intl.NumberFormat(yard.region.locale_code, {
  style: "currency",
  currency: yard.region.currency_iso_code,
});
</script>

<template>
  <div>
    <div>
      <div class="px-[15px] pb-[15px]">
        <h1 class="text-[27px]">
          {{ invoiceData.yard_id.name }}
        </h1>
      </div>
      <div class="my-[10px] border px-[15px] pb-[15px]">
        <p>Invoice number: INV{{ invoiceData.id * 36 }}</p>
        <div>
          <div>
            <div>
              Invoice Date:
              {{
                DateTime.fromISO(invoiceData.created_at).toFormat(
                  "EEEE, MMMM d, yyyy"
                )
              }}
            </div>
          </div>

          <div>
            <div>
              Due Date:
              {{
                DateTime.fromISO(invoiceData.created_at)
                  .plus({ weeks: 2 })
                  .toFormat("EEEE, MMMM d, yyyy")
              }}
            </div>
          </div>
          <div>
            <div>To: {{ client_name }} - {{ client_email }}</div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <div>
        <div class="my-[10px] border px-[15px] pb-[15px]">
          <p>
            Invoice - Livery services for {{ invoiceData.horse_id.name }} from
            <time :datetime="invoiceData.start_date">{{
              DateTime.fromISO(invoiceData.start_date).toFormat("MMMM d, yyyy")
            }}</time>
            to
            <time :datetime="invoiceData.end_date">{{
              DateTime.fromISO(invoiceData.end_date).toFormat("MMMM d, yyyy")
            }}</time
            >.
          </p>
        </div>
      </div>
      <div>
        <table class="w-full">
          <thead>
            <tr class="divide-x border bg-gray-50">
              <th class="pb-[15px]">Service</th>
              <th class="pb-[15px]">booked for</th>
              <th
                class="pb-[15px]"
                v-if="yard.enabled_billing_late_booking_fee"
              >
                booked late
              </th>
              <th class="pb-[15px]">Price</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in itemsData"
              :key="item.id"
              class="divide-x border"
            >
              <td class="w-[40%] px-[15px] pb-[15px]">
                <div>
                  <p>
                    {{ item.service_name }}
                  </p>
                </div>
              </td>
              <td class="px-[15px] pb-[15px]">
                {{ DateTime.fromISO(item.date).toFormat("MMMM d, yyyy") }}
              </td>
              <td
                class="px-[15px] pb-[15px]"
                v-if="yard.enabled_billing_late_booking_fee"
              >
                {{ item.booked_late ? "Yes" : "No" }}
              </td>
              <td class="px-[15px] pb-[15px]">
                <div class="float-right">
                  <span>
                    {{ currencyFormatter.format(item.service_price) }}</span
                  >
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="w-full">
          <table class="float-right mt-[10px] w-[40%]">
            <tr class="divide-x border">
              <td class="px-[15px] pb-[15px]">Subtotal</td>
              <td class="px-[15px] pb-[15px]">
                <span class="float-right">
                  {{ currencyFormatter.format(subtotal) }}</span
                >
              </td>
            </tr>
            <tr class="divide-x border">
              <td class="px-[15px] pb-[15px]">Base Rate</td>
              <td class="px-[15px] pb-[15px]">
                <span class="float-right">{{
                  currencyFormatter.format(baseRate)
                }}</span>
              </td>
            </tr>
            <tr class="divide-x border">
              <td class="px-[15px] pb-[15px]">Discount</td>
              <td class="px-[15px] pb-[15px]">
                <span class="float-right"
                  >{{ discount }}% -
                  {{
                    currencyFormatter.format(
                      ((subtotal + baseRate) * discount) / 100
                    )
                  }}</span
                >
              </td>
            </tr>
            <tr class="divide-x border">
              <td class="px-[15px] pb-[15px]">Total</td>
              <td class="px-[15px] pb-[15px]">
                <span class="float-right">
                  {{
                    currencyFormatter.format(
                      subtotal +
                        baseRate -
                        ((subtotal + baseRate) * discount) / 100
                    )
                  }}</span
                >
              </td>
            </tr>
          </table>
        </div>
        <div v-if="discountNote" class="text-gray-700">
          <p>Discount Note: {{ discountNote }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
