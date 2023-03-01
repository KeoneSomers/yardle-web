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
</script>

<template>
  <div>
    <div>
      <div>
        <h1 class="text-[27px]">
          {{ invoiceData.yard_id.name }}
        </h1>
      </div>
      <div class="border my-[10px]">
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
        <div class="border my-[10px]">
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
        <div></div>
      </div>
      <div>
        <table class="w-full">
          <thead>
            <tr>
              <th>Service</th>
              <th>booked for</th>
              <th v-if="yard.enabled_billing_late_booking_fee">booked late</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in itemsData"
              :key="item.id"
              class="border divide-x"
            >
              <td class="w-[40%] pb-[15px]">
                <div>
                  <p>
                    {{ item.service_name }}
                  </p>
                </div>
              </td>
              <td class="pb-[15px]">
                {{ DateTime.fromISO(item.date).toFormat("MMMM d, yyyy") }}
              </td>
              <td
                class="pb-[15px]"
                v-if="yard.enabled_billing_late_booking_fee"
              >
                {{ item.booked_late ? "Yes" : "No" }}
              </td>
              <td class="pb-[15px]">
                <div class="float-right">
                  <span>£{{ item.service_price.toFixed(2) }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="w-full">
          <table class="w-[40%] float-right mt-[10px]">
            <tr class="border divide-x">
              <td>Base Rate</td>
              <td>
                <span class="float-right">£{{ baseRate.toFixed(2) }}</span>
              </td>
            </tr>
            <tr class="border divide-x">
              <td>Services</td>
              <td>
                <span class="float-right">£{{ subtotal.toFixed(2) }}</span>
              </td>
            </tr>
            <tr class="border divide-x">
              <td>Subtotal</td>
              <td>
                <span class="float-right"
                  >£{{ (subtotal + baseRate).toFixed(2) }}</span
                >
              </td>
            </tr>
            <tr class="border divide-x">
              <td>Discount</td>
              <td>
                <span class="float-right"
                  >{{ discount }}% - £{{
                    (((subtotal + baseRate) * discount) / 100).toFixed(2)
                  }}</span
                >
              </td>
            </tr>
            <tr class="border divide-x">
              <td>Total</td>
              <td>
                <span class="float-right"
                  >£{{ (subtotal + baseRate - discount).toFixed(2) }}</span
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
