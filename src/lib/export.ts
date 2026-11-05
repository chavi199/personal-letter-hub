import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  PageBreak,
  Paragraph,
  ShadingType,
  TextRun,
} from "docx"
import { fetchPeopleByGroup } from "./api/people"
import { fetchVersionsForPeople } from "./api/letter-versions"
import { toast } from "sonner"
import {
  hasLetterDesign,
  normalizeDesign,
  type LetterDesignConfig,
  type LetterFont,
  type LetterSize,
} from "./design-themes"
import { readLocalDesign } from "./letter-design-storage"
import { renderLetterPdf, renderLettersPdf } from "./letter-pdf"
import type { DbLetterVersion } from "./supabase"

interface DesignedLetter {
  name: string
  content: string
  design?: LetterDesignConfig
}

function pickDesign(versions: DbLetterVersion[], content: string): LetterDesignConfig | undefined {
  const withDesign = versions.filter((version) => hasLetterDesign(version.design_config))
  const match = withDesign.find((version) => version.letter_content.trim() === content.trim())
  const chosen = match?.design_config ?? withDesign[0]?.design_config
  return chosen ? normalizeDesign(chosen) : undefined
}

async function getDesignedLetters(groupId: string): Promise<DesignedLetter[]> {
  const people = await fetchPeopleByGroup(groupId)
  const letters = people.filter((person) => person.letter_content.trim())
  const versions = await fetchVersionsForPeople(letters.map((person) => person.id))
  return letters.map((person) => ({
    name: person.name,
    content: person.letter_content,
    design: readLocalDesign(person.id) ?? pickDesign(versions.get(person.id) ?? [], person.letter_content),
  }))
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function designOf(design?: LetterDesignConfig): LetterDesignConfig {
  return normalizeDesign(design)
}

function wordFont(font?: LetterFont): string {
  if (font === "heebo") return "Heebo"
  if (font === "assistant") return "Assistant"
  if (font === "frank") return "Frank Ruhl Libre"
  if (font === "secular") return "Secular One"
  return "Rubik"
}

function wordSize(size?: LetterSize): number {
  if (size === "sm") return 22
  if (size === "lg") return 30
  return 26
}

function wordAlign(design: LetterDesignConfig) {
  if (design.align === "center") return AlignmentType.CENTER
  if (design.align === "justify") return AlignmentType.JUSTIFIED
  return AlignmentType.RIGHT
}

function letterParagraphs(person: DesignedLetter, withBreak: boolean): Paragraph[] {
  const design = designOf(person.design)
  const color = design.textColor.replace("#", "")
  const title = design.titleColor.replace("#", "")
  const paper = design.backgroundColor.replace("#", "")
  const accent = (design.accentColor || design.borderColor).replace("#", "")
  const font = wordFont(design.fontFamily)
  const size = wordSize(design.fontSize)
  const shading = { type: ShadingType.CLEAR, fill: paper }
  const paragraphs = [
    new Paragraph({
      bidirectional: true,
      alignment: wordAlign(design),
      shading,
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: accent, space: 4 } },
      children: [new TextRun({ text: person.name, bold: true, font, size: size + 6, color: title, rightToLeft: true })],
    }),
    new Paragraph({ shading, children: [new TextRun("")] }),
    ...person.content.split("\n").map(
      (line) =>
        new Paragraph({
          bidirectional: true,
          alignment: wordAlign(design),
          shading,
          children: [new TextRun({ text: line || " ", font, size, color, rightToLeft: true })],
        }),
    ),
  ]
  if (withBreak) paragraphs.push(new Paragraph({ children: [new PageBreak()] }))
  return paragraphs
}

export async function exportGroupToPDF(groupId: string, groupName: string) {
  const toastId = toast.loading("מכין PDF עם העיצוב...")
  try {
    const letters = await getDesignedLetters(groupId)
    if (letters.length === 0) {
      toast.error("אין מכתבים לייצא בקבוצה זו", { id: toastId })
      return
    }
    const blob = await renderLettersPdf(
      letters.map((letter) => ({
        personName: letter.name,
        content: letter.content,
        design: letter.design,
      })),
    )
    downloadBlob(blob, `מכתבים-${groupName}.pdf`)
    toast.success(`יוצאו ${letters.length} מכתבים`, { id: toastId })
  } catch (error) {
    toast.error(error instanceof Error && error.message ? error.message : "הייצוא נכשל", { id: toastId })
  }
}

// ---- Word (.docx) ----

export async function exportGroupToWord(groupId: string, groupName: string) {
  const letters = await getDesignedLetters(groupId)
  if (letters.length === 0) {
    toast.error("אין מכתבים לייצא בקבוצה זו")
    return
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: letters.flatMap((letter, index) => letterParagraphs(letter, index < letters.length - 1)),
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  downloadBlob(blob, `מכתבים-${groupName}.docx`)
  toast.success(`יוצאו ${letters.length} מכתבים`)
}

// ---- Single letter ----

export async function exportLetterToPDF(personName: string, content: string, design?: LetterDesignConfig): Promise<void> {
  if (!content.trim()) { toast.error("המכתב ריק — אין מה לייצא"); return }
  const toastId = toast.loading("מכין PDF עם העיצוב...")
  try {
    const blob = await renderLetterPdf(personName, content, design)
    downloadBlob(blob, `מכתב-${personName}.pdf`)
    toast.success("הקובץ ירד עם העיצוב", { id: toastId })
  } catch (error) {
    toast.error(error instanceof Error && error.message ? error.message : "הייצוא נכשל", { id: toastId })
  }
}

export async function exportLetterToWord(personName: string, content: string, design?: LetterDesignConfig): Promise<void> {
  if (!content.trim()) { toast.error("המכתב ריק — אין מה לייצא"); return }

  const doc = new Document({
    sections: [{
      properties: {},
      children: letterParagraphs({ name: personName, content, design }, false),
    }],
  })

  const blob = await Packer.toBlob(doc)
  downloadBlob(blob, `מכתב-${personName}.docx`)
  toast.success("מכתב יוצא בהצלחה")
}
