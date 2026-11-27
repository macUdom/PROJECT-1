<script setup>
import { RouterLink } from 'vue-router'
import Button from '@/components/ui/Button.vue'
import Icon from '@/components/ui/Icon.vue'

const stats = [
  { label: 'Plates cooked', value: '12,400+' },
  { label: 'Avg. delivery', value: '47 min' },
  { label: 'Customer rating', value: '4.8 / 5' },
  { label: 'Areas served', value: '9 in Lagos' },
]

const team = [
  {
    name: 'Adaeze Okafor',
    role: 'Founder & head chef',
    image: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=400&q=70',
  },
  {
    name: 'Tunde Bakare',
    role: 'Kitchen & sourcing',
    image: 'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?auto=format&fit=crop&w=400&q=70',
  },
  {
    name: 'Zainab Musa',
    role: 'Delivery & support',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=70',
  },
]
</script>

<template>
  <div>
    <!-- Story -->
    <section class="border-b border-line">
      <div class="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:px-6">
        <div>
          <h1 class="text-h0 font-display font-bold leading-tight text-charcoal">
            Cooked like home, delivered like it matters.
          </h1>
          <p class="mt-5 text-body text-muted">
            SavorBite started in 2021 from a single pot of party jollof and a phone line. Adaeze was cooking
            for friends’ events, and word travelled faster than the rider did. Today we’re a small kitchen on
            Toyin Street in Ikeja, still cooking the food we grew up eating — no shortcuts on the smoky base,
            no cardboard texture in the pounded yam.
          </p>
          <p class="mt-4 text-body text-muted">
            We cook to order every day, source produce from the Yaba and Mile 12 markets, and deliver hot to
            nine areas of Lagos. If your plate isn’t right, tell us within 24 hours and we’ll make it right.
          </p>
          <div class="mt-7 flex flex-wrap gap-3">
            <Button :to="{ name: 'shop' }" size="lg" icon="arrowRight">Order now</Button>
            <Button :to="{ name: 'contact' }" variant="secondary" size="lg">Talk to us</Button>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=500&q=70"
            alt="The SavorBite kitchen team plating food"
            loading="lazy"
            width="500"
            height="500"
            class="col-span-2 aspect-[16/10] w-full rounded-lg object-cover shadow-sm"
          />
          <img
            src="https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=300&q=70"
            alt="Fresh ingredients on a grill"
            loading="lazy"
            width="300"
            height="300"
            class="aspect-square w-full rounded-lg object-cover shadow-sm"
          />
          <img
            src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=70"
            alt="A finished plate of food wrapped for delivery"
            loading="lazy"
            width="300"
            height="300"
            class="aspect-square w-full rounded-lg object-cover shadow-sm"
          />
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="bg-sand/40" aria-label="SavorBite by the numbers">
      <dl class="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-10 md:grid-cols-4 md:px-6">
        <div v-for="s in stats" :key="s.label" class="rounded-lg border border-line bg-surface p-5 text-center">
          <dt class="order-2 text-body-sm text-muted">{{ s.label }}</dt>
          <dd class="text-h1 font-display font-bold tabular-nums text-paprika">{{ s.value }}</dd>
        </div>
      </dl>
    </section>

    <!-- Team -->
    <section class="mx-auto max-w-7xl px-4 py-14 md:px-6" aria-labelledby="team-heading">
      <h2 id="team-heading" class="text-h1 font-display font-bold text-charcoal">The small team</h2>
      <p class="mt-2 max-w-lg text-body text-muted">Three people at the pass, one rider on every order.</p>
      <div class="mt-8 grid gap-6 sm:grid-cols-3">
        <figure v-for="member in team" :key="member.name" class="rounded-lg border border-line bg-surface p-5 shadow-sm">
          <img
            :src="member.image"
            :alt="`${member.name}, ${member.role}`"
            loading="lazy"
            width="200"
            height="200"
            class="h-32 w-32 rounded-full object-cover"
          />
          <figcaption class="mt-4">
            <p class="text-body font-semibold text-charcoal">{{ member.name }}</p>
            <p class="text-body-sm text-muted">{{ member.role }}</p>
          </figcaption>
        </figure>
      </div>
    </section>

    <!-- Contact + hours -->
    <section class="border-t border-line bg-cream">
      <div class="mx-auto grid max-w-7xl gap-8 px-4 py-14 md:grid-cols-2 md:px-6">
        <div>
          <h2 class="text-h1 font-display font-bold text-charcoal">Visit the kitchen</h2>
          <p class="mt-3 text-body text-muted">
            Pickups are welcome within opening hours — order by 11am on Saturdays to skip the wait.
          </p>
          <RouterLink :to="{ name: 'contact' }" class="mt-5 inline-block">
            <Button variant="secondary">Contact & directions</Button>
          </RouterLink>
        </div>
        <div class="flex items-start gap-3 rounded-lg border border-line bg-surface p-6 shadow-sm">
          <Icon name="clock" :size="22" class="mt-0.5 shrink-0 text-paprika" />
          <div>
            <h3 class="text-body font-semibold text-charcoal">Opening hours</h3>
            <ul class="mt-2 space-y-1 text-body-sm text-muted">
              <li class="flex justify-between gap-6"><span>Monday – Friday</span><span class="tabular-nums">9:00 – 21:00</span></li>
              <li class="flex justify-between gap-6"><span>Saturday</span><span class="tabular-nums">10:00 – 22:00</span></li>
              <li class="flex justify-between gap-6"><span>Sunday</span><span class="tabular-nums">12:00 – 20:00</span></li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
