import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'

export function exportToExcel(data, filename = 'export', sheetName = 'Sheet1') {
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export function exportToPDF(title, headers, rows, filename = 'export') {
  const doc = new jsPDF({ orientation: 'landscape' })
  doc.setFontSize(16)
  doc.text(title, 14, 20)
  doc.setFontSize(10)

  let y = 35
  const colWidth = (doc.internal.pageSize.width - 28) / headers.length

  // Header row
  doc.setFillColor(79, 70, 229)
  doc.rect(14, y - 6, doc.internal.pageSize.width - 28, 10, 'F')
  doc.setTextColor(255, 255, 255)
  headers.forEach((h, i) => doc.text(String(h), 14 + i * colWidth, y))
  doc.setTextColor(0, 0, 0)
  y += 12

  rows.forEach((row, ri) => {
    if (y > 180) { doc.addPage(); y = 20 }
    if (ri % 2 === 0) {
      doc.setFillColor(248, 250, 252)
      doc.rect(14, y - 6, doc.internal.pageSize.width - 28, 10, 'F')
    }
    row.forEach((cell, i) => doc.text(String(cell ?? ''), 14 + i * colWidth, y))
    y += 12
  })

  doc.save(`${filename}.pdf`)
}
