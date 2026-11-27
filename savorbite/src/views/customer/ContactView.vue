<script setup>
import { reactive, ref } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import Button from '@/components/ui/Button.vue'
import Icon from '@/components/ui/Icon.vue'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()

const form = reactive({ name: '', email: '', topic: 'Order question', message: '' })
const errors = reactive({ name: '', email: '', message: '' })
const sending = ref(false)
const sent = ref(false)

const topics = ['Order question', 'Catering & events', 'Feedback', 'Something else']

function validate() {
  errors.name = form.name.trim().length >= 2 ? '' : 'Enter your name so we know how to address you.'
  errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ? '' : 'Enter a valid email so we can reply.'
  errors.message = form.message.trim().length >= 10 ? '' : 'Add at least 10 characters so we can help properly.'
  return !errors.name && !errors.email && !errors.message
}

function submit() {
  if (!validate()) return
  sending.value = true
  // PLACEHOLDER: POST /api/messages on the Express API.
  setTimeout(() => {
    sending.value = false
    sent.value = true
    toast.success('Message sent. We reply within one working day.')
  }, 700)
}
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-10 md:px-6">
    <h1 class="text-h1 font-display font-bold text-charcoal">Contact us</h1>
    <p class="mt-1 max-w-xl text-body text-muted">
      Questions about an order, a big event, or a dish you wish we cooked? Send a message or reach the
      kitchen directly.
    </p>

    <div class="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
      <!-- Contact form -->
      <div class="rounded-lg border border-line bg-surface p-5 shadow-sm sm:p-6">
        <div v-if="sent" class="flex flex-col items-center py-10 text-center" role="status">
          <span class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
            <Icon name="check" :size="30" />
          </span>
          <h2 class="text-h2 font-display font-semibold text-charcoal">Message received</h2>
          <p class="mt-2 max-w-sm text-body text-muted">
            Thanks {{ form.name.split(' ')[0] }} — we reply within one working day, usually much sooner.
          </p>
          <Button variant="secondary" class="mt-6" @click=";sent = false; form.message = ''">Send another message</Button>
        </div>

        <form v-else class="flex flex-col gap-4" novalidate @submit.prevent="submit">
          <div class="grid gap-4 sm:grid-cols-2">
            <AppInput id="c-name" label="Your name" name="name" v-model="form.name" :error="errors.name" required placeholder="Chidi Nwosu" />
            <AppInput id="c-email" label="Email" type="email" name="email" v-model="form.email" :error="errors.email" required placeholder="you@example.com" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="c-topic" class="text-body-sm font-medium text-charcoal">What’s it about?</label>
            <select
              id="c-topic"
              v-model="form.topic"
              class="h-11 w-full rounded-lg border border-line bg-surface px-3.5 text-body text-charcoal focus:border-paprika focus:outline-none focus:ring-2 focus:ring-paprika/25"
            >
              <option v-for="t in topics" :key="t">{{ t }}</option>
            </select>
          </div>
          <AppTextarea
            id="c-message"
            label="Message"
            name="message"
            :rows="5"
            v-model="form.message"
            :error="errors.message"
            required
            placeholder="Tell us how we can help…"
          />
          <Button type="submit" size="lg" :loading="sending">{{ sending ? 'Sending…' : 'Send message' }}</Button>
        </form>
      </div>

      <!-- Direct contact -->
      <aside class="flex flex-col gap-4">
        <div class="rounded-lg border border-line bg-surface p-5 shadow-sm">
          <h2 class="text-h2 font-display font-semibold text-charcoal">Reach the kitchen</h2>
          <ul class="mt-4 flex flex-col gap-3 text-body-sm">
            <li>
              <a href="tel:+2348012345678" class="flex items-center gap-2.5 rounded-lg p-2 -mx-2 text-charcoal transition-colors hover:bg-sand">
                <span class="flex h-9 w-9 items-center justify-center rounded-full bg-paprika/10 text-paprika"><Icon name="phone" :size="17" /></span>
                <span><span class="font-medium">Call us</span><br /><span class="text-muted tabular-nums">+234 801 234 5678</span></span>
              </a>
            </li>
            <li>
              <a href="https://wa.me/2348012345678" target="_blank" rel="noopener" class="flex items-center gap-2.5 rounded-lg p-2 -mx-2 text-charcoal transition-colors hover:bg-sand">
                <span class="flex h-9 w-9 items-center justify-center rounded-full bg-success/10 text-success"><Icon name="whatsapp" :size="17" /></span>
                <span><span class="font-medium">WhatsApp</span><br /><span class="text-muted">Chat with a human, 9am–9pm</span></span>
              </a>
            </li>
            <li>
              <a href="mailto:hello@savorbite.ng" class="flex items-center gap-2.5 rounded-lg p-2 -mx-2 text-charcoal transition-colors hover:bg-sand">
                <span class="flex h-9 w-9 items-center justify-center rounded-full bg-paprika/10 text-paprika"><Icon name="mail" :size="17" /></span>
                <span><span class="font-medium">Email</span><br /><span class="text-muted">hello@savorbite.ng</span></span>
              </a>
            </li>
            <li class="flex items-center gap-2.5 rounded-lg p-2 -mx-2 text-charcoal">
              <span class="flex h-9 w-9 items-center justify-center rounded-full bg-sand text-charcoal"><Icon name="location" :size="17" /></span>
              <span><span class="font-medium">Kitchen & pickup</span><br /><span class="text-muted">24 Toyin Street, Ikeja, Lagos</span></span>
            </li>
          </ul>
        </div>

        <div class="rounded-lg border border-line bg-surface p-5 shadow-sm">
          <h2 class="text-body font-semibold text-charcoal">Opening hours</h2>
          <ul class="mt-3 flex flex-col gap-2 text-body-sm text-muted">
            <li class="flex justify-between gap-4"><span>Monday – Friday</span><span class="tabular-nums text-charcoal">9:00 – 21:00</span></li>
            <li class="flex justify-between gap-4"><span>Saturday</span><span class="tabular-nums text-charcoal">10:00 – 22:00</span></li>
            <li class="flex justify-between gap-4"><span>Sunday</span><span class="tabular-nums text-charcoal">12:00 – 20:00</span></li>
          </ul>
        </div>

        <div
          class="flex h-44 items-center justify-center rounded-lg border border-line bg-sand text-body-sm text-muted"
          role="img"
          aria-label="Map showing SavorBite at 24 Toyin Street, Ikeja, Lagos"
        >
          <span class="flex flex-col items-center gap-2">
            <Icon name="location" :size="22" class="text-paprika" />
            Find us at 24 Toyin Street
          </span>
        </div>
      </aside>
    </div>
  </div>
</template>
