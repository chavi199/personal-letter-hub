// Mock data for the personal letters management system.
// This is the single source of truth used across all screens until a real
// backend is wired up.

export type LetterStatus = "not_started" | "draft" | "completed";

export interface Person {
  id: string;
  groupId: string;
  name: string;
  status: LetterStatus;
  letterContent: string;
  personalCard: {
    notes: string;
    ideas: string;
    traits: string;
    personalInfo: string;
  };
}

export interface Group {
  id: string;
  name: string;
  createdAt: string;
}

export interface ContentItem {
  id: string;
  content: string;
  category?: string; // used mainly for compliments
}

export interface ContentLibrary {
  openings: ContentItem[];
  compliments: ContentItem[];
  closings: ContentItem[];
}

export const mockGroups: Group[] = [
  { id: "g1", name: "משפחה", createdAt: "2026-06-01" },
  { id: "g2", name: "עמיתים לעבודה", createdAt: "2026-06-15" },
  { id: "g3", name: "חברים", createdAt: "2026-07-01" },
];

export const mockPeople: Person[] = [
  {
    id: "p1",
    groupId: "g1",
    name: "דניאל כהן",
    status: "completed",
    letterContent: "שלום דניאל,\n\nרציתי לומר לך תודה על כל מה שאתה עושה.",
    personalCard: { notes: "", ideas: "", traits: "", personalInfo: "" },
  },
  {
    id: "p2",
    groupId: "g1",
    name: "מיכל לוי",
    status: "draft",
    letterContent: "שלום מיכל,",
    personalCard: { notes: "", ideas: "", traits: "", personalInfo: "" },
  },
  {
    id: "p3",
    groupId: "g1",
    name: "יוסי מזרחי",
    status: "not_started",
    letterContent: "",
    personalCard: { notes: "", ideas: "", traits: "", personalInfo: "" },
  },
  {
    id: "p4",
    groupId: "g2",
    name: "רונית ברק",
    status: "completed",
    letterContent: "שלום רונית,",
    personalCard: { notes: "", ideas: "", traits: "", personalInfo: "" },
  },
  {
    id: "p5",
    groupId: "g2",
    name: "אבי שמש",
    status: "not_started",
    letterContent: "",
    personalCard: { notes: "", ideas: "", traits: "", personalInfo: "" },
  },
  {
    id: "p6",
    groupId: "g3",
    name: "נועה גולן",
    status: "draft",
    letterContent: "שלום נועה,",
    personalCard: { notes: "", ideas: "", traits: "", personalInfo: "" },
  },
];

export const mockContentLibrary: ContentLibrary = {
  openings: [
    { id: "o1", content: "שלום רב," },
    { id: "o2", content: "היי יקר/ה," },
    { id: "o3", content: "רציתי לכתוב לך כמה מילים מהלב." },
  ],
  compliments: [
    { id: "c1", category: "אישיות", content: "אתה אדם עם לב ענק." },
    { id: "c2", category: "עבודה", content: "המקצועיות שלך מרשימה תמיד." },
    { id: "c3", category: "כללי", content: "תמיד נעים להיות בסביבתך." },
  ],
  closings: [
    { id: "cl1", content: "בברכה חמה," },
    { id: "cl2", content: "שלך תמיד," },
    { id: "cl3", content: "תודה על הכל." },
  ],
};

export function getGroupById(id: string): Group | undefined {
  return mockGroups.find((g) => g.id === id);
}

export function getPeopleByGroup(groupId: string): Person[] {
  return mockPeople.filter((p) => p.groupId === groupId);
}

export function getPersonById(id: string): Person | undefined {
  return mockPeople.find((p) => p.id === id);
}

export const statusLabels: Record<LetterStatus, string> = {
  not_started: "לא התחיל",
  draft: "בטיוטה",
  completed: "הושלם",
};
