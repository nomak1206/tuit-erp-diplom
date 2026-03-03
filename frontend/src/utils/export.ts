/**
 * Export utilities — CSV and Excel (XLSX) export for all tables.
 */

interface ExportColumn {
    key: string
    title: string
}

/** Export to CSV (basic fallback) */
export function exportToCSV(data: any[], filename: string, columns: ExportColumn[]): void {
    const header = columns.map(c => c.title).join(',')
    const rows = data.map(row =>
        columns.map(c => {
            const val = row[c.key]
            if (val === null || val === undefined) return ''
            const str = String(val).replace(/"/g, '""')
            return `"${str}"`
        }).join(',')
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    downloadBlob(blob, `${filename}.csv`)
}

/** Export to Excel (XLSX) using a simple XML-based approach (no dependencies) */
export function exportToExcel(data: any[], filename: string, columns: ExportColumn[], sheetName = 'Sheet1'): void {
    const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

    let rows = ''
    // Header row
    rows += '<Row>'
    columns.forEach(c => {
        rows += `<Cell><Data ss:Type="String">${escapeXml(c.title)}</Data></Cell>`
    })
    rows += '</Row>\n'

    // Data rows
    data.forEach(item => {
        rows += '<Row>'
        columns.forEach(c => {
            const val = item[c.key]
            if (val === null || val === undefined) {
                rows += '<Cell><Data ss:Type="String"></Data></Cell>'
            } else if (typeof val === 'number') {
                rows += `<Cell><Data ss:Type="Number">${val}</Data></Cell>`
            } else {
                rows += `<Cell><Data ss:Type="String">${escapeXml(String(val))}</Data></Cell>`
            }
        })
        rows += '</Row>\n'
    })

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles>
 <Style ss:ID="header">
  <Font ss:Bold="1" ss:Size="11"/>
  <Interior ss:Color="#4472C4" ss:Pattern="Solid"/>
  <Font ss:Color="#FFFFFF" ss:Bold="1"/>
 </Style>
</Styles>
<Worksheet ss:Name="${escapeXml(sheetName)}">
<Table>
${rows}
</Table>
</Worksheet>
</Workbook>`

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' })
    downloadBlob(blob, `${filename}.xls`)
}

/** Generate a printable / PDF-ready HTML and open print dialog */
export function exportToPrint(title: string, html: string): void {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
<title>${title}</title>
<style>
  body { font-family: 'Times New Roman', serif; margin: 20mm; font-size: 12pt; color: #000; }
  h1 { font-size: 16pt; text-align: center; margin-bottom: 8px; }
  h2 { font-size: 13pt; margin: 16px 0 8px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  th, td { border: 1px solid #333; padding: 6px 8px; text-align: left; font-size: 11pt; }
  th { background: #e8e8e8; font-weight: bold; }
  .right { text-align: right; }
  .stamp { margin-top: 40px; display: flex; justify-content: space-between; }
  .stamp div { width: 45%; border-top: 1px solid #000; padding-top: 4px; text-align: center; font-size: 10pt; }
  @media print { body { margin: 15mm; } }
</style>
</head><body>${html}
<script>window.onload=function(){window.print()}<\/script>
</body></html>`)
    win.document.close()
}

function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}
