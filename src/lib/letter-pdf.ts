import { toCanvas } from "html-to-image"
import { jsPDF } from "jspdf"
import {
  fontStack,
  getDesignBorderStyle,
  normalizeDesign,
  paperBackground,
  sizeStyle,
  type LetterDesignConfig,
  type LetterOrnament,
} from "./design-themes"

const PAGE_WIDTH = 794
const PAGE_HEIGHT = 1123

const spots = [
  [4, 6, 34, 0.55, -14],
  [16, 3, 16, 0.35, 10],
  [30, 7, 12, 0.28, -6],
  [46, 3, 18, 0.32, 8],
  [62, 6, 14, 0.3, -10],
  [78, 3, 22, 0.4, 12],
  [92, 7, 30, 0.5, -8],
  [3, 22, 14, 0.28, 6],
  [96, 24, 16, 0.3, -12],
  [5, 42, 20, 0.22, 14],
  [94, 46, 18, 0.24, -8],
  [4, 64, 16, 0.26, -10],
  [96, 68, 22, 0.32, 8],
  [6, 86, 28, 0.45, 10],
  [20, 94, 14, 0.3, -6],
  [38, 96, 18, 0.28, 8],
  [56, 93, 12, 0.24, -12],
  [74, 96, 16, 0.3, 6],
  [90, 88, 32, 0.48, -14],
  [22, 18, 10, 0.16, 4],
  [70, 22, 11, 0.15, -8],
  [40, 78, 12, 0.14, 10],
  [58, 70, 10, 0.12, -4],
] as const

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

async function imageDataUrl(url?: string): Promise<string | null> {
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

function svgEl<K extends keyof SVGElementTagNameMap>(name: K): SVGElementTagNameMap[K] {
  return document.createElementNS("http://www.w3.org/2000/svg", name)
}

function ornamentSvg(type: LetterOrnament, color: string) {
  const svg = svgEl("svg")
  svg.setAttribute("viewBox", "0 0 24 24")
  if (type === "rainbow") {
    for (const [cx, cy, r, fill] of [
      ["8", "12", "3.2", "#f2a3b5"],
      ["14", "8", "2.4", "#f3d27a"],
      ["18", "14", "2.8", "#8eb7ee"],
    ]) {
      const circle = svgEl("circle")
      circle.setAttribute("cx", cx)
      circle.setAttribute("cy", cy)
      circle.setAttribute("r", r)
      circle.setAttribute("fill", fill)
      svg.appendChild(circle)
    }
    return svg
  }
  const path = svgEl("path")
  path.setAttribute("fill", color)
  path.setAttribute(
    "d",
    type === "hearts"
      ? "M12 20s-7-4.4-7-9.2C5 8 6.8 6.2 9 6.2c1.3 0 2.4.6 3 1.6.6-1 1.7-1.6 3-1.6 2.2 0 4 1.8 4 4.6C19 15.6 12 20 12 20z"
      : type === "leaves"
        ? "M5 19c8 1 13-4 14-13-8 1-13 6-14 13z"
        : "M12 2.6 14.4 9H21l-5.3 3.8 2 6.4L12 15.8 6.3 19.2l2-6.4L3 9h6.6L12 2.6z",
  )
  svg.appendChild(path)
  return svg
}

function appendDecor(page: HTMLElement, design: LetterDesignConfig) {
  const accent = design.accentColor || design.borderColor
  const layer = document.createElement("div")
  layer.style.cssText = "position:absolute;inset:0;overflow:hidden;pointer-events:none;"

  const border = getDesignBorderStyle(design)
  if (border) {
    const frame = document.createElement("div")
    frame.style.cssText = `position:absolute;inset:14px;border:${border};border-radius:18px;`
    layer.appendChild(frame)
  }

  const ornament = design.ornament ?? "none"
  if (ornament !== "none") {
    const dashed = document.createElement("div")
    dashed.style.cssText = `position:absolute;inset:22px;border:1px dashed ${accent};border-radius:16px;opacity:0.5;`
    layer.appendChild(dashed)
    for (const [x, y, size, opacity, rotate] of spots) {
      const svg = ornamentSvg(ornament, accent)
      svg.style.cssText = `position:absolute;left:${x}%;top:${y}%;width:${size}px;height:${size}px;opacity:${opacity};transform:translate(-50%,-50%) rotate(${rotate}deg);`
      layer.appendChild(svg)
    }
  }

  page.appendChild(layer)
}

function buildPage(
  personName: string,
  content: string,
  design: LetterDesignConfig,
  logo: string | null,
  background: string | null,
) {
  const size = sizeStyle(design.fontSize)
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
    "overflow:hidden",
    `background:${background ? paper : paperBackground(design)}`,
    `color:${design.textColor}`,
    `font-family:${fontStack(design.fontFamily)}`,
    "pointer-events:none",
  ].join(";")

  if (background) {
    const photo = document.createElement("div")
    photo.style.cssText = `position:absolute;inset:0;background-image:url("${background}");background-size:cover;background-position:center;`
    page.appendChild(photo)
    const veil = document.createElement("div")
    veil.style.cssText = `position:absolute;inset:0;background:${paper};opacity:${1 - (design.backgroundOpacity ?? 0.15)};`
    page.appendChild(veil)
  }

  appendDecor(page, design)

  const body = document.createElement("div")
  body.style.cssText = "position:relative;z-index:1;box-sizing:border-box;padding:68px 76px;"

  if (logo) {
    const image = document.createElement("img")
    image.src = logo
    image.alt = ""
    image.style.cssText = "display:block;max-height:60px;max-width:200px;object-fit:contain;margin-bottom:12px"
    body.appendChild(image)
  }

  const title = document.createElement("h2")
  title.textContent = personName
  title.style.cssText = [
    "margin:0 0 20px",
    "font-size:22px",
    "font-weight:700",
    `color:${design.titleColor}`,
    `border-bottom:1px solid ${design.accentColor || design.borderColor}`,
    "padding-bottom:6px",
  ].join(";")
  body.appendChild(title)

  const text = document.createElement("div")
  text.textContent = content
  text.style.cssText = [
    "white-space:pre-wrap",
    `font-size:${size.fontSize}`,
    `line-height:${size.lineHeight}`,
    `text-align:${design.align ?? "right"}`,
    `color:${design.textColor}`,
  ].join(";")
  body.appendChild(text)
  page.appendChild(body)
  return page
}

async function ensureFont(design: LetterDesignConfig) {
  const family = fontStack(design.fontFamily).split(",")[0]?.replaceAll('"', "").trim()
  if (!family) return
  await Promise.all([
    document.fonts.load(`400 17px "${family}"`),
    document.fonts.load(`700 22px "${family}"`),
  ])
}

async function waitForImages(root: HTMLElement) {
  const images = [...root.querySelectorAll("img")]
  await Promise.all(
    images.map(
      (image) =>
        image.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              image.onload = () => resolve()
              image.onerror = () => resolve()
            }),
    ),
  )
}

function addCanvas(pdf: jsPDF, canvas: HTMLCanvasElement, design: LetterDesignConfig, startNewPage: boolean) {
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

    if (startNewPage || pageIndex > 0) pdf.addPage()
    pdf.setFillColor(red, green, blue)
    pdf.rect(0, 0, 210, 297, "F")
    pdf.addImage(slice.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, 210, (height / sliceHeight) * 297)

    offset += sliceHeight
    pageIndex += 1
    if (pageIndex > 20) break
  }
}

async function drawLetter(
  pdf: jsPDF,
  personName: string,
  content: string,
  design: LetterDesignConfig | undefined,
  startNewPage: boolean,
) {
  const normalized = normalizeDesign(design)
  await ensureFont(normalized)
  const logo = await imageDataUrl(normalized.logoUrl)
  const background = await imageDataUrl(normalized.backgroundImageUrl)
  const page = buildPage(personName, content, normalized, logo, background)
  document.body.appendChild(page)

  try {
    await waitForImages(page)
    const canvas = await toCanvas(page, {
      pixelRatio: 2,
      backgroundColor: paperOf(normalized),
      width: PAGE_WIDTH,
      height: Math.max(page.scrollHeight, PAGE_HEIGHT),
      cacheBust: true,
    })
    addCanvas(pdf, canvas, normalized, startNewPage)
  } finally {
    page.remove()
  }
}

export interface LetterPdfInput {
  personName: string
  content: string
  design?: LetterDesignConfig
}

export async function renderLettersPdf(letters: LetterPdfInput[]): Promise<Blob> {
  await document.fonts.ready
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" })
  let started = false
  for (const letter of letters) {
    await drawLetter(pdf, letter.personName, letter.content, letter.design, started)
    started = true
  }
  return pdf.output("blob")
}

export async function renderLetterPdf(
  personName: string,
  content: string,
  design?: LetterDesignConfig,
): Promise<Blob> {
  return renderLettersPdf([{ personName, content, design }])
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
