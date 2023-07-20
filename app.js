//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1/todolistdb");

const itemSchema = ({
  name:String

});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name:"Welcome to your todolist!"
})

const item2 = new Item({
  name:"Hit the + button to add a mew item."
})

const item3 = new Item({
  name:"<-- Hit this to delete an item."
})

const defaultItems = [item1, item2 , item3];
const listSchema = ({
  name: String,
  items:[itemSchema]
})

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}
  ).then( function(founditems){
    if (founditems.length == 0) {

      Item.insertMany(defaultItems
      ).then(function(){
        console.log("Sucessfully Done")
      }).catch(function(error){
        console.log(error);
      });
      res.redirect("/");
    }else{
          res.render("list", {listTitle: "Today", newListItems: founditems});
    }
  }).catch(function(error){
    console.log(error);
  });
});

app.get("/:customListName", function(req,res){
  const customListName = req.params.customListName;
  List.findOne({name:customListName}
  ).then(function(foundList){
    if(!foundList){
      const list = new List ({
        name: customListName,
        items: defaultItems
      });
      list.save()
      res.redirect("/"+customListName);
    }else{
      res.render("list", {listTitle: foundList.name, newListItems:foundList.items})
     }
  });

});


app.post("/", function(req, res){

  const itemName = req.body.newItem;

  const item = new Item({
    name: itemName
  });
  item.save()
  res.redirect("/")
});

app.post("/delete",function(req, res){
  const checkedItemId = req.body.checkbox;
  Item.findByIdAndRemove(checkedItemId
  ).then(function(){
      console.log("Sucessfully Removed");
      res.redirect("/")
    })
  })



app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
