// Dependencies
const express = require("express");
const path = require("path");
const fs = require("fs");
const util = require("util");

const app = express();
const PORT = process.env.PORT || 8000;

// Set up middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

// join db.json with notesArray
const notesArray = path.join(__dirname, 'db/db.json');

// routes
app.get("/api/notes", function (req, res) {
    readFile(notesArray, "utf8").then(data => res.json(JSON.parse(data))).catch((error) => {
        console.log(`Error reading file ${notesArray}`);
    });
});

// give notes IDs
function generateNewId(currentNotes) {
    let noteID = 0;
    currentNotes.forEach(note => {
        if (note.id > noteID) {
            noteID = note.id;
        }
    });
    return noteID + 1;
};

// create
app.post("/api/notes", function (req, res) {
    readFile(notesArray, "utf8").then(data => {
        let notes = JSON.parse(data);
        const newNote = { ...req.body, "id": generateNewId(notes) };
        notes.push(newNote);
        writeFile(notesArray, JSON.stringify(notes)).then(() => {
            res.json(newNote);
        })
            .catch((error) => {
                console.log(`Error writing file ${notesArray}`);
            });
    })
        .catch((error) => {
            console.log(`Error reading file ${notesArray}`);
        });
});

// delete
app.delete("/api/notes/:id", function (req, res) {
    const deleteNote = parseInt(req.params.id);
    readFile(notesArray, "utf8").then(data => {
        let notes = JSON.parse(data);
        // Filtering newNote referenced above to ensure its ID doesn't equal deleteNote
        notes = notes.filter(newNote => newNote.id !== deleteNote);
        writeFile(notesArray, JSON.stringify(notes)).then(() => {
            res.send('Got a DELETE request at /user');
        })
            .catch((error) => {
                console.log(`Error writing file ${notesArray}`);
            });
    })
        .catch((error) => {
            console.log(`Error reading file ${notesArray}`);
        });
});


app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/notes", function (req, res) {
    res.sendFile(path.join(__dirname, "public/notes.html"));
});

app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

app.listen(PORT, function () {
    console.log("Listening to PORT: " + PORT);
});