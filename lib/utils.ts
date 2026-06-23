import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateDdMm(dateValue: string) {
  const [year, month, day] = dateValue.split('-')
  if (!year || !month || !day) {
    return dateValue
  }

  return `${day}/${month}`
}

export function slugify(value: string) {
  if (!value) return ''
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  return normalized.replace(/[^a-z0-9]/g, '')
}

export function buildInlinePdfPreviewSrc(pdfUrl: string) {
  const suffix = 'toolbar=0&navpanes=0&scrollbar=0'
  return pdfUrl.includes('#') ? `${pdfUrl}&${suffix}` : `${pdfUrl}#${suffix}`
}

export function buildGoogleViewerUrl(pdfUrl: string) {
  return `https://drive.google.com/viewerng/viewer?url=${encodeURIComponent(pdfUrl)}`
}

export function buildGoogleEmbeddedViewerUrl(pdfUrl: string) {
  return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(pdfUrl)}`
}
