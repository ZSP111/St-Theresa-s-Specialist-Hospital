const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// "9_11_2026" -> "9 Nov 2026"
export const slotDateFormat = (slotDate) => {
    const [day, month, year] = slotDate.split('_')
    return `${day} ${MONTHS[Number(month) - 1]} ${year}`
}

// Date -> "9_11_2026" (the format the backend stores)
export const toSlotDate = (date) => `${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}`

// Date -> "10:30 AM" (always en-US so it matches the backend)
export const toSlotTime = (date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

export const formatMoney = (amount) => Number(amount || 0).toLocaleString('en-NG')
