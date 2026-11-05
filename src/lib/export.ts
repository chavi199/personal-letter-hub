import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  PageBreak,
  AlignmentType,
  TextDirection,
} from "docx"
import { fetchPeopleByGroup } from "./api/people"
import { toast } from "sonner"
import { fontStack, sizeStyle, type LetterDesignConfig } from "./design-themes"

// ---- Shared: fetch letters ----

async function getLetters(groupId: string) {
  const people = await fetchPeopleByGroup(groupId)
  return people.filter((p) => p.letter_content.trim())
}

// ---- PDF: print dialog ----

export async function exportGroupToPDF(groupId: string, groupName: string) {
  const letters = await getLetters(groupId)
  if (letters.length === 0) {
    toast.error("אין מכתבים לייצא בקבוצה זו")
    return
  }

  const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>מכתבים — ${groupName}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Arial Hebrew', Arial, sans-serif;
      font-size: 14px;
      direction: rtl;
      margin: 0;
      padding: 0;
      color: #000;
    }
    .letter {
      padding: 40px 50px;
      min-height: 100vh;
      page-break-after: always;
    }
    .letter:last-child { page-break-after: auto; }
    h2 {
      font-size: 18px;
      border-bottom: 1px solid #999;
      padding-bottom: 6px;
      margin-bottom: 20px;
    }
    pre {
      white-space: pre-wrap;
      font-family: inherit;
      font-size: 14px;
      line-height: 1.9;
      margin: 0;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  ${letters
    .map(
      (p) => `
  <div class="letter">
    <h2>${p.name}</h2>
    <pre>${p.letter_content}</pre>
  </div>`,
    )
    .join("")}
</body>
</html>`

  const win = window.open("", "_blank")
  if (!win) {
    toast.error("לא ניתן לפתוח חלון — אפשר חלונות קופצים בדפדפן")
    return
  }
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 300)
}

// ---- Word (.docx) ----

export async function exportGroupToWord(groupId: string, groupName: string) {
  const letters = await getLetters(groupId)
  if (letters.length === 0) {
    toast.error("אין מכתבים לייצא בקבוצה זו")
    return
  }

  const sections = letters.flatMap((p, i) => {
    const paragraphs: Paragraph[] = [
      new Paragraph({
        text: p.name,
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
      }),
      ...p.letter_content.split("\n").map(
        (line) =>
          new Paragraph({
            children: [new TextRun({ text: line })],
            alignment: AlignmentType.RIGHT,
            bidirectional: true,
          }),
      ),
    ]

    // page break between letters (not after last)
    if (i < letters.length - 1) {
      paragraphs.push(
        new Paragraph({
          children: [new PageBreak()],
        }),
      )
    }

    return paragraphs
  })

  const doc = new Document({
    sections: [
      {
        properties: {
          titlePage: false,
        },
        children: [
          new Paragraph({
            text: `מכתבים — ${groupName}`,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.RIGHT,
            bidirectional: true,
          }),
          new Paragraph({ children: [new TextRun("")] }),
          ...sections,
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `מכתבים-${groupName}.docx`
  a.click()
  URL.revokeObjectURL(url)
  toast.success(`יוצאו ${letters.length} מכתבים`)
}

// ---- Single letter ----

function buildDesignStyles(design?: LetterDesignConfig): string {
  if (!design) return ""
  const size = sizeStyle(design.fontSize)
  const accent = design.accentColor || design.borderColor
  const paper = design.backgroundColor || "#ffffff"
  return `
    html, body { background: ${paper}; color: ${design.textColor}; font-family: ${fontStack(design.fontFamily)}; }
    .letter { background: ${paper}; }
    .letter-content { text-align: ${design.align ?? "right"}; }
    .letter-logo { max-height: 60px; max-width: 200px; object-fit: contain; margin-bottom: 12px; display: block; }
    h2 { color: ${design.titleColor}; border-bottom-color: ${accent}; }
    pre { color: ${design.textColor}; font-size: ${size.fontSize}; line-height: ${size.lineHeight}; text-align: ${design.align ?? "right"}; }
  `
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

function buildPrintHtml(personName: string, content: string, design?: LetterDesignConfig): string {
  const safeName = escapeHtml(personName)
  const logoHtml = design?.logoUrl
    ? `<img class="letter-logo" src="${escapeHtml(design.logoUrl)}" alt="" />`
    : ""
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>מכתב ל${safeName}</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;700&family=Frank+Ruhl+Libre:wght@400;700&family=Heebo:wght@400;700&family=Rubik:wght@400;700&family=Secular+One&display=swap">
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      background: #ffffff;
      color: #000;
      font-family: 'Arial Hebrew', Arial, sans-serif;
      font-size: 14px;
      direction: rtl;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .letter {
      padding: 18mm 20mm;
      min-height: 100vh;
      background: #ffffff;
      border: none;
    }
    h2 { font-size: 18px; border-bottom: 1px solid #999; padding-bottom: 6px; margin: 0 0 20px; }
    pre { white-space: pre-wrap; font-family: inherit; font-size: 14px; line-height: 1.9; margin: 0; }
    @page { size: A4; margin: 0; }
    ${buildDesignStyles(design)}
  </style>
</head>
<body>
  <div class="letter">
    <div class="letter-content">
      ${logoHtml}
      <h2>${safeName}</h2>
      <pre>${escapeHtml(content)}</pre>
    </div>
  </div>
</body>
</html>`
}

export function exportLetterToPDF(personName: string, content: string, design?: LetterDesignConfig): void {
  if (!content.trim()) { toast.error("המכתב ריק — אין מה לייצא"); return }
  const win = window.open("", "_blank")
  if (!win) { toast.error("לא ניתן לפתוח חלון — אפשר חלונות קופצים בדפדפן"); return }
  win.document.write(buildPrintHtml(personName, content, design))
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 300)
}

export async function exportLetterToWord(personName: string, content: string): Promise<void> {
  if (!content.trim()) { toast.error("המכתב ריק — אין מה לייצא"); return }

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: personName,
          heading: HeadingLevel.HEADING_2,
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
        }),
        new Paragraph({ children: [new TextRun("")] }),
        ...content.split("\n").map(
          (line) =>
            new Paragraph({
              children: [new TextRun({ text: line })],
              alignment: AlignmentType.RIGHT,
              bidirectional: true,
            }),
        ),
      ],
    }],
  })

  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `מכתב-${personName}.docx`
  a.click()
  URL.revokeObjectURL(url)
  toast.success("מכתב יוצא בהצלחה")
}
