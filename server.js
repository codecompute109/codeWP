const express = require("express");
const multer = require("multer");
const fs = require("fs");
const libre = require("libreoffice-convert");
const cors = require("cors");

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

// Convert endpoint
app.post("/convert", upload.single("file"), async (req, res) => {
  const inputPath = req.file.path;
  const outputPath = `${inputPath}.pdf`;

  const file = fs.readFileSync(inputPath);

  libre.convert(file, ".pdf", undefined, (err, done) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Conversion failed");
    }

    fs.writeFileSync(outputPath, done);

    res.download(outputPath, "converted.pdf", () => {
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

const { execSync } = require("child_process");

app.get("/health", (req, res) => {
  try {
    const v = execSync("soffice --version", { encoding: "utf8" });
    res.json({ ok: true, libreoffice: v.trim() });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

