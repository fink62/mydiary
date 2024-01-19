import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(morgan("tiny"));

var diary = [];
var currentPointer = 0;

//initiate array with sample entries for last 5 days
function initiateDiary(){
  var date = new Date();
  var dateString = "JJJJ-MM-DD";
  date.setDate(date.getDate() - 5);

  for (let i = 0; i < 5; i++ ) {
    dateString = date.getFullYear().toString() + '-' + (date.getMonth() + 1).toString().padStart(2, 0) + '-' + date.getDate().toString().padStart(2, 0);
    diary[i] = {
      entryDate : dateString,
      entryTagline : "Entry " + i + " Tagline",
      entryContent : "This is the content for Entry " + i + "."
      };
    date.setDate(date.getDate() + 1);
  }
}

// Send processed entry list and content to index.ejs
function renderIndex(res, pointer){
  const p = pointer;
  const r = res;
  var entryDates = [];

  for (let i = 0; i < diary.length; i++) {
    entryDates[i] = diary[i].entryDate;
  }

  const data = {
    date : diary[p].entryDate,
    tagline : diary[p].entryTagline,
    content : diary[p].entryContent,
    datesList : entryDates
  }

  r.render("index", data);
}

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

initiateDiary();

// default GET request
app.get("/", (req, res) => {
  const p = currentPointer;

  renderIndex(res, p);
});

// Re-Init array
app.post("/init", (req, res) => {
  initiateDiary();
  currentPointer = diary.length - 1;

  res.redirect("/");
});

// Open new entry page from button
app.post("/newEntry", (req, res) => {
    res.render("newEntry");
});
  
// create new entry submitted
app.post("/submitNewEntry", (req, res) => {
  const today = new Date();
  const p = diary.length;
  const dateString = today.getFullYear().toString() + '-' + (today.getMonth() + 1).toString().padStart(2, 0) + '-' + today.getDate().toString().padStart(2, 0);
  
  diary[p] = {
    entryDate : dateString,
    entryTagline : req.body.entryTagline,
    entryContent : req.body.entryContent
  };

  currentPointer = p;

  res.redirect("/");
});

// select entry from list (clicked a button on right hand side list)
app.post("/selectEntry", (req, res) => {
  var p = 0;
  for (p = 0; p < diary.length; p++) {
    currentPointer = p;
    if (diary[p].entryDate === req.body.date){
      break;
    }
  }
  res.redirect("/");
});

// Edit entry page route
app.post("/editEntry", (req, res) => {
  const p = currentPointer;
  const data = {
    tagline : diary[p].entryTagline,
    content : diary[p].entryContent
  }

  res.render("editEntry", data);
});

// updated entry submitted from editEntry page
app.post("/updateEntry", (req, res) => {
  const p = currentPointer;

  diary[p].entryTagline = req.body.entryTagline;
  diary[p].entryContent = req.body.entryContent;

  res.redirect("/");
});

// Delete entry page route
app.post("/deleteEntry", (req, res) => {
  var p = currentPointer;

  diary.splice(p, 1);
  p = diary.length - 1;

  if (p === -1){
    const today = new Date();
    const dateString = today.getFullYear().toString() + '-' + (today.getMonth() + 1).toString().padStart(2, 0) + '-' + today.getDate().toString().padStart(2, 0);
    p = 0;
    diary[p] = {
      entryDate : dateString,
      entryTagline : "",
      entryContent : ""
    };
  }

  currentPointer = p;

  res.redirect("/");
});

app.listen(port, () => {
    console.log(`Tagebuch server listening on port ${port}`);
});