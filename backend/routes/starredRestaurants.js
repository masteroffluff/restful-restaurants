const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const ALL_RESTAURANTS = require("./restaurants").restaurants;

/**
 * A list of starred restaurants.
 * In a "real" application, this data would be maintained in a database.
 */
let STARRED_RESTAURANTS = [
  {
    id: "a7272cd9-26fb-44b5-8d53-9781f55175a1",
    restaurantId: "869c848c-7a58-4ed6-ab88-72ee2e8e677c",
    comment: "Best pho in NYC",
  },
  {
    id: "8df59b21-2152-4f9b-9200-95c19aa88226",
    restaurantId: "e8036613-4b72-46f6-ab5e-edd2fc7c4fe4",
    comment: "Their lunch special is the best!",
  },
];

/**
 * Feature 6: Getting the list of all starred restaurants.
 */
router.get("/", (req, res) => {
  // moved the joinedStarredRestaurants to below
  const joinedStarredRestaurants = getJoinedStarredRestaurants_all();

  res.json(joinedStarredRestaurants);
});

/**
 * Feature 7: Getting a specific starred restaurant.
 */
router.get("/:id",(req,res) => {
  try{
    const {id} = req.params;
    const foundRestaurant =  getJoinedStarredRestaurants_byId(id)
    return res.status(200).send(foundRestaurant);
  }catch(err){
    return res.status(err.status||500).send(err);
  };
});


/**
 * Feature 8: Adding to your list of starred restaurants.
 */
router.post("/",(req,res) =>{
  const {id} = req.body
  console.log(id)
  try{
    if(STARRED_RESTAURANTS.some((starredRestaurant)=>starredRestaurant.restaurantId === id)){
      return res.status(400).send({message:`Adding a starred restaurant failed.\nRestaurant ${id} is already starred.`}) 
    }else{
      const restaurant = ALL_RESTAURANTS.find(
        (restaurant) => restaurant.id === id
      );
      if (restaurant){
        const newId = uuidv4();
        const newStarredRestaurant={
          'id': newId,
          restaurantId: id,
          comment: "",
        }
        STARRED_RESTAURANTS.push(newStarredRestaurant);
        const result = getJoinedStarredRestaurants_byId(newId)
        res.status(200).send(result);
      }else{
        return res.status(404).send({message:`Adding a starred restaurant failed.\nRestaurant ${id} not found in list of all restaurants.`})      
      }
    }
 
  }catch(err){
    return res.status(err.status||500).sendStatus(err)
  }
})


/**
 * Feature 9: Deleting from your list of starred restaurants.
 */
router.delete("/:id",(req,res) => {
  
  try{
    const {id} = req.params;
    console.log(id)
    const foundRestaurant = STARRED_RESTAURANTS.find(
        (starredRestaurant)=>starredRestaurant.id === id
      );
    if (foundRestaurant){
      STARRED_RESTAURANTS = STARRED_RESTAURANTS.filter((restaurant) => restaurant.id !== id)
      return res.status(200).send()
    }else{
      return res.status(404).send({message:`Deleteing a specific starred restaurant failed.\nStarred restaurant ${id} not found.`});
    };
  }
  catch(err){
    return res.status(500).send(err);
  };
});

/**
 * Feature 10: Updating your comment of a starred restaurant.
 */
router.put("/:id",(req,res) => {
  try{
    const {id} = req.params;
    
    const foundRestaurant =  STARRED_RESTAURANTS.find((starredRestaurant)=>starredRestaurant.id === id);
    if (foundRestaurant){
      const {newComment} = req.body;
      foundRestaurant.comment = newComment;
      return res.status(200).send()
    }else{
      return res.status(404).send({message:`Updating a specific starred restaurant failed.\n Starred restaurant ${id} not found.`});
    };
  }
  catch(err){
    return res.status(500).send(err);
  };
});



// helper functions
function getJoinedStarredRestaurants_all(){
  /**
 * We need to join our starred data with the all restaurants data to get the names.
 * Normally this join would happen in the database.
 * as per DRY i've moved this to a function 
 */
return STARRED_RESTAURANTS.map(
  (starredRestaurant) => {
    const restaurant = ALL_RESTAURANTS.find(
      (restaurant) => restaurant.id === starredRestaurant.restaurantId
    );

    return {
      id: starredRestaurant.id,
      comment: starredRestaurant.comment,
      name: restaurant.name,
    };
  }
);
}
function getJoinedStarredRestaurants_byId(id){
  const joinedStarredRestaurants = getJoinedStarredRestaurants_all();
  const foundRestaurant =  joinedStarredRestaurants.find((starredRestaurant)=>starredRestaurant.id === id);
  if (foundRestaurant){
    return foundRestaurant;
  }else{
    const err = new Error({message:`Getting a specific starred restaurant failed.\nStarred restaurant ${id} not found.`})
    err.status = 404
    throw(err)
  };
}
module.exports = router;