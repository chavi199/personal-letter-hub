import { fontStack, sizeStyle, type LetterDesignConfig } from "./design-themes"

const PAGE_WIDTH = 794
const PAGE_HEIGHT = 1123

function paperOf(design?: LetterDesignConfig): string {
  return design?.backgroundColor || "#ffffff"
}

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.trim().replace("#", "")
  const full = value.length === 3 ? value.split("").map((c) => c + c).join("") : value
  const parsed = Number.parseInt(full.slice(0, 6), 16)
  if (!Number.isFinite(parsed) || full.length < 6) return [255, 255, 255]
  return [(parsed >> 16) & 255, (parsed >> 8) & 255, parsed & 255]
}

async function logoDataUrl(url?: string): Promise<string | null> {
  if (!url) return null
  if (url.startsWith("data:")) return url
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const blob = await response.blob()
    return await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

function buildPage(personName: string, content: string, design: LetterDesignConfig | undefined, logo: string | null) {
  const size = sizeStyle(design?.fontSize)
  const paper = paperOf(design)
  const page = document.createElement("div")
  page.dir = "rtl"
  page.style.cssText = [
    "position:fixed",
    "left:0",
    "top:0",
    "z-index:-1",
    `width:${PAGE_WIDTH}px`,
    `min-height:${PAGE_HEIGHT}px`,
    "box-sizing:border-box",
    "padding:68px 76px",
    `background:${paper}`,
    `color:${design?.textColor || "#000000"}`,
    `font-family:${design ? fontStack(design.fontFamily) : "Arial, sans-serif"}`,
    "pointer-events:none",
  ].join(";")

  if (logo) {
    const image = document.createElement("img")
    image.src = logo
    image.alt = ""
    image.style.cssText = "display:block;max-height:60px;max-width:200px;object-fit:contain;margin-bottom:12px"
    page.appendChild(image)
  }

  const title = document.createElement("h2")
  title.textContent = personName
  title.style.cssText = [
    "margin:0 0 20px",
    "font-size:18px",
    "font-weight:700",
    `color:${design?.titleColor || "#000000"}`,
    `border-bottom:1px solid ${design?.accentColor || design?.borderColor || "#999999"}`,
    "padding-bottom:6px",
  ].join(";")
  page.appendChild(title)

  const body = document.createElement("div")
  body.textContent = content
  body.style.cssText = [
    "white-space:pre-wrap",
    `font-size:${size.fontSize}`,
    `line-height:${size.lineHeight}`,
    `text-align:${design?.align ?? "right"}`,
  ].join(";")
  page.appendChild(body)
  return page
}

export async function renderLetterPdf(
  personName: string,
  content: string,
  design?: LetterDesignConfig,
): Promise<Blob> {
  const { toCanvas } = await import("html-to-image")
  const { jsPDF } = await import("jspdf")
  await document.fonts.ready
  const logo = await logoDataUrl(design?.logoUrl)
  const page = buildPage(personName, content, design, logo)
  document.body.appendChild(page)

  try {
    if (logo) {
      const image = page.querySelector("img")
      if (image && !image.complete) {
        await new Promise<void>((resolve) => {
          image.onload = () => resolve()
          image.onerror = () => resolve()
        })
      }
    }

    const pageHeight = Math.max(page.scrollHeight, PAGE_HEIGHT)
    page.style.height = `${pageHeight}px`

    const canvas = await toCanvas(page, {
      pixelRatio: 2,
      backgroundColor: paperOf(design),
      width: PAGE_WIDTH,
      height: pageHeight,
      cacheBust: true,
    })

    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" })
    const [red, green, blue] = hexToRgb(paperOf(design))
    const sliceHeight = Math.floor(canvas.width * (PAGE_HEIGHT / PAGE_WIDTH))
    let offset = 0
    let pageIndex = 0

    while (offset < canvas.height) {
      const height = Math.min(sliceHeight, canvas.height - offset)
      const slice = document.createElement("canvas")
      slice.width = canvas.width
      slice.height = height
      const context = slice.getContext("2d")
      if (!context) throw new Error("לא ניתן להכין את קובץ ה-PDF")
      context.fillStyle = paperOf(design)
      context.fillRect(0, 0, slice.width, slice.height)
      context.drawImage(canvas, 0, offset, canvas.width, height, 0, 0, canvas.width, height)

      if (pageIndex > 0) pdf.addPage()
      pdf.setFillColor(red, green, blue)
      pdf.rect(0, 0, 210, 297, "F")
      pdf.addImage(slice.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, 210, (height / sliceHeight) * 297)

      offset += sliceHeight
      pageIndex += 1
      if (pageIndex > 20) break
    }

    return pdf.output("blob")
  } finally {
    page.remove()
  }
}

export async function renderLetterPdfBase64(
  personName: string,
  content: string,
  design?: LetterDesignConfig,
): Promise<string> {
  const blob = await renderLetterPdf(personName, content, design)
  const bytes = new Uint8Array(await blob.arrayBuffer())
  let binary = ""
  const step = 0x8000
  for (let index = 0; index < bytes.length; index += step) {
    binary += String.fromCharCode(...bytes.subarray(index, index + step))
  }
  return btoa(binary)
}
