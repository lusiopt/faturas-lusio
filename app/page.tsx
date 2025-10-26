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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                💰 Faturas Lusio
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Sistema de reconciliação de pagamentos Stripe com clientes Lusio
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📤 Upload de Arquivos</h2>

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
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-600 file:text-white
                  hover:file:bg-blue-700
                  file:cursor-pointer"
              />
              {stripeFile && (
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <span>✓</span> {stripeFile.name}
                </p>
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
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-600 file:text-white
                  hover:file:bg-blue-700
                  file:cursor-pointer"
              />
              {lusioFile && (
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <span>✓</span> {lusioFile.name}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleReconcile}
            disabled={!stripeFile || !lusioFile || loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg
              hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed
              font-medium transition-colors text-base"
          >
            {loading ? '🔄 Processando...' : '🔄 Reconciliar Pagamentos'}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">⚠️ {error}</p>
            </div>
          )}
        </div>

        {/* Results Section */}
        {result && (
          <>
            {/* Statistics */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Processados</p>
                <p className="text-3xl font-bold text-gray-900">
                  {result.matched.length + result.unmatched.length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <p className="text-sm font-medium text-gray-600 mb-1">✅ Correspondidos</p>
                <p className="text-3xl font-bold text-green-600">
                  {result.matched.length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <p className="text-sm font-medium text-gray-600 mb-1">⚠️ Não Encontrados</p>
                <p className="text-3xl font-bold text-orange-600">
                  {result.unmatched.length}
                </p>
              </div>
            </div>

            {/* Matched Payments */}
            {result.matched.length > 0 && (
              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden mb-6">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">✅ Pagamentos Correspondidos</h2>
                  <button
                    onClick={handleExport}
                    className="bg-green-600 text-white py-2 px-4 rounded-lg
                      hover:bg-green-700 font-medium transition-colors flex items-center gap-2"
                  >
                    📥 Exportar Excel
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taxa</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIF</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Morada</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {result.matched.map((payment, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{payment.date}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">€{payment.amount.toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">€{payment.fee.toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{payment.clientName}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">{payment.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{payment.nif}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">{payment.address}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Unmatched Payments */}
            {result.unmatched.length > 0 && (
              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">⚠️ Pagamentos Sem Correspondência</h2>
                  <p className="text-sm text-gray-500 mt-1">Estes pagamentos não foram encontrados na base de clientes Lusio</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {result.unmatched.map((payment, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{payment.date}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">€{payment.amount.toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">{payment.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                              {payment.paymentIntentId}
                            </div>
                          </td>
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
    </div>
  )
}
