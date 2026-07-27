import Papa from 'papaparse'

export function exportToCSV<T extends object>(data: T[], filename: string) {
  const csv = Papa.unparse(data)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function exportToPDF(elementId: string, filename: string) {
  const { default: jsPDF } = await import('jspdf')
  const { default: html2canvas } = await import('html2canvas')

  const element = document.getElementById(elementId)
  if (!element) return

  const canvas = await html2canvas(element, { scale: 2, useCORS: true })
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
  pdf.save(`${filename}.pdf`)
}
