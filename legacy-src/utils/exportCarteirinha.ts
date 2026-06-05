import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export async function exportCarteirinhaAsPDF(elementId: string, nomeArquivo: string) {
  const element = document.getElementById(elementId)
  if (!element) return

  const canvas = await html2canvas(element, { scale: 2, useCORS: true })
  const imgData = canvas.toDataURL('image/png')

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width / 2, canvas.height / 2] })
  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2)
  pdf.save(`${nomeArquivo}.pdf`)
}

export async function exportCarteirinhaAsImage(elementId: string, nomeArquivo: string) {
  const element = document.getElementById(elementId)
  if (!element) return

  const canvas = await html2canvas(element, { scale: 2, useCORS: true })
  const link = document.createElement('a')
  link.download = `${nomeArquivo}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}
