<script setup>
import { DateTime, Info } from "luxon";

definePageMeta({
  middleware: ["require-auth", "require-yard"],
});

const client = useSupabaseClient();
const selectedYard = useSelectedYardId();

const toast = useToast();

const selectedDate = ref(DateTime.now().toISODate());

const createModalOpen = ref(false);
const editModalOpen = ref(false);
const deleteModalOpen = ref(false);

const selectedEvent = ref(null);

const openEditModal = (e) => {
  selectedEvent.value = e;
  editModalOpen.value = true;
};

const openDeleteModal = (e) => {
  selectedEvent.value = e.id;
  deleteModalOpen.value = true;
};

const { data: eventTypes, error: eventTypesError } = await client
  .from("calendar_event_types")
  .select();

const offset = ref(0);
const dt = ref(DateTime.now());
const trueDateTime = DateTime.now();

const days = useState("days", () => []);
const events = useState("events", () => []);

const getEvents = async () => {
  await useAsyncData("events", async () => {
    const { data } = await client
      .from("calendar_events")
      .select("*, horses(id, name, avatar_url, avatar_background)")
      .order("all_day", { ascending: false })
      .order("date_time", { ascending: true })
      .eq("yard_id", selectedYard.value);

    events.value = data;
  });
};

const setDays = async () => {
  const firstWeekdayOfMonth = dt.value.startOf("month").weekday;
  const firstDay = ref(
    dt.value.startOf("month").minus({
      // days: 6 - (7 - firstWeekdayOfMonth),
      days: firstWeekdayOfMonth - 1,
    })
  );
  let i = 0;
  days.value = [];

  while (i < 42) {
    const day = firstDay.value.plus({ days: i });
    // add  events from events array
    // TODO: This could be optimised I think.
    if (events.value) {
      day.events = events.value.filter((e) => {
        return (
          DateTime.fromISO(e.date_time).toLocaleString() ===
          day.toLocaleString()
        );
      });
    }
    days.value.push(day);
    i++;
  }
};

// get events on server
await getEvents();

onMounted(async () => {
  // get days on client (needs to use local time)
  //  await setDays();

  // watch for added events
  // TODO: have days be stored in useState and add the event
  // directly to the day when it's created (big optimisation)
  watchEffect(async () => {
    if (events.value) {
      await setDays();
    }
  });
});

const goToNextMonth = () => {
  offset.value++;
  dt.value = DateTime.now().plus({ months: offset.value });
  setDays();
};

const goToPreviousMonth = () => {
  offset.value--;
  dt.value = DateTime.now().plus({ months: offset.value });
  setDays();
};

const goToCurrentMonth = () => {
  offset.value = 0;
  dt.value = DateTime.now().plus({ months: offset.value });
  setDays();
};

const selDay = useState("selDay", () => null);
const createEvent = (e, day) => {
  if (e.target.classList.contains("create-event")) {
    if (day) {
      selDay.value = day;
      createModalOpen.value = true;
    } else {
      selDay.value = null;
      createModalOpen.value = true;
    }
  }
};

const handleDelete = async () => {
  // first delete the horses
  const { error: delError } = await client
    .from("calendar_events_horses")
    .delete()
    .eq("calendar_event_id", selectedEvent.value);

  if (delError) {
    return;
  }

  // now delete the event itself
  const { data, error } = await client
    .from("calendar_events")
    .delete()
    .eq("id", selectedEvent.value)
    .select();

  if (data) {
    // success! - now remove the deleted feed from the webpage
    const index = events.value.map((e) => e.id).indexOf(selectedEvent.value);
    events.value.splice(index, 1);

    toast.add({
      title: "Event Deleted!",
      description: "Your event has been deleted.",
    });

    // close the modal
    deleteModalOpen.value = false;
  }

  if (error) {
    // somthing went wrong!
    console.log(error);

    toast.add({
      title: "Error Deleting Event!",
      description: "Please try again, or contact support.",
    });
  }
};
</script>

<template>
  <!-- Mobile Calendar -->
  <div class="flex-1 px-4 pt-4 lg:hidden lg:pt-0 w-full">
    <div class="flex items-center">
      <h2 class="flex-auto text-sm font-semibold text-gray-900">
        {{
          dt.toLocaleString({
            month: "long",
            year: "numeric",
          })
        }}
      </h2>
      <button
        @click="() => goToPreviousMonth()"
        type="button"
        class="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
      >
        <span class="sr-only">Previous month</span>
        <icon
          name="heroicons:chevron-left-solid"
          class="h-5 w-5"
          aria-hidden="true"
        />
      </button>
      <button
        @click="() => goToNextMonth()"
        type="button"
        class="-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
      >
        <span class="sr-only">Next month</span>
        <icon
          name="heroicons:chevron-right-solid"
          class="h-5 w-5"
          aria-hidden="true"
        />
      </button>
      <button
        @click="createModalOpen = true"
        type="button"
        class="-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
      >
        <span class="sr-only">Create event</span>
        <icon name="heroicons:plus-solid" class="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
    <div
      class="mt-10 grid grid-cols-7 text-center text-xs leading-6 text-gray-500"
    >
      <div v-for="(item, index) in 7" :key="item">
        {{ Info.weekdays()[index].substring(0, 1) }}
      </div>
    </div>
    <div class="mt-2 grid grid-cols-7 text-sm">
      <div
        v-for="(day, dayIdx) in days"
        :key="day"
        :class="[dayIdx > 6 && 'border-t border-gray-200', 'py-2']"
      >
        <button
          @click="selectedDate = day.toISODate()"
          type="button"
          :class="[
            day.toISODate() === selectedDate && 'text-white',
            day.toISODate() !== selectedDate &&
              day.toISODate() === trueDateTime.toISODate() &&
              'text-indigo-600',
            !day.isSelected &&
              day.toISODate() !== trueDateTime.toISODate() &&
              day.month === trueDateTime.month &&
              'text-gray-900',
            day.toISODate() !== selectedDate &&
              day.toISODate() !== trueDateTime.toISODate() &&
              day.month !== dt.month &&
              'text-gray-400',
            day.toISODate() === selectedDate &&
              day.toISODate() === trueDateTime.toISODate() &&
              'bg-indigo-600',
            day.toISODate() === selectedDate &&
              day.toISODate() !== trueDateTime.toISODate() &&
              'bg-gray-900',
            day.toISODate() !== selectedDate && 'hover:bg-gray-200',
            day === selectedDate && 'font-semibold',
            'mx-auto flex h-8 w-8 items-center justify-center rounded-full',
          ]"
        >
          <time :datetime="day.date">{{ day.day }}</time>
        </button>
      </div>
    </div>
    <section class="pt-12">
      <h2 class="text-base font-semibold leading-6 text-gray-900">
        Schedule for
        <time :datetime="selectedDate"
          >{{
            DateTime.fromISO(selectedDate).toLocaleString(
              {
                day: "numeric",
                month: "long",
                year: "numeric",
              },
              { locale: "en-GB" }
            )
          }}
        </time>
      </h2>
      <ol
        v-if="days.find((day) => day.toISODate() === selectedDate)"
        class="mt-4 space-y-1 text-sm leading-6 text-gray-500"
      >
        <li
          v-for="(event, index) in days.find(
            (day) => day.toISODate() === selectedDate
          ).events"
          :key="event.id"
          class="group flex items-center space-x-4 rounded-xl px-4 py-2"
        >
          <div class="flex-auto">
            <p class="text-gray-900">{{ event.title }}</p>
            <div class="flex -space-x-1 overflow-hidden">
              <div
                v-for="horse in event.horses"
                :key="horse.id"
                class="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full text-white ring-2 ring-white"
                :class="horse.avatar_background"
              >
                <SupabaseImage
                  v-if="horse.avatar_url"
                  id="horse-avatars"
                  :path="horse.avatar_url"
                />
                <span v-else>
                  {{ horse.name.substring(0, 1) }}
                </span>
              </div>
            </div>
            <p class="mt-0.5">
              <span v-if="!event.all_day">
                {{
                  DateTime.fromISO(String(event.date_time)).toFormat("h:mma")
                }}
              </span>
              <span v-else> All Day </span> -
              {{ eventTypes[event.type - 1].type }}
            </p>
          </div>
          <UDropdown
            :items="[
              [
                {
                  label: 'Edit',
                  icon: 'i-heroicons-pencil-20-solid',
                  click: () => openEditModal(event),
                },
                {
                  label: 'Delete',
                  icon: 'i-heroicons-trash-20-solid',
                  click: () => openDeleteModal(event),
                },
              ],
            ]"
            :popper="{ placement: 'bottom-start' }"
          >
            <UButton
              color="white"
              trailing-icon="i-heroicons-ellipsis-vertical-20-solid"
            />
          </UDropdown>
        </li>
      </ol>
    </section>
  </div>
  <!-- Desktop  -->
  <div class="hidden lg:flex flex-1 lg:flex-col w-full">
    <header
      class="flex h-16 items-center justify-between border-b border-gray-200 p-4 lg:flex-none"
    >
      <h1 class="text-lg font-semibold text-gray-900">
        <time :datetime="dt.toISODate()"
          >{{
            dt.toLocaleString({
              month: "long",
              year: "numeric",
            })
          }}
        </time>
      </h1>
      <div class="flex items-center">
        <div class="flex items-center rounded-md shadow-sm md:items-stretch">
          <button
            @click="() => goToPreviousMonth()"
            type="button"
            class="flex items-center justify-center rounded-l-md border border-r-0 border-gray-300 bg-white py-2 pl-3 pr-4 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:px-2 md:hover:bg-gray-50"
          >
            <span class="sr-only">Previous month</span>
            <icon
              name="heroicons:chevron-left-solid"
              class="h-5 w-5"
              aria-hidden="true"
            />
          </button>
          <button
            @click="() => goToCurrentMonth()"
            type="button"
            class="hidden border-b border-t border-gray-300 bg-white px-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:relative md:block"
          >
            Today
          </button>
          <span class="relative -mx-px h-5 w-px bg-gray-300 md:hidden" />
          <button
            @click="() => goToNextMonth()"
            type="button"
            class="flex items-center justify-center rounded-r-md border border-l-0 border-gray-300 bg-white py-2 pl-4 pr-3 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:px-2 md:hover:bg-gray-50"
          >
            <span class="sr-only">Next month</span>
            <icon
              name="heroicons:chevron-right-solid"
              class="h-5 w-5"
              aria-hidden="true"
            />
          </button>
        </div>
        <div class="hidden md:flex md:items-center">
          <button
            @click="createEvent"
            type="button"
            class="create-event ml-6 rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Add event
          </button>
        </div>
      </div>
    </header>
    <div class="flex-1 lg:flex lg:flex-auto lg:flex-col">
      <!-- Weekday Lables -->
      <div
        class="grid grid-cols-7 gap-px border-b border-gray-300 bg-gray-200 text-center text-xs font-semibold leading-6 text-gray-700 lg:flex-none"
      >
        <div v-for="(item, index) in 7" :key="item" class="bg-white py-2">
          {{ Info.weekdays()[index].substring(0, 3) }}
        </div>
      </div>

      <!-- Days -->
      <div
        class="flex bg-gray-200 text-xs leading-6 text-gray-700 lg:flex-auto"
      >
        <div
          class="hidden w-full lg:grid lg:grid-cols-7 lg:grid-rows-6 lg:gap-px"
        >
          <div
            @click="(e) => createEvent(e, day.ts)"
            v-for="day in days"
            :key="day"
            :class="[
              day.month == dt.month ? 'bg-white' : 'bg-gray-50 text-gray-500',
              'create-event relative cursor-pointer px-3 py-2 hover:opacity-75',
            ]"
          >
            <time
              :datetime="day.date"
              :class="
                day.day === trueDateTime.day &&
                day.month === trueDateTime.month &&
                day.year === trueDateTime.year
                  ? 'flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white'
                  : undefined
              "
              >{{ day.day }}
            </time>

            <ol v-if="day.events" class="mt-2">
              <li
                v-for="event in day.events.slice(0, 2)"
                :key="event.id"
                :class="event.all_day ? 'rounded bg-indigo-100 px-1' : ''"
              >
                <VDropdown placement="right">
                  <!-- This will be the popover target (for the events and position) -->
                  <button class="group flex w-full text-left">
                    <p
                      class="flex-auto truncate font-medium text-gray-900 group-hover:text-indigo-600"
                    >
                      {{ event.title }}
                    </p>

                    <time
                      :datetime="event.datetime"
                      class="ml-3 hidden flex-none text-gray-500 group-hover:text-indigo-600 xl:block"
                    >
                      <span v-if="!event.all_day">
                        {{
                          DateTime.fromISO(String(event.date_time)).toFormat(
                            "h:mma"
                          )
                        }}
                      </span>
                      <span v-else> All Day </span>
                    </time>
                  </button>
                  <!-- This will be the content of the popover -->
                  <template #popper>
                    <EventCard
                      :event="event"
                      @edit="() => openEditModal(event)"
                      @delete="() => openDeleteModal(event)"
                    />
                  </template>
                </VDropdown>
              </li>
              <li v-if="day.events.length > 2" class="text-gray-500">
                <VDropdown>
                  <!-- This will be the popover target (for the events and position) -->
                  <button class="w-full text-left">
                    <div>
                      +
                      {{ day.events.length - 2 }} more
                    </div>
                  </button>
                  <!-- This will be the content of the popover -->
                  <template #popper>
                    <div class="w-64 rounded-lg bg-white py-5 shadow">
                      <div>
                        <ol>
                          <li
                            v-for="event in day.events.slice(
                              2,
                              day.events.lenth
                            )"
                            :key="event.id"
                            :class="
                              event.all_day ? 'rounded bg-indigo-100 px-1' : ''
                            "
                            class="mb-1 px-5"
                          >
                            <VDropdown placement="right">
                              <!-- This will be the popover target (for the events and position) -->
                              <button class="group flex w-full text-left">
                                <p
                                  class="flex-auto truncate font-medium text-gray-900 group-hover:text-indigo-600"
                                >
                                  {{ event.title }}
                                </p>

                                <time
                                  :datetime="event.datetime"
                                  class="ml-3 hidden flex-none text-gray-500 group-hover:text-indigo-600 xl:block"
                                >
                                  <span v-if="!event.all_day">
                                    {{
                                      DateTime.fromISO(
                                        String(event.date_time)
                                      ).toFormat("h:mma")
                                    }}
                                  </span>
                                  <span v-else> All Day </span>
                                </time>
                              </button>
                              <!-- This will be the content of the popover -->
                              <template #popper>
                                <EventCard
                                  :event="event"
                                  @edit="() => openEditModal(event)"
                                  @delete="() => openDeleteModal(event)"
                                />
                              </template>
                            </VDropdown>
                          </li>
                        </ol>
                      </div>
                    </div>
                  </template>
                </VDropdown>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modivdals -->
  <!-- <CreateEventModal
    v-if="createModalOpen"
    :is-open="createModalOpen"
    @close="createModalOpen = false"
  /> -->

  <!-- Create Event Modal -->
  <Modal v-model="createModalOpen">
    <ModalHeaderLayout title="Create an Event" @close="createModalOpen = false">
      <FormsCreateEventForm @onSuccess="createModalOpen = false" />
    </ModalHeaderLayout>
  </Modal>

  <!-- Edit Event Modal -->
  <Modal v-model="editModalOpen">
    <ModalHeaderLayout title="Edit Event" @close="editModalOpen = false">
      <FormsEditEventForm
        :event="selectedEvent"
        @onSuccess="editModalOpen = false"
      />
    </ModalHeaderLayout>
  </Modal>

  <!-- Delete Event Confirmation Modal -->
  <Modal v-model="deleteModalOpen">
    <ModalHeaderLayout title="Delete Event" @close="deleteModalOpen = false">
      <FormsConfirmationForm
        icon="heroicons:exclamation-triangle"
        icon-color="text-red-600"
        body="Are you sure you want to delete this event? All of it's data will be
            permanently removed from your yard forever. This action cannot be
            undone."
        buttonText="Delete"
        @onConfirm="handleDelete()"
      />
    </ModalHeaderLayout>
  </Modal>
</template>
