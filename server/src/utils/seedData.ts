import Quiz from "../models/Quiz";
import User from "../models/User";

export const seedInitialQuizzes = async () => {
  try {
    // 1. Seed Default Admin & Student Accounts
    let admin = await User.findOne({ email: "admin@quizzy.io" });
    if (!admin) {
      console.log("Seeding default Admin user (admin@quizzy.io)...");
      admin = new User({
        name: "Admin Host",
        email: "admin@quizzy.io",
        password: "admin123",
        isAdmin: true,
        status: "active",
      });
      await admin.save();
    } else if (admin.status !== "active") {
      admin.status = "active";
      await admin.save();
    }

    let admin43 = await User.findOne({ email: "admin43@gmail.com" });
    if (!admin43) {
      console.log("Seeding Admin user (admin43@gmail.com)...");
      admin43 = new User({
        name: "Admin Vedant",
        email: "admin43@gmail.com",
        password: "admin43",
        isAdmin: true,
        status: "active",
      });
      await admin43.save();
    } else if (admin43.status !== "active") {
      admin43.status = "active";
      await admin43.save();
    }

    let student = await User.findOne({ email: "student@quizzy.io" });
    if (!student) {
      console.log("Seeding default Student user (student@quizzy.io)...");
      student = new User({
        name: "Student Alex",
        email: "student@quizzy.io",
        password: "user123",
        isAdmin: false,
        status: "active",
      });
      await student.save();
    } else if (student.status !== "active") {
      student.status = "active";
      await student.save();
    }

    // 2. Seed Default Quizzes
    const count = await Quiz.countDocuments();
    if (count > 0) return;

    console.log("Seeding initial sample quizzes...");

    const sampleQuizzes = [
      {
        title: "JavaScript & Web Development Essentials",
        description: "Core JavaScript concepts, DOM manipulation, and HTTP basics.",
        status: "active",
        defaultTimeLimit: 30,
        questions: [
          {
            question: "Which keyword is used to declare a block-scoped constant in modern JavaScript?",
            options: ["var", "let", "const", "def"],
            correctIndex: 2,
            timeLimit: 25,
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
          },
          {
            question: "Which HTTP status code signifies a successful request?",
            options: ["200 OK", "404 Not Found", "500 Internal Server Error", "301 Moved Permanently"],
            correctIndex: 0,
            timeLimit: 20,
          },
          {
            question: "What method converts a JavaScript object into a JSON string?",
            options: ["JSON.parse()", "JSON.stringify()", "JSON.toObject()", "Object.toJSON()"],
            correctIndex: 1,
            timeLimit: 25,
          },
        ],
      },
      {
        title: "Science & Technology Trivia",
        description: "Physics, astronomy, and computing history challenge.",
        status: "active",
        defaultTimeLimit: 30,
        questions: [
          {
            question: "What is the primary gas found in Earth's atmosphere?",
            options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Argon"],
            correctIndex: 1,
            timeLimit: 30,
          },
          {
            question: "Which planet in our solar system has the most prominent ring system?",
            options: ["Mars", "Jupiter", "Saturn", "Neptune"],
            correctIndex: 2,
            timeLimit: 30,
          },
          {
            question: "What unit is used to measure electrical resistance?",
            options: ["Volt", "Ampere", "Watt", "Ohm"],
            correctIndex: 3,
            timeLimit: 25,
          },
          {
            question: "Who is known as the father of computer science and artificial intelligence?",
            options: ["Alan Turing", "Charles Babbage", "Ada Lovelace", "John von Neumann"],
            correctIndex: 0,
            timeLimit: 30,
          },
        ],
      },
      {
        title: "World History & General Knowledge",
        description: "Historic milestones, world geography, and civilizations.",
        status: "active",
        defaultTimeLimit: 30,
        questions: [
          {
            question: "In what year was the United Nations founded?",
            options: ["1919", "1939", "1945", "1955"],
            correctIndex: 2,
            timeLimit: 30,
          },
          {
            question: "What is the capital city of Australia?",
            options: ["Sydney", "Melbourne", "Canberra", "Brisbane"],
            correctIndex: 2,
            timeLimit: 25,
          },
          {
            question: "Which ancient civilization built the Machu Picchu complex?",
            options: ["Aztecs", "Maya", "Inca", "Olmec"],
            correctIndex: 2,
            timeLimit: 30,
          },
          {
            question: "What is the longest river in the world?",
            options: ["Amazon River", "Nile River", "Yangtze River", "Mississippi River"],
            correctIndex: 1,
            timeLimit: 25,
          },
        ],
      },
    ];

    await Quiz.insertMany(sampleQuizzes);
    console.log("Sample quizzes seeded successfully!");
  } catch (err) {
    console.error("Error seeding sample quizzes:", err);
  }
};
