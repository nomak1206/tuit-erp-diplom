/**
 * CSV export utility — used by all list pages for the Export button.
 */
export function exportToCSV(data: any[], filename: string, columns?: { key: string; title: string }[]) {
    if (!data.length) return

    const cols = columns || Object.keys(data[0]).map(key => ({ key, title: key }))
    const header = cols.map(c => c.title).join(',')
    const rows = data.map(row =>
        cols.map(c => {
            const val = row[c.key]
            if (val === null || val === undefined) return ''
            const str = String(val).replace(/"/g, '""')
            return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str
        }).join(',')
    )

    const csv = '\uFEFF' + [header, ...rows].join('\n') // BOM for Excel Cyrillic
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
}
