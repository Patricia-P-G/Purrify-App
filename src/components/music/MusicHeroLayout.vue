<template>
    <!-- Reusable Hero Section for Music Pages -->
    <section class="mb-6 rounded-3xl border border-border bg-surface p-4 shadow-[0_14px_40px_rgba(75,75,85,0.12)] sm:mb-8 sm:rounded-[30px] sm:p-6"
     :aria-labelledby="headingId">

        <!-- Responsive Hero Container -->
        <div class="flex flex-col items-center gap-5 sm:gap-6 lg:flex-row lg:items-center lg:gap-8">
            <!-- Cover Image -->
            <div class="h-40 w-40 shrink-0 overflow-hidden rounded-[22px] bg-surface-light shadow-[0_8px_20px_rgba(75,75,85,0.16)] sm:h-48 sm:w-48 lg:h-56 lg:w-56 lg:rounded-[26px]">
                <!-- Allows parent pages to provide a custom cover -->
                <slot name="cover">
                    <!-- Cover Image -->
                    <img v-if="image" :src="image" :alt="`${title} cover`" width="224" height="224" decoding="async" fetchpriority="high"
                     class="h-full w-full object-cover"
                    />

                    <!-- Fallback Cover-->
                    <div v-else class="flex h-full w-full items-center justify-center bg-primary-light" aria-hidden="true">
                        <img src="@/assets/icons/music.svg" alt="" class="h-12 w-12" />
                    </div>
                </slot>
            </div>

            <!-- Hero Content -->
            <div class="w-full flex-1 text-center lg:text-left">
                <!-- Label -->
                <p class="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-primary sm:text-sm">
                    {{ label }}
                </p>

                <!-- Title -->
                <h1 :id="headingId" class="mb-2 text-3xl font-semibold text-primary-text sm:mb-3 sm:text-4xl">
                    {{ title }}
                </h1>

                <!-- Description -->
                <p class="mx-auto mb-4 max-w-xl text-sm leading-6 text-text-secondary sm:mb-5 sm:text-base sm:leading-7 lg:mx-0">
                    {{ description }}
                </p>

                <!-- Number of Songs -->
                <p v-if="songCount !== undefined" class="mb-4 text-sm text-text-secondary sm:mb-5">
                {{ songCount }} {{ songCount === 1 ? singularLabel : pluralLabel }}
                </p>

                <!-- Custom Actions provided by the parent - such as Play All and Search -->
                <div class="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4 lg:justify-start">
                    <slot name="actions"></slot>
                </div>

            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
// Data Received from the Parent Page
withDefaults(defineProps<{
  headingId: string;
  label: string;
  title: string;
  description: string;
  image?: string;
  songCount?: number;
  singularLabel?: string;
  pluralLabel?: string;
}>(), {
  singularLabel: "song",
  pluralLabel: "songs",
});

</script>