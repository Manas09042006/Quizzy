import bcrypt from "bcryptjs";

export interface MockUser {
  _id: string;
  id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  isAdmin: boolean;
  tests: any[];
  comparePassword(enteredPassword: string): Promise<boolean>;
  save(): Promise<void>;
}

export interface MockQuiz {
  _id: string;
  title: string;
  description?: string;
  status: "draft" | "active" | "ended";
  defaultTimeLimit: number;
  marksPerQuestion: number;
  questions: Array<{
    _id?: string;
    question: string;
    options: string[];
    correctIndex: number;
    timeLimit?: number;
    marks?: number;
  }>;
  createdAt: Date;
  createdBy?: string;
}

export interface MockResult {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalMarks: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  answers: (number | null)[];
  violationCount: number;
  violations: string[];
  status: "completed" | "terminated_violations";
  startedAt?: Date;
  completedAt: Date;
  createdAt: Date;
}

const users: MockUser[] = [];
let idCounter = 300;
const nextId = () => {
  idCounter++;
  return `660000000000000000000${idCounter}`;
};

// Seed default users
(async () => {
  const adminSalt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash("admin123", adminSalt);
  users.push({
    _id: "660000000000000000000010",
    id: "660000000000000000000010",
    name: "Admin Host",
    email: "admin@quizzy.io",
    password: adminHash,
    role: "admin",
    isAdmin: true,
    tests: [],
    async comparePassword(entered: string) {
      return bcrypt.compare(entered, this.password);
    },
    async save() {},
  });

  const studentSalt = await bcrypt.genSalt(10);
  const studentHash = await bcrypt.hash("user123", studentSalt);
  users.push({
    _id: "660000000000000000000020",
    id: "660000000000000000000020",
    name: "Student Alex",
    email: "student@quizzy.io",
    password: studentHash,
    role: "user",
    isAdmin: false,
    tests: [],
    async comparePassword(entered: string) {
      return bcrypt.compare(entered, this.password);
    },
    async save() {},
  });
})();

const quizzes: MockQuiz[] = [
  {
    _id: "660000000000000000000001",
    title: "JavaScript & Web Development Essentials",
    description: "Core JavaScript concepts, DOM manipulation, and HTTP basics.",
    status: "active",
    defaultTimeLimit: 30,
    marksPerQuestion: 1,
    questions: [
      {
        question: "Which keyword is used to declare a block-scoped constant in modern JavaScript?",
        options: ["var", "let", "const", "def"],
        correctIndex: 2,
        timeLimit: 25,
        marks: 1,
      },
      {
        question: "What does DOM stand for in web development?",
        options: [
          "Data Object Management",
          "Document Object Model",
          "Digital Ordinance Mode",
          "Desktop Orientation Matrix",
        ],
        correctIndex: 1,
        timeLimit: 25,
        marks: 1,
      },
      {
        question: "Which HTTP status code signifies a successful request?",
        options: ["200 OK", "404 Not Found", "500 Internal Server Error", "301 Moved Permanently"],
        correctIndex: 0,
        timeLimit: 20,
        marks: 1,
      },
      {
        question: "What method converts a JavaScript object into a JSON string?",
        options: ["JSON.parse()", "JSON.stringify()", "JSON.toObject()", "Object.toJSON()"],
        correctIndex: 1,
        timeLimit: 25,
        marks: 1,
      },
    ],
    createdAt: new Date("2026-01-15T10:00:00Z"),
  },
  {
    _id: "660000000000000000000002",
    title: "Science & Technology Trivia",
    description: "Physics, astronomy, and computing history challenge.",
    status: "draft", // Upcoming / Waiting for admin to start
    defaultTimeLimit: 30,
    marksPerQuestion: 1,
    questions: [
      {
        question: "What is the primary gas found in Earth's atmosphere?",
        options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Argon"],
        correctIndex: 1,
        timeLimit: 30,
        marks: 1,
      },
      {
        question: "Which planet in our solar system has the most prominent ring system?",
        options: ["Mars", "Jupiter", "Saturn", "Neptune"],
        correctIndex: 2,
        timeLimit: 30,
        marks: 1,
      },
      {
        question: "What unit is used to measure electrical resistance?",
        options: ["Volt", "Ampere", "Watt", "Ohm"],
        correctIndex: 3,
        timeLimit: 25,
        marks: 1,
      },
      {
        question: "Who is known as the father of computer science and artificial intelligence?",
        options: ["Alan Turing", "Charles Babbage", "Ada Lovelace", "John von Neumann"],
        correctIndex: 0,
        timeLimit: 30,
        marks: 1,
      },
    ],
    createdAt: new Date("2026-02-10T14:30:00Z"),
  },
  {
    _id: "660000000000000000000003",
    title: "World History & General Knowledge",
    description: "Historic milestones, world geography, and civilizations.",
    status: "active",
    defaultTimeLimit: 30,
    marksPerQuestion: 1,
    questions: [
      {
        question: "In what year was the United Nations founded?",
        options: ["1919", "1939", "1945", "1955"],
        correctIndex: 2,
        timeLimit: 30,
        marks: 1,
      },
      {
        question: "What is the capital city of Australia?",
        options: ["Sydney", "Melbourne", "Canberra", "Brisbane"],
        correctIndex: 2,
        timeLimit: 25,
        marks: 1,
      },
      {
        question: "Which ancient civilization built the Machu Picchu complex?",
        options: ["Aztecs", "Maya", "Inca", "Olmec"],
        correctIndex: 2,
        timeLimit: 30,
        marks: 1,
      },
      {
        question: "What is the longest river in the world?",
        options: ["Amazon River", "Nile River", "Yangtze River", "Mississippi River"],
        correctIndex: 1,
        timeLimit: 25,
        marks: 1,
      },
    ],
    createdAt: new Date("2026-03-01T09:15:00Z"),
  },
];

const results: MockResult[] = [];

export const mockStore = {
  // Users
  async findUserByEmail(email: string): Promise<MockUser | null> {
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  },

  async findUserById(id: string): Promise<MockUser | null> {
    const user = users.find((u) => u._id === id || u.id === id);
    return user || null;
  },

  async createUser(name: string, email: string, rawPassword: string, isAdmin = false): Promise<MockUser> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);
    const id = nextId();

    const user: MockUser = {
      _id: id,
      id,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: isAdmin ? "admin" : "user",
      isAdmin,
      tests: [],
      async comparePassword(entered: string) {
        return bcrypt.compare(entered, this.password);
      },
      async save() {
        const idx = users.findIndex((u) => u._id === this._id);
        if (idx !== -1) {
          users[idx] = this;
        }
      },
    };

    users.push(user);
    return user;
  },

  // Quizzes
  async listQuizzes() {
    return quizzes;
  },

  async findQuizById(id: string): Promise<MockQuiz | null> {
    return quizzes.find((q) => q._id === id) || null;
  },

  async createQuiz(data: {
    title: string;
    description?: string;
    status?: "draft" | "active" | "ended";
    defaultTimeLimit?: number;
    marksPerQuestion?: number;
    questions: any[];
    createdBy?: string;
  }): Promise<MockQuiz> {
    const newQuiz: MockQuiz = {
      _id: nextId(),
      title: data.title,
      description: data.description || "",
      status: data.status || "draft",
      defaultTimeLimit: data.defaultTimeLimit || 30,
      marksPerQuestion: data.marksPerQuestion || 1,
      questions: data.questions.map((q) => ({
        ...q,
        timeLimit: q.timeLimit || data.defaultTimeLimit || 30,
        marks: q.marks || data.marksPerQuestion || 1,
      })),
      createdBy: data.createdBy,
      createdAt: new Date(),
    };
    quizzes.unshift(newQuiz);
    return newQuiz;
  },

  async editQuiz(id: string, data: Partial<MockQuiz>): Promise<MockQuiz | null> {
    const quiz = quizzes.find((q) => q._id === id);
    if (!quiz) return null;
    if (data.title) quiz.title = data.title;
    if (data.description !== undefined) quiz.description = data.description;
    if (data.status) quiz.status = data.status;
    if (data.defaultTimeLimit) quiz.defaultTimeLimit = data.defaultTimeLimit;
    if (data.marksPerQuestion) quiz.marksPerQuestion = data.marksPerQuestion;
    if (data.questions) quiz.questions = data.questions;
    return quiz;
  },

  async updateQuizStatus(id: string, status: "draft" | "active" | "ended"): Promise<MockQuiz | null> {
    const quiz = quizzes.find((q) => q._id === id);
    if (!quiz) return null;
    quiz.status = status;
    return quiz;
  },

  async deleteQuiz(id: string): Promise<boolean> {
    const idx = quizzes.findIndex((q) => q._id === id);
    if (idx === -1) return false;
    quizzes.splice(idx, 1);
    return true;
  },

  // Results & Monitoring
  async saveResult(
    userId: string,
    userName: string,
    userEmail: string,
    quizId: string,
    quizTitle: string,
    score: number,
    totalMarks: number,
    totalQuestions: number,
    correctCount: number,
    wrongCount: number,
    unansweredCount: number,
    answers: (number | null)[],
    violationCount = 0,
    violations: string[] = [],
    status: "completed" | "terminated_violations" = "completed"
  ): Promise<MockResult> {
    const newResult: MockResult = {
      _id: nextId(),
      userId,
      userName: userName || "Participant",
      userEmail: userEmail || "",
      quizId,
      quizTitle,
      score,
      totalMarks,
      totalQuestions,
      correctCount,
      wrongCount,
      unansweredCount,
      answers,
      violationCount,
      violations,
      status,
      completedAt: new Date(),
      createdAt: new Date(),
    };
    results.unshift(newResult);
    return newResult;
  },

  async getLatestResult(userId: string, quizId: string): Promise<MockResult | null> {
    return (
      results.find((r) => r.userId === userId && r.quizId === quizId) || null
    );
  },

  async getAdminOverview() {
    const totalQuizzes = quizzes.length;
    const activeQuizzes = quizzes.filter((q) => q.status === "active").length;
    const upcomingQuizzes = quizzes.filter((q) => q.status === "draft").length;
    const endedQuizzes = quizzes.filter((q) => q.status === "ended").length;
    const totalSubmissions = results.length;
    const flaggedSubmissions = results.filter((r) => r.violationCount > 0).length;
    const totalViolations = results.reduce((sum, r) => sum + r.violationCount, 0);

    return {
      totalQuizzes,
      activeQuizzes,
      upcomingQuizzes,
      endedQuizzes,
      totalSubmissions,
      flaggedSubmissions,
      totalViolations,
      recentSubmissions: results.slice(0, 20),
      quizzes: quizzes.map((q) => ({
        _id: q._id,
        title: q.title,
        description: q.description || "",
        status: q.status,
        defaultTimeLimit: q.defaultTimeLimit,
        marksPerQuestion: q.marksPerQuestion || 1,
        questionCount: q.questions.length,
        createdAt: q.createdAt,
        totalAttempts: results.filter((r) => r.quizId === q._id).length,
      })),
    };
  },

  async getQuizMonitoringData(quizId: string) {
    const quiz = quizzes.find((q) => q._id === quizId);
    if (!quiz) return null;

    const quizResults = results.filter((r) => r.quizId === quizId);
    const flaggedCount = quizResults.filter((r) => r.violationCount > 0).length;
    const averageScore =
      quizResults.length > 0
        ? (quizResults.reduce((s, r) => s + r.score, 0) / quizResults.length).toFixed(1)
        : 0;

    return {
      quiz,
      totalAttempts: quizResults.length,
      flaggedCount,
      averageScore,
      participants: quizResults,
    };
  },
};
