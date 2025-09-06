export type MockQA = {
  question: string[];
  answer: string;
};

// Mock conversational dataset used by the ChatWidget for scripted replies.
// Source provided by user; lightly typed for TS usage.
export const MOCK_QA: MockQA[] = [
  {
    question: ["hello", "hi", "hey"],
    answer:
      "👋 Hi there! I’m TraceBot, your smart assistant for transport & impact simulation. Want me to guide you?",
  },
  {
    question: ["what is this", "explain", "about"],
    answer:
      "This platform helps visualize how vegetables and goods fit into trucks 🚚 and shows their environmental impact 🌍.",
  },
  {
    question: ["demo", "try", "simulate"],
    answer:
      "Click on the Simulator to enter vegetable types and quantities. I’ll show you the truck layout and impact charts!",
  },
  {
    question: ["impact", "environment", "carbon"],
    answer:
      "We calculate estimated CO₂ emissions 🌱 based on transport layout, distances, and load efficiency.",
  },
  {
    question: ["login", "account", "sign up"],
    answer:
      "Currently, we’re in demo phase, so no login is needed. In the future, you’ll be able to create accounts and save results.",
  },
  {
    question: ["goodbye", "bye", "exit"],
    answer:
      "Goodbye! 👋 Don’t forget to test the demo and explore the charts before you leave!",
  },
];

// Optional lightweight alias map to catch common phrasing without external deps.
export const QUESTION_ALIASES: Record<string, string[]> = {
  // map base keyword -> extra synonyms
  try: [
    "start",
    "getting started",
    "how do i start",
    "begin",
    "get started",
    "how to start",
  ],
  "what is this": [
    "what does this platform do",
    "what is shelflife",
    "explain platform",
    "about platform",
  ],
  impact: ["emissions", "co2", "carbon footprint", "environmental impact"],
  hello: ["good morning", "good afternoon", "good evening"],
  goodbye: ["see you", "later", "close chat"],
};

