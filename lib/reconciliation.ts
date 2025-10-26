import Papa from 'papaparse'
import * as XLSX from 'xlsx'

// Types
export type StripePayment = {
  paymentIntentId: string
  createdDate: string
  amount: number
  fee: number
  customerEmail: string
}

export type LusioClient = {
  servicePaymentReferenceId: string
  personFirstName: string
  personLastName: string
  personEmail: string
  personNif: string
  addressStreet: string
  addressPostalCode: string
  addressLocality: string
}

export type MatchedPayment = {
  date: string
  amount: number
  fee: number
  clientName: string
  email: string
  nif: string
  address: string
}

export type UnmatchedPayment = {
  date: string
  amount: number
  email: string
  paymentIntentId: string
}

// Parse Stripe CSV (comma-delimited)
export function parseStripeCSV(csvText: string): StripePayment[] {
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  })

  return parsed.data.map((row: any) => {
    // Extract date only (remove time)
    const dateStr = row['Created date (UTC)'] || ''
    const date = dateStr.split(' ')[0] // Get only YYYY-MM-DD part

    // Parse amount (format: "399,00" -> 399.00)
    const amountStr = (row['Amount'] || '0').replace(/"/g, '').replace(',', '.')
    const amount = parseFloat(amountStr) || 0

    // Parse fee (format: "20,31" -> 20.31)
    const feeStr = (row['Fee'] || '0').replace(/"/g, '').replace(',', '.')
    const fee = parseFloat(feeStr) || 0

    return {
      paymentIntentId: row['PaymentIntent ID'] || '',
      createdDate: date,
      amount,
      fee,
      customerEmail: row['Customer Email'] || '',
    }
  }).filter(payment => payment.paymentIntentId) // Remove empty rows
}

// Parse Lusio CSV (semicolon-delimited)
export function parseLusioCSV(csvText: string): LusioClient[] {
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    delimiter: ';',
  })

  return parsed.data.map((row: any) => ({
    servicePaymentReferenceId: row['service_payment_reference_id'] || '',
    personFirstName: row['person_first_name'] || '',
    personLastName: row['person_last_name'] || '',
    personEmail: row['person_email'] || '',
    personNif: row['person_nif'] || '',
    addressStreet: row['address_street'] || '',
    addressPostalCode: row['address_postal_code'] || '',
    addressLocality: row['address_locality'] || '',
  })).filter(client => client.personEmail || client.servicePaymentReferenceId) // Keep rows with email or payment ID
}

// Reconcile payments with fallback by email
export function reconcilePayments(
  stripePayments: StripePayment[],
  lusioClients: LusioClient[]
): {
  matched: MatchedPayment[]
  unmatched: UnmatchedPayment[]
} {
  const matched: MatchedPayment[] = []
  const unmatched: UnmatchedPayment[] = []

  // Create two lookup maps for Lusio clients
  // 1. By Payment Intent ID (primary)
  const lusioByPaymentId = new Map<string, LusioClient>()
  // 2. By Email (fallback)
  const lusioByEmail = new Map<string, LusioClient>()

  lusioClients.forEach(client => {
    // Add to payment ID map (if exists)
    if (client.servicePaymentReferenceId) {
      lusioByPaymentId.set(client.servicePaymentReferenceId, client)
    }
    // Add to email map (normalized to lowercase)
    if (client.personEmail) {
      lusioByEmail.set(client.personEmail.toLowerCase().trim(), client)
    }
  })

  // Match each Stripe payment with Lusio client
  stripePayments.forEach(payment => {
    let client: LusioClient | undefined

    // STEP 1: Try to match by Payment Intent ID (primary)
    client = lusioByPaymentId.get(payment.paymentIntentId)

    // STEP 2: If not found, try to match by email (fallback)
    if (!client && payment.customerEmail) {
      const normalizedEmail = payment.customerEmail.toLowerCase().trim()
      client = lusioByEmail.get(normalizedEmail)
    }

    if (client) {
      // Match found (either by Payment ID or Email)
      matched.push({
        date: payment.createdDate,
        amount: payment.amount,
        fee: payment.fee,
        clientName: `${client.personFirstName} ${client.personLastName}`.trim(),
        email: client.personEmail,
        nif: client.personNif,
        address: `${client.addressStreet} ${client.addressPostalCode} ${client.addressLocality}`.trim(),
      })
    } else {
      // No match found (neither by Payment ID nor Email)
      unmatched.push({
        date: payment.createdDate,
        amount: payment.amount,
        email: payment.customerEmail,
        paymentIntentId: payment.paymentIntentId,
      })
    }
  })

  return { matched, unmatched }
}

// Export matched payments to Excel
export function exportToExcel(matchedPayments: MatchedPayment[]) {
  // Group payments by month
  const paymentsByMonth = new Map<string, MatchedPayment[]>()

  matchedPayments.forEach(payment => {
    // Extract month in format "MMM-YY" (e.g., "Out-25")
    const [year, month] = payment.date.split('-')
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const monthKey = `${monthNames[parseInt(month) - 1]}-${year.slice(2)}`

    if (!paymentsByMonth.has(monthKey)) {
      paymentsByMonth.set(monthKey, [])
    }
    paymentsByMonth.get(monthKey)!.push(payment)
  })

  // Create workbook
  const wb = XLSX.utils.book_new()

  // Add a sheet for each month
  paymentsByMonth.forEach((payments, monthKey) => {
    // Prepare data rows (headers on row 3, data starts on row 4)
    const rows = [
      [], // Row 1 - empty
      [], // Row 2 - empty
      ['Data', 'Valor', 'Taxa Stripe', 'Nome Cliente', 'Email', 'NIF', 'Morada'], // Row 3 - headers
      ...payments.map(p => [
        p.date,
        p.amount,
        p.fee,
        p.clientName,
        p.email,
        p.nif,
        p.address,
      ])
    ]

    const ws = XLSX.utils.aoa_to_sheet(rows)

    // Set column widths
    ws['!cols'] = [
      { wch: 12 }, // Data
      { wch: 10 }, // Valor
      { wch: 12 }, // Taxa Stripe
      { wch: 25 }, // Nome Cliente
      { wch: 30 }, // Email
      { wch: 12 }, // NIF
      { wch: 40 }, // Morada
    ]

    // Apply currency format (€) to Valor and Taxa Stripe columns
    // Start from row 4 (index 3) since rows 1-2 are empty and row 3 is header
    const dataStartRow = 4
    for (let i = 0; i < payments.length; i++) {
      const rowNum = dataStartRow + i

      // Format Valor column (B) - €#,##0.00
      const valorCell = `B${rowNum}`
      if (ws[valorCell]) {
        ws[valorCell].z = '€#,##0.00'
      }

      // Format Taxa Stripe column (C) - €#,##0.00
      const feeCell = `C${rowNum}`
      if (ws[feeCell]) {
        ws[feeCell].z = '€#,##0.00'
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, monthKey)
  })

  // Generate filename with current date
  const now = new Date()
  const dateStr = now.toISOString().split('T')[0]
  const filename = `faturas-lusio-${dateStr}.xlsx`

  // Download file
  XLSX.writeFile(wb, filename)
}
