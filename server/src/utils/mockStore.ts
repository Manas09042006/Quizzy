import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

export interface MockUser {
  _id: string;
  id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  isAdmin: boolean;
  status: "pending_approval" | "active" | "blocked";
  lastLogin?: Date;
  createdAt?: Date;
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
  overallTimeLimit?: number;
  minTimePerQuestion?: number;
  timerMode?: "overall" | "per_question";
  shuffleQuestions?: boolean;
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

export interface MockAttempt {
  _id: string;
  id: string;
  quizId: string;
  userId: string;
  userName: string;
  userEmail: string;
  startedAt: Date;
  expiresAt: Date;
  status: "in_progress" | "submitted" | "expired" | "auto_submitted";
  answers: (number | null)[];
  currentQuestion: number;
  violationCount: number;
  questionOrder: number[];
  optionOrders: number[][];
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockAuditLog {
  _id: string;
  id: string;
  action: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  targetId?: string;
  details?: any;
  ipAddress?: string;
  timestamp: Date;
}

// In-Memory Data Collections
let users: MockUser[] = [];
let quizzes: MockQuiz[] = [];
let attempts: MockAttempt[] = [];
let results: MockResult[] = [];
let auditLogs: MockAuditLog[] = [];
let idCounter = 300;

export const nextId = () => {
  idCounter++;
  return `660000000000000000000${idCounter}`;
};

// ==========================================
// Persistent File Storage Engine
// ==========================================
// Resolves data file path to ensure persistence across restarts
const DATA_DIR = path.resolve(__dirname, "../../data");
const DATA_FILE = process.env.QUIZZY_DATA_FILE || path.join(DATA_DIR, "quizzy_store.json");

interface PersistedState {
  version: number;
  idCounter: number;
  users: Array<Omit<MockUser, "comparePassword" | "save">>;
  quizzes: MockQuiz[];
  attempts: MockAttempt[];
  results: MockResult[];
  auditLogs: MockAuditLog[];
}

function hydrateUser(raw: any): MockUser {
  const user: MockUser = {
    _id: raw._id || raw.id,
    id: raw.id || raw._id,
    name: raw.name,
    email: (raw.email || "").toLowerCase(),
    password: raw.password,
    role: raw.role || (raw.isAdmin ? "admin" : "user"),
    isAdmin: Boolean(raw.isAdmin),
    status: raw.status || "active",
    lastLogin: raw.lastLogin ? new Date(raw.lastLogin) : undefined,
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    tests: raw.tests || [],
    async comparePassword(entered: string) {
      return bcrypt.compare(entered, this.password);
    },
    async save() {
      const idx = users.findIndex((u) => u._id === this._id);
      if (idx !== -1) {
        users[idx] = this;
      }
      persistStore();
    },
  };
  return user;
}

function persistStoreSync() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const cleanUsers = users.map((u) => ({
      _id: u._id,
      id: u.id,
      name: u.name,
      email: u.email,
      password: u.password,
      role: u.role,
      isAdmin: u.isAdmin,
      status: u.status,
      lastLogin: u.lastLogin,
      createdAt: u.createdAt,
      tests: u.tests || [],
    }));

    const state: PersistedState = {
      version: 1,
      idCounter,
      users: cleanUsers,
      quizzes,
      attempts,
      results,
      auditLogs,
    };

    const tmpFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(state, null, 2), "utf8");
    fs.renameSync(tmpFile, DATA_FILE);
  } catch (err) {
    console.error("[PersistentStore] Error writing store to disk:", err);
  }
}

let saveTimer: NodeJS.Timeout | null = null;
export function persistStore() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    persistStoreSync();
    saveTimer = null;
  }, 100);
}

// Ensure pending writes flush before process exits
process.on("beforeExit", () => {
  if (saveTimer) {
    clearTimeout(saveTimer);
    persistStoreSync();
  }
});
process.on("SIGINT", () => {
  persistStoreSync();
});
process.on("SIGTERM", () => {
  persistStoreSync();
});

function seedDefaultData() {
  console.log("🌱 [PersistentStore] Initializing default database seed...");

  const adminHash = bcrypt.hashSync("admin123", 10);
  const adminUser = hydrateUser({
    _id: "660000000000000000000010",
    id: "660000000000000000000010",
    name: "Admin Host",
    email: "admin@quizzy.io",
    password: adminHash,
    role: "admin",
    isAdmin: true,
    status: "active",
    createdAt: new Date("2026-01-01T00:00:00Z"),
    tests: [],
  });

  const admin43Hash = bcrypt.hashSync("admin43", 10);
  const admin43User = hydrateUser({
    _id: "660000000000000000000043",
    id: "660000000000000000000043",
    name: "Admin Vedant",
    email: "admin43@gmail.com",
    password: admin43Hash,
    role: "admin",
    isAdmin: true,
    status: "active",
    createdAt: new Date("2026-01-01T00:00:00Z"),
    tests: [],
  });

  const studentHash = bcrypt.hashSync("user123", 10);
  const studentUser = hydrateUser({
    _id: "660000000000000000000020",
    id: "660000000000000000000020",
    name: "Student Alex",
    email: "student@quizzy.io",
    password: studentHash,
    role: "user",
    isAdmin: false,
    status: "active",
    createdAt: new Date("2026-01-01T00:00:00Z"),
    tests: [],
  });

  users = [adminUser, admin43User, studentUser];

  quizzes = [
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
      status: "draft",
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

  attempts = [];
  results = [];
  auditLogs = [];

  persistStoreSync();
  console.log(`💾 [PersistentStore] Default state persisted to ${DATA_FILE}`);
}

function loadStore() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, "utf8");
      const state: PersistedState = JSON.parse(raw);

      if (state && typeof state === "object") {
        idCounter = state.idCounter || 300;

        if (Array.isArray(state.users)) {
          users = state.users.map((u) => hydrateUser(u));

          // Ensure admin43 exists in loaded store
          const hasAdmin43 = users.some((u) => u.email === "admin43@gmail.com");
          if (!hasAdmin43) {
            const admin43Hash = bcrypt.hashSync("admin43", 10);
            users.push(
              hydrateUser({
                _id: "660000000000000000000043",
                id: "660000000000000000000043",
                name: "Admin Vedant",
                email: "admin43@gmail.com",
                password: admin43Hash,
                role: "admin",
                isAdmin: true,
                status: "active",
                createdAt: new Date(),
                tests: [],
              })
            );
            persistStore();
          }
        }

        if (Array.isArray(state.quizzes)) {
          quizzes = state.quizzes.map((q) => ({
            ...q,
            createdAt: q.createdAt ? new Date(q.createdAt) : new Date(),
          }));
        }

        if (Array.isArray(state.attempts)) {
          attempts = state.attempts.map((a) => ({
            ...a,
            startedAt: new Date(a.startedAt),
            expiresAt: new Date(a.expiresAt),
            createdAt: new Date(a.createdAt),
            updatedAt: new Date(a.updatedAt),
            submittedAt: a.submittedAt ? new Date(a.submittedAt) : undefined,
          }));
        }

        if (Array.isArray(state.results)) {
          results = state.results.map((r) => ({
            ...r,
            startedAt: r.startedAt ? new Date(r.startedAt) : undefined,
            completedAt: new Date(r.completedAt),
            createdAt: new Date(r.createdAt),
          }));
        }

        if (Array.isArray(state.auditLogs)) {
          auditLogs = state.auditLogs.map((l) => ({
            ...l,
            timestamp: new Date(l.timestamp),
          }));
        }

        console.log(
          `💾 [PersistentStore] Loaded ${users.length} users, ${quizzes.length} quizzes, ${results.length} results from ${DATA_FILE}`
        );
        return;
      }
    } catch (err) {
      console.error("[PersistentStore] Error parsing stored database JSON:", err);
    }
  }

  // File does not exist or was invalid -> Seed default data
  seedDefaultData();
}

// Initialize persistent store immediately upon module import
loadStore();

// ==========================================
// Mock Store Operations
// ==========================================
export const mockStore = {
  // Persistence Diagnostics
  getDataFilePath() {
    return DATA_FILE;
  },

  persistImmediately() {
    persistStoreSync();
  },

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

    const user: MockUser = hydrateUser({
      _id: id,
      id,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: isAdmin ? "admin" : "user",
      isAdmin,
      status: isAdmin ? "active" : "pending_approval",
      createdAt: new Date(),
      tests: [],
    });

    users.push(user);
    persistStore();
    return user;
  },

  async listStudents(filter?: { status?: string; search?: string }) {
    let result = users.filter((u) => !u.isAdmin && u.role !== "admin");
    if (filter?.status && filter.status !== "all") {
      result = result.filter((u) => u.status === filter.status);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase().trim();
      result = result.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    return result.map((u) => ({
      _id: u._id,
      id: u.id,
      name: u.name,
      email: u.email,
      status: u.status,
      lastLogin: u.lastLogin,
      createdAt: u.createdAt || new Date(),
      quizAttempts: u.tests?.length || 0,
    }));
  },

  async updateUserStatus(id: string, status: "pending_approval" | "active" | "blocked") {
    const user = users.find((u) => u._id === id || u.id === id);
    if (!user) return null;
    user.status = status;
    persistStore();
    return user;
  },

  async deleteStudent(id: string): Promise<boolean> {
    const idx = users.findIndex((u) => (u._id === id || u.id === id) && !u.isAdmin && u.role !== "admin");
    if (idx === -1) return false;
    users.splice(idx, 1);
    // Remove all associated results and attempts
    const remainingResults = results.filter((r) => r.userId !== id);
    results.length = 0;
    results.push(...remainingResults);
    const remainingAttempts = attempts.filter((a) => a.userId !== id);
    attempts.length = 0;
    attempts.push(...remainingAttempts);
    persistStore();
    return true;
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
    timerMode?: "overall" | "per_question";
    defaultTimeLimit?: number;
    overallTimeLimit?: number;
    minTimePerQuestion?: number;
    shuffleQuestions?: boolean;
    marksPerQuestion?: number;
    questions: any[];
    createdBy?: string;
  }): Promise<MockQuiz> {
    const newQuiz: MockQuiz = {
      _id: nextId(),
      title: data.title,
      description: data.description || "",
      status: data.status || "draft",
      timerMode: data.timerMode || "per_question",
      defaultTimeLimit: data.defaultTimeLimit || 30,
      overallTimeLimit: data.overallTimeLimit || 0,
      minTimePerQuestion: data.minTimePerQuestion || 0,
      shuffleQuestions: data.shuffleQuestions !== false,
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
    persistStore();
    return newQuiz;
  },

  async editQuiz(id: string, data: Partial<MockQuiz>): Promise<MockQuiz | null> {
    const quiz = quizzes.find((q) => q._id === id);
    if (!quiz) return null;
    if (data.title) quiz.title = data.title;
    if (data.description !== undefined) quiz.description = data.description;
    if (data.status) quiz.status = data.status;
    if (data.timerMode) quiz.timerMode = data.timerMode;
    if (data.defaultTimeLimit) quiz.defaultTimeLimit = data.defaultTimeLimit;
    if (data.overallTimeLimit !== undefined) quiz.overallTimeLimit = data.overallTimeLimit;
    if (data.minTimePerQuestion !== undefined) quiz.minTimePerQuestion = data.minTimePerQuestion;
    if (data.shuffleQuestions !== undefined) quiz.shuffleQuestions = data.shuffleQuestions;
    if (data.marksPerQuestion) quiz.marksPerQuestion = data.marksPerQuestion;
    if (data.questions) quiz.questions = data.questions;
    persistStore();
    return quiz;
  },

  async updateQuizStatus(id: string, status: "draft" | "active" | "ended"): Promise<MockQuiz | null> {
    const quiz = quizzes.find((q) => q._id === id);
    if (!quiz) return null;
    quiz.status = status;
    persistStore();
    return quiz;
  },

  async deleteQuiz(id: string): Promise<boolean> {
    const idx = quizzes.findIndex((q) => q._id === id);
    if (idx === -1) return false;
    quizzes.splice(idx, 1);
    persistStore();
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
    persistStore();
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

  async removeQuizParticipant(quizId: string, resultId: string): Promise<boolean> {
    const idx = results.findIndex((r) => r._id === resultId && r.quizId === quizId);
    if (idx === -1) return false;
    results.splice(idx, 1);
    persistStore();
    return true;
  },

  // Attempts
  async createAttempt(data: {
    quizId: string;
    userId: string;
    userName: string;
    userEmail: string;
    startedAt: Date;
    expiresAt: Date;
    questionOrder: number[];
    optionOrders: number[][];
    totalQuestions: number;
  }): Promise<MockAttempt> {
    const id = nextId();
    const newAttempt: MockAttempt = {
      _id: id,
      id,
      quizId: data.quizId,
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      startedAt: data.startedAt,
      expiresAt: data.expiresAt,
      status: "in_progress",
      answers: new Array(data.totalQuestions).fill(null),
      currentQuestion: 0,
      violationCount: 0,
      questionOrder: data.questionOrder,
      optionOrders: data.optionOrders,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    attempts.unshift(newAttempt);
    persistStore();
    return newAttempt;
  },

  async findAttemptById(id: string): Promise<MockAttempt | null> {
    return attempts.find((a) => a._id === id || a.id === id) || null;
  },

  async findActiveAttempt(userId: string, quizId: string): Promise<MockAttempt | null> {
    return (
      attempts.find(
        (a) =>
          a.userId === userId &&
          a.quizId === quizId &&
          a.status === "in_progress" &&
          new Date(a.expiresAt).getTime() > Date.now()
      ) || null
    );
  },

  async findUserAttempts(userId: string, quizId: string): Promise<MockAttempt[]> {
    return attempts.filter((a) => a.userId === userId && a.quizId === quizId);
  },

  async updateAttempt(id: string, updates: Partial<MockAttempt>): Promise<MockAttempt | null> {
    const attempt = attempts.find((a) => a._id === id || a.id === id);
    if (!attempt) return null;
    Object.assign(attempt, updates, { updatedAt: new Date() });
    persistStore();
    return attempt;
  },

  // Audit Logs
  async createAuditLog(data: {
    action: string;
    actorId?: string;
    actorName?: string;
    actorRole?: string;
    targetId?: string;
    details?: any;
    ipAddress?: string;
    timestamp?: Date;
  }): Promise<MockAuditLog> {
    const id = nextId();
    const newLog: MockAuditLog = {
      _id: id,
      id,
      action: data.action,
      actorId: data.actorId || "system",
      actorName: data.actorName || "System",
      actorRole: data.actorRole || "system",
      targetId: data.targetId || "",
      details: data.details,
      ipAddress: data.ipAddress || "127.0.0.1",
      timestamp: data.timestamp || new Date(),
    };
    auditLogs.unshift(newLog);
    persistStore();
    return newLog;
  },

  async listAuditLogs(filter?: {
    action?: string;
    search?: string;
    user?: string;
    page?: number;
    limit?: number;
  }) {
    let result = [...auditLogs];

    if (filter?.action && filter.action !== "all") {
      result = result.filter((l) => l.action === filter.action);
    }
    if (filter?.user) {
      const q = filter.user.toLowerCase().trim();
      result = result.filter(
        (l) => l.actorName.toLowerCase().includes(q) || l.actorId.toLowerCase().includes(q)
      );
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.action.toLowerCase().includes(q) ||
          l.actorName.toLowerCase().includes(q) ||
          JSON.stringify(l.details || "").toLowerCase().includes(q)
      );
    }

    const page = Math.max(1, filter?.page || 1);
    const limit = Math.min(100, Math.max(1, filter?.limit || 20));
    const total = result.length;
    const paginated = result.slice((page - 1) * limit, page * limit);

    return {
      logs: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  },
};
