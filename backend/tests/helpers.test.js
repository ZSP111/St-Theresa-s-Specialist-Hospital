import { test } from 'node:test'
import assert from 'node:assert/strict'
import { slotToDate, isValidSlot, formatSlotDate } from '../utils/helpers.js'

test('slotToDate parses AM/PM times', () => {
    assert.deepEqual(slotToDate('9_11_2026', '10:30 AM'), new Date(2026, 10, 9, 10, 30))
    assert.deepEqual(slotToDate('9_11_2026', '08:00 PM'), new Date(2026, 10, 9, 20, 0))
    assert.deepEqual(slotToDate('1_1_2027', '12:30 PM'), new Date(2027, 0, 1, 12, 30))
    assert.deepEqual(slotToDate('1_1_2027', '12:00 AM'), new Date(2027, 0, 1, 0, 0))
})

test('isValidSlot rejects malformed input', () => {
    assert.equal(isValidSlot('9_11_2026', '10:30 AM'), true)
    assert.equal(isValidSlot('2026-11-09', '10:30 AM'), false)
    assert.equal(isValidSlot('9_11_2026', '10:30'), false)
})

test('formatSlotDate', () => {
    assert.equal(formatSlotDate('9_11_2026'), '9 Nov 2026')
})
