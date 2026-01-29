import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

// Extend jsPDF types
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

interface InspectionData {
  inspection_id: string | null
  inspection_date: string | null
  inspection_status: string | null
  inspection_type: string | null
  inspection_remarks: string | null
  weld_number: string | null
  weld_position: string | null
  component_type: string | null
  pipe_number: string | null
  drawing_number: string | null
  project_name: string | null
  project_code: string | null
  operator_name: string | null
  photo_count: number | null
}

interface Photo {
  id: string
  storage_url: string | null
  photo_type: string | null
  photo_status: string | null
  remarks: string | null
  created_at: string
}

interface ReportOptions {
  title?: string
  includePhotos?: boolean
  filterBy?: {
    pipeNumber?: string
    drawingNumber?: string
    weldNumber?: string
    dateFrom?: string
    dateTo?: string
  }
}

export async function generateInspectionReport(
  inspections: InspectionData[],
  photos: Record<string, Photo[]>,
  options: ReportOptions = {}
): Promise<Blob> {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15

  // Header
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(options.title || 'MP Inspectie Rapport', margin, 25)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(
    `Gegenereerd: ${format(new Date(), "d MMMM yyyy 'om' HH:mm", { locale: nl })}`,
    margin,
    32
  )

  // Filter info
  if (options.filterBy) {
    let filterText = 'Filters: '
    const filters: string[] = []
    if (options.filterBy.pipeNumber) filters.push(`Leiding: ${options.filterBy.pipeNumber}`)
    if (options.filterBy.drawingNumber) filters.push(`Tekening: ${options.filterBy.drawingNumber}`)
    if (options.filterBy.weldNumber) filters.push(`Las: ${options.filterBy.weldNumber}`)
    if (options.filterBy.dateFrom) filters.push(`Vanaf: ${options.filterBy.dateFrom}`)
    if (options.filterBy.dateTo) filters.push(`Tot: ${options.filterBy.dateTo}`)

    if (filters.length > 0) {
      filterText += filters.join(' | ')
      doc.text(filterText, margin, 38)
    }
  }

  // Summary table
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Samenvatting', margin, 48)

  const statusCounts = {
    ok: inspections.filter((i) => i.inspection_status === 'ok').length,
    nok: inspections.filter((i) => i.inspection_status === 'nok').length,
    twijfel: inspections.filter((i) => i.inspection_status === 'twijfel').length,
    pending: inspections.filter((i) => i.inspection_status === 'pending').length,
    herstel: inspections.filter((i) => i.inspection_status === 'herstel').length,
  }

  doc.autoTable({
    startY: 52,
    head: [['Totaal', 'OK', 'NOK', 'Twijfel', 'In afwachting', 'Herstel']],
    body: [
      [
        inspections.length.toString(),
        statusCounts.ok.toString(),
        statusCounts.nok.toString(),
        statusCounts.twijfel.toString(),
        statusCounts.pending.toString(),
        statusCounts.herstel.toString(),
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: margin, right: margin },
  })

  // Inspections table
  let yPos = (doc as any).lastAutoTable.finalY + 15

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Inspectie Details', margin, yPos)

  doc.autoTable({
    startY: yPos + 4,
    head: [
      ['Leiding', 'Tekening', 'Las', 'Positie', 'Component', 'Status', 'Datum', 'Operator'],
    ],
    body: inspections.map((i) => [
      i.pipe_number || '-',
      i.drawing_number || '-',
      i.weld_number || '-',
      i.weld_position || '-',
      i.component_type || '-',
      getStatusLabel(i.inspection_status),
      i.inspection_date
        ? format(new Date(i.inspection_date), 'dd-MM-yyyy')
        : '-',
      i.operator_name || '-',
    ]),
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: margin, right: margin },
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 25 },
      2: { cellWidth: 20 },
      3: { cellWidth: 15 },
      4: { cellWidth: 20 },
      5: { cellWidth: 20 },
      6: { cellWidth: 22 },
      7: { cellWidth: 25 },
    },
  })

  // Add photos if requested
  if (options.includePhotos) {
    for (const inspection of inspections) {
      if (!inspection.inspection_id) continue
      const inspectionPhotos = photos[inspection.inspection_id] || []
      if (inspectionPhotos.length === 0) continue

      // New page for photos
      doc.addPage()
      yPos = 20

      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(
        `Foto's: ${inspection.pipe_number} / Las: ${inspection.weld_number}`,
        margin,
        yPos
      )

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      yPos += 8
      doc.text(`Tekening: ${inspection.drawing_number || '-'}`, margin, yPos)
      yPos += 5
      doc.text(`Status: ${getStatusLabel(inspection.inspection_status)}`, margin, yPos)
      yPos += 10

      // Photo grid (2 columns)
      const photoWidth = (pageWidth - margin * 3) / 2
      const photoHeight = 60
      let col = 0

      for (const photo of inspectionPhotos) {
        if (yPos + photoHeight + 20 > pageHeight - margin) {
          doc.addPage()
          yPos = 20
        }

        const xPos = margin + col * (photoWidth + margin)

        // Photo placeholder or actual image
        if (photo.storage_url) {
          try {
            // Note: In production, you'd need to load and convert the image
            // For now, draw a placeholder
            doc.setDrawColor(200)
            doc.setFillColor(240, 240, 240)
            doc.rect(xPos, yPos, photoWidth, photoHeight, 'FD')
            doc.setFontSize(8)
            doc.text('Foto', xPos + photoWidth / 2 - 8, yPos + photoHeight / 2)
          } catch (e) {
            // Fallback placeholder
            doc.setDrawColor(200)
            doc.rect(xPos, yPos, photoWidth, photoHeight)
          }
        }

        // Photo info
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.text(
          `${photo.photo_type || 'Foto'} - ${getStatusLabel(photo.photo_status)}`,
          xPos,
          yPos + photoHeight + 5
        )

        if (photo.remarks) {
          doc.setFont('helvetica', 'normal')
          const remarks =
            photo.remarks.length > 40
              ? photo.remarks.substring(0, 37) + '...'
              : photo.remarks
          doc.text(remarks, xPos, yPos + photoHeight + 10)
        }

        col++
        if (col >= 2) {
          col = 0
          yPos += photoHeight + 20
        }
      }
    }
  }

  // Footer on each page
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Pagina ${i} van ${pageCount}`,
      pageWidth / 2 - 15,
      pageHeight - 10
    )
    doc.text('MP Inspectie App', margin, pageHeight - 10)
  }

  return doc.output('blob')
}

function getStatusLabel(status: string | null): string {
  const labels: Record<string, string> = {
    ok: 'OK',
    nok: 'NOK',
    twijfel: 'Twijfel',
    pending: 'In afwachting',
    herstel: 'Herstel',
  }
  return labels[status || ''] || status || '-'
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
