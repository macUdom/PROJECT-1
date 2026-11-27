import { Router } from 'express'
import { register, login, me } from '../controllers/auth.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { validate, rules } from '../middleware/validate.js'

const router = Router()

const emailRule = { field: 'email', test: rules.isEmail().test, message: 'Enter a valid email address.' }
const phoneRule = {
  field: 'phone',
  test: (v) => /^(\+?234|0)[789]\d{9}$/.test(String(v || '').replace(/\s/g, '')),
  message: 'Enter a valid Nigerian phone number, e.g. 0803 123 4567.',
}

router.post(
  '/register',
  validate([
    { field: 'name', test: rules.minLength(2).test, message: 'Enter your full name (at least 2 characters).' },
    emailRule,
    phoneRule,
    { field: 'password', test: rules.minLength(6).test, message: 'Use at least 6 characters for your password.' },
  ]),
  register
)

router.post(
  '/login',
  validate([
    emailRule,
    { field: 'password', test: (v) => !!v, message: 'Enter your password.' },
  ]),
  login
)

router.get('/me', requireAuth, me)

export default router
