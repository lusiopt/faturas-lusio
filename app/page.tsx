'use client'

import { useState } from 'react'
import { parseStripeCSV, parseLusioCSV, reconcilePayments, exportToExcel } from '@/lib/reconciliation'

type ReconciliationResult = {
  matched: Array<{
    date: string
    amount: number
    fee: number
    clientName: string
    email: string
    nif: string
    address: string
  }>
  unmatched: Array<{
    date: string
    amount: number
    email: string
    paymentIntentId: string
  }>
}

export default function Home() {
  const [stripeFile, setStripeFile] = useState<File | null>(null)
  const [lusioFile, setLusioFile] = useState<File | null>(null)
  const [result, setResult] = useState<ReconciliationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStripeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setStripeFile(e.target.files[0])
      setError(null)
    }
  }

  const handleLusioFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLusioFile(e.target.files[0])
      setError(null)
    }
  }

  const handleReconcile = async () => {
    if (!stripeFile || !lusioFile) {
      setError('Por favor, selecione ambos os arquivos')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const stripeText = await stripeFile.text()
      const lusioText = await lusioFile.text()

      const stripeData = parseStripeCSV(stripeText)
      const lusioData = parseLusioCSV(lusioText)

      const reconciled = reconcilePayments(stripeData, lusioData)
      setResult(reconciled)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar arquivos')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    if (!result) return
    exportToExcel(result.matched)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            💰 Faturas Lusio
          </h1>
          <p className="text-gray-600">
            Sistema de reconciliação de pagamentos Stripe com clientes Lusio
          </p>
        </header>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📤 Upload de Arquivos</h2>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CSV Stripe (pagamentos)
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleStripeFile}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {stripeFile && (
                <p className="text-xs text-green-600 mt-1">✓ {stripeFile.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CSV Lusio (clientes)
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleLusioFile}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {lusioFile && (
                <p className="text-xs text-green-600 mt-1">✓ {lusioFile.name}</p>
              )}
            </div>
          </div>

          <button
            onClick={handleReconcile}
            disabled={!stripeFile || !lusioFile || loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md
              hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed
              font-medium transition-colors"
          >
            {loading ? '🔄 Processando...' : '🔄 Reconciliar Pagamentos'}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">⚠️ {error}</p>
            </div>
          )}
        </div>

        {/* Results Section */}
        {result && (
          <>
            {/* Statistics */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600">Total Processados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {result.matched.length + result.unmatched.length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600">✅ Correspondidos</p>
                <p className="text-2xl font-bold text-green-600">
                  {result.matched.length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600">⚠️ Não Encontrados</p>
                <p className="text-2xl font-bold text-orange-600">
                  {result.unmatched.length}
                </p>
              </div>
            </div>

            {/* Matched Payments */}
            {result.matched.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">✅ Pagamentos Correspondidos</h2>
                  <button
                    onClick={handleExport}
                    className="bg-green-600 text-white py-2 px-4 rounded-md
                      hover:bg-green-700 font-medium transition-colors"
                  >
                    📥 Exportar Excel
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taxa</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIF</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Morada</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {result.matched.map((payment, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{payment.date}</td>
                          <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">€{payment.amount.toFixed(2)}</td>
                          <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">€{payment.fee.toFixed(2)}</td>
                          <td className="px-3 py-3 text-sm text-gray-900">{payment.clientName}</td>
                          <td className="px-3 py-3 text-sm text-gray-900">{payment.email}</td>
                          <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{payment.nif}</td>
                          <td className="px-3 py-3 text-sm text-gray-900">{payment.address}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Unmatched Payments */}
            {result.unmatched.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">⚠️ Pagamentos Sem Correspondência</h2>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment ID</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {result.unmatched.map((payment, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{payment.date}</td>
                          <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">€{payment.amount.toFixed(2)}</td>
                          <td className="px-3 py-3 text-sm text-gray-900">{payment.email}</td>
                          <td className="px-3 py-3 text-sm text-gray-600 font-mono text-xs">{payment.paymentIntentId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
