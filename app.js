const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");

const port=3000

const app=express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));   //to render css using express

let items=["Wake Up","Exercise","Breakfast"];
let workItems=[];
let fun=[];

mongoose.connect("mongodb+srv://admin-mriganka:Test123@cluster0.exdyyfh.mongodb.net/todoListDB",{useNewUrlParser:true});

const itemsSchema={
    name:String
};
const Item=mongoose.model('Item',itemsSchema);

const item1=new Item({name:"Welcome to To-Do List!"});
const item2=new Item({name:"Click + to Add a new Item"});
const item3=new Item({name:"<-- Hit this to delete the item."});

const defaultItems=[item1,item2,item3];
const listSchema={name:String,items:[itemsSchema]};

const List=mongoose.model("List",listSchema);
let day;
app.get("/",(req,res)=>{
    let options={
        weekday:'long',
        day:'numeric',
        month:'long'
    };
    let today=new Date();
    day=today.toLocaleDateString("en-US",options);  //current-date
    Item.find({},(err,foundItems)=>{
        if(foundItems.length===0)  //if no item exists
        {
            Item.insertMany(defaultItems,(err)=>
             {
                if(err)
                console.log(err);
                else
                console.log("Saved successfully all the default items to Database!");
                res.redirect("/");
        });
        }
        res.render('list',{listTitle:day,newAdd:foundItems}); //else
    }); 
});
app.get("/:customListName",(req,res)=>{   //custom-route
    const customListName=_.capitalize(req.params.customListName);  //lodash
    List.findOne({name:customListName},(err,foundList)=>{
        if(!err){
            if(!foundList){
                //Create a New List
                const list=new List({
                    name:customListName,
                    items:defaultItems
                });
                list.save();
                res.redirect("/"+customListName);
            }
            else{
                //Show an existing list
                res.render("list",{listTitle:foundList.name,newAdd:foundList.items});
            }
        }
    })
    
})
app.post("/",(req,res)=>{
    let itemName=req.body.newItem;  //searches for newItem
    let listName=req.body.list;
    const item=new Item({name:itemName});

    if(listName===day){
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name:listName},(err,foundList)=>{
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
    });
}
});
app.post("/delete",(req,res)=>{
    const checkedItemId=req.body.checkbox;
    const listName=req.body.listName;
    if(listName===day){
        Item.findByIdAndRemove(checkedItemId,(err)=>{
            if(err)
            console.log(err);
            else{
            console.log("Item deleted successfully!");
            res.redirect("/");
        }
        });
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},(err,foundList)=>{
            if(!err)
            res.redirect("/"+listName);
        });
    }
});


app.get("/fun",(req,res)=>{
    res.render('list',{listTitle:"Entertainment", newAdd:fun});
});

app.listen(port,()=>{
    console.log(`Server listening on port ${port}`)
})