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
import type { LetterDesignConfig } from "./design-themes"

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
  const border =
    design.borderStyle === "none"
      ? "none"
      : design.borderStyle === "double"
        ? `4px double ${design.borderColor}`
        : design.borderStyle === "dashed"
          ? `2px dashed ${design.borderColor}`
          : `2px solid ${design.borderColor}`
  const bgImage = design.backgroundImageUrl
    ? `background-image: url('${design.backgroundImageUrl}'); background-size: cover; background-position: center;`
    : ""
  return `
    body { background-color: ${design.backgroundColor}; color: ${design.textColor}; }
    .letter { background-color: ${design.backgroundColor}; border: ${border}; position: relative; ${bgImage} }
    .letter-overlay { position: absolute; inset: 0; background-color: ${design.backgroundColor}; opacity: ${1 - (design.backgroundOpacity ?? 0.15)}; pointer-events: none; }
    .letter-content { position: relative; }
    .letter-logo { max-height: 60px; max-width: 200px; object-fit: contain; margin-bottom: 12px; display: block; }
    h2 { color: ${design.titleColor}; border-bottom-color: ${design.borderColor !== "none" ? design.borderColor : "#999"}; }
    pre { color: ${design.textColor}; }
  `
}

function buildPrintHtml(personName: string, content: string, design?: LetterDesignConfig): string {
  const logoHtml = design?.logoUrl
    ? `<img class="letter-logo" src="${design.logoUrl}" alt="לוגו" />`
    : ""
  const overlayHtml = design?.backgroundImageUrl
    ? `<div class="letter-overlay"></div>`
    : ""
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>מכתב ל${personName}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Arial Hebrew', Arial, sans-serif; font-size: 14px; direction: rtl; margin: 0; color: #000; }
    .letter { padding: 40px 50px; min-height: 100vh; }
    h2 { font-size: 18px; border-bottom: 1px solid #999; padding-bottom: 6px; margin-bottom: 20px; }
    pre { white-space: pre-wrap; font-family: inherit; font-size: 14px; line-height: 1.9; margin: 0; }
    @media print { @page { size: A4; margin: 20mm; } body { -webkit-print-color-adjust: exact; } }
    ${buildDesignStyles(design)}
  </style>
</head>
<body>
  <div class="letter">
    ${overlayHtml}
    <div class="letter-content">
      ${logoHtml}
      <h2>${personName}</h2>
      <pre>${content}</pre>
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
