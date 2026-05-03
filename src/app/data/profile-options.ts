export const FACULTIES = [
  "Arts & Education",
  "Business",
  "Computing",
  "Design",
  "Engineering",
  "Science",
  "English",
] as const;

export type FacultyOption = (typeof FACULTIES)[number];

export const COURSES_BY_FACULTY: Record<FacultyOption, readonly string[]> = {
  "Arts & Education": [
    "Early Childhood Education [Diploma]",
    "Media and Communication",
    "TESOL [Master]",
    "TESOL [Graduate Diploma]",
    "TESOL [Graduate Certificate]",
    "Education [Graduate Diploma]",
  ],

  Business: [
    "Business [Foundation]",
    "Business Management [Diploma]",
    "Accounting [Diploma]",
    "Accounting",
    "Accounting and Finance",
    "Finance",
    "Business",
    "Human Resources",
    "International Business",
    "Management",
    "Marketing",
    "Management & Digital Media",
    "Business / Information and Communication Technology",
    "Human Resource Management [Master]",
    "Business Administration [Master]",
    "Business Administration [Graduate Diploma]",
    "Business Administration [Graduate Certificate]",
    "ACCA Accelerate Program",
  ],

  Computing: [
    "IT/Multimedia [Foundation]",
    "Information Technology [Diploma]",
    "Information and Communication Technology",
    "Computer Science",
    "Cyber Security",
    "Data Science",
    "Software Engineering",
    "Information Technology [Master]",
    "Information Technology [Graduate Diploma]",
    "Information Technology [Graduate Certificate]",
  ],

  Design: [
    "Design [Foundation]",
    "Digital Media Design [Diploma]",
    "Graphic Design",
    "Multimedia Design",
    "Design / Business",
  ],

  Engineering: [
    "Engineering/Science [Foundation]",
    "Quantity Surveying [Diploma]",
    "Civil",
    "Chemical",
    "Electrical and Electronic",
    "Mechanical",
    "Robotics and Mechatronics",
    "Quantity Surveying",
    "Civil / Business",
    "Civil / Computer Science",
    "Electrical and Electronic / Computer Science",
    "Mechanical / Business",
    "Mechanical / Computer Science",
    "Robotics and Mechatronics / Computer Science",
    "Construction Management Practice [Master]",
  ],

  Science: [
    "Engineering/Science [Foundation]",
    "Biotechnology",
    "Environmental Science",
  ],

  English: [
    "English for Academic Purposes",
    "Intensive English",
  ],
};

export const YEAR_LABELS = [
  "Foundation Studies",
  "Diploma – Year 1",
  "Diploma – Year 2",
  "Degree – Year 1",
  "Degree – Year 2",
  "Degree – Year 3",
  "Degree – Year 4 / Honours",
  "Master – Coursework",
  "Master – Research",
  "PhD",
  "English Language Programme",
  "Exchange / Study Abroad",
  "Deferred / On leave",
  "Alumni / Graduated",
] as const;

export const CAMPUSES = ["Swinburne Sarawak"] as const;