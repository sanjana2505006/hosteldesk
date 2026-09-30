const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const Notice = mongoose.model(
  "Notice",
  new mongoose.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    hostelId: { type: String, default: "" },
    hostelLabel: { type: String, default: "Campus" },
    authorName: { type: String, required: true },
    seenBy: {
      type: [{ userId: String, name: String }],
      default: [],
    },
    createdAt: { type: Date, default: Date.now },
  }),
);

function checkKey(req, res, next) {
  const key = req.get("x-desk-key");
  if (!process.env.DESK_API_KEY || key !== process.env.DESK_API_KEY) {
    return res.status(401).json({ error: "Missing desk key." });
  }
  next();
}

app.get("/notices", checkKey, async (req, res) => {
  const hostelId = typeof req.query.hostelId === "string" ? req.query.hostelId : "";
  const filter =
    req.query.all === "1" ? {} : { $or: [{ hostelId: "" }, { hostelId }] };
  const notices = await Notice.find(filter)
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();
  res.json({ notices });
});

app.post("/notices", checkKey, async (req, res) => {
  const title = req.body?.title?.trim();
  const body = req.body?.body?.trim();
  const authorName = req.body?.authorName?.trim();
  if (!title || !body || !authorName) {
    return res.status(400).json({ error: "Title and body are required." });
  }

  const notice = await Notice.create({
    title,
    body,
    authorName,
    hostelId: req.body.hostelId || "",
    hostelLabel: req.body.hostelLabel || "Campus",
  });
  res.status(201).json({ notice });
});

app.post("/notices/:id/seen", checkKey, async (req, res) => {
  const userId = req.body?.userId;
  const name = req.body?.name?.trim();
  if (!userId || !name) {
    return res.status(400).json({ error: "Need a name." });
  }
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ error: "Notice not found." });
  }

  const notice = await Notice.findById(req.params.id);
  if (!notice) return res.status(404).json({ error: "Notice not found." });

  const already = (notice.seenBy || []).some((row) => row.userId === userId);
  if (!already) {
    notice.seenBy.push({ userId, name });
    await notice.save();
  }

  res.json({ notice });
});

async function seedIfEmpty() {
  const count = await Notice.countDocuments();
  if (count) return;
  await Notice.create([
    {
      title: "Water off Sunday, 10am to 1pm",
      body: "Overhead tank cleaning. Fill a bottle on Saturday night.",
      hostelId: "",
      hostelLabel: "Campus",
      authorName: "Campus Admin",
      createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
    },
    {
      title: "Block A corridor Wi-Fi work tonight",
      body: "Suresh is on the 2nd floor access point after dinner. Expect drops till 11.",
      hostelId: "",
      hostelLabel: "Block A",
      authorName: "Prof. Iyer",
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
  ]);
}

const port = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGO_URL || "mongodb://localhost:27017/hosteldesk")
  .then(async () => {
    await seedIfEmpty();
    app.listen(port, () => {
      console.log(`Notice API on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Mongo did not connect.", error.message);
    process.exit(1);
  });
