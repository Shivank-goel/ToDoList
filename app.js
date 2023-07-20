//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-shivank:Test123@cluster0.3mststn.mongodb.net/todolistdb?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Create the item schema
const itemSchema = new mongoose.Schema({
  name: String
});

// Create the Item model based on the itemSchema
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

// Create the list schema
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

// Create the List model based on the listSchema
const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({})
    .then(function (founditems) {
      if (founditems.length === 0) {
        // Insert defaultItems if no items found
        return Item.insertMany(defaultItems);
      } else {
        return founditems;
      }
    })
    .then(function (foundItems) {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    })
    .catch(function (error) {
      console.log(error);
    });
});

app.get("/:customListName", function (req, res) {
  const customListName = req.params.customListName;
  List.findOne({ name: customListName })
    .then(function (foundList) {
      if (!foundList) {
        // Create a new list with defaultItems if it doesn't exist
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        return list.save();
      } else {
        return foundList;
      }
    })
    .then(function (foundList) {
      res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
    })
    .catch(function (error) {
      console.log(error);
    });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;

  const item = new Item({
    name: itemName
  });

  item.save()
    .then(function () {
      res.redirect("/");
    })
    .catch(function (error) {
      console.log(error);
    });
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  Item.findByIdAndRemove(checkedItemId)
    .then(function () {
      console.log("Successfully Removed");
      res.redirect("/");
    })
    .catch(function (error) {
      console.log(error);
    });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000");
});
