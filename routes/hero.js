const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/CatchAsync");
const checkAuthMiddleware = require("../middleware/checkAuthMiddleware");
const ExpressError = require("../utils/Errors");

router.get(
  "/:id",
  checkAuthMiddleware,
  catchAsync(async (req, res, next) => {
    const { params, Hero } = req;
    try {
      const hero = await Hero.findOne({ _id: params.id }).populate({
        path: "relationships",
        populate: {
          path: "hero",
          model: Hero,
          select: "name role",
        },
      });
      console.log(hero);
      res.send(hero);
    } catch (e) {
      next(new ExpressError(e.message));
    }
  })
);

router.put(
  "/:id",
  checkAuthMiddleware,
  catchAsync(async (req, res, next) => {
    const { params, Hero, body } = req;
    if (!params.id) throw new ExpressError("no id found", 400);
    try {
      //update hero basic info
      if (body.hero.basicInfo) {
        const updatedHero = await Hero.findOneAndUpdate(
          { _id: params.id },
          body.hero.basicInfo,
          {
            new: true,
          }
        );
        console.log(updatedHero);
      } else if (body.hero.relationships) {
        //update hero relationships
        const relationships = body.hero.relationships;
        relationships.map(async (relationship) => {
          //update the relationship inside this hero
          await Hero.findOneAndUpdate(
            {
              _id: params.id,
              "relationships.hero": relationship.hero._id,
            },
            {
              $set: {
                "relationships.$.combo": relationship.combo,
                "relationships.$.score": relationship.score,
                "relationships.$.special": relationship.special,
                "relationships.$.counterComment": relationship.counterComment,
                "relationships.$.comboComment": relationship.comboComment,
              },
            }
          );
          //update the corresponding hero's relationship to this hero
          const foundCorrespondingHero = await Hero.findOneAndUpdate(
            {
              _id: relationship.hero._id,
              "relationships.hero": params.id,
            },
            {
              $set: {
                "relationships.$.score": -relationship.score,
                "relationships.$.combo": relationship.combo,
                "relationships.$.special": relationship.special,
                "relationships.$.counterComment": relationship.counterComment,
                "relationships.$.comboComment": relationship.comboComment,
              },
            }
          );
        });
      }
      res.sendStatus(200);
    } catch (e) {
      next(e);
    }
  })
);

router.delete(
  "/:id",
  checkAuthMiddleware,
  catchAsync(async (req, res, next) => {
    const { params, Hero } = req;
    if (!params.id) throw new ExpressError("no id found", 400);
    try {
      await Hero.findOneAndDelete({ _id: params.id });
      //delete this hero inside other heroes' relationships
      await Hero.updateMany(
        {},
        { $pull: { relationships: { hero: params.id } } }
      );
      res.send("deleted");
    } catch (e) {
      next(e);
    }
  })
);

router.get(
  "/",
  checkAuthMiddleware,
  catchAsync(async (req, res) => {
    const allHeroes = await req.Hero.find({}, ["image", "role", "name"]);
    console.log("heros send");
    res.send(allHeroes);
  })
);

router.post(
  "/new-hero",
  checkAuthMiddleware,
  catchAsync(async (req, res) => {
    const { body, Hero } = req;
    if (!body.newHero) throw new ExpressError("Invalid Hero data", 400);
    const repeatedHero = await Hero.findOne({ name: body.newHero.name });
    if (repeatedHero) {
      throw new ExpressError("Hero Already Existed", 400);
    }
    try {
      //extract id from all documents into an array
      const allHeroesID = await Hero.find().select("_id");

      if (allHeroesID.length > 0) {
        //map ids into an array of relationship object
        const relationships = allHeroesID.map((id) => ({
          hero: id,
          combo: 0,
          score: 0,
          special: false,
          comboComment: "",
          counterComment: "",
        }));

        //add the relationships to the newHero body
        body.newHero.relationships = relationships;
      }

      //create new hero document in the database
      const newHero = await Hero.create(body.newHero);

      //create a new relationship of this hero
      const newRelationshiop = {
        hero: newHero._id,
        combo: 0,
        score: 0,
        special: false,
        comboComment: "",
        counterComment: "",
      };

      //update this new relationship to all the existing heroes but himself
      await Hero.updateMany(
        { _id: { $ne: newHero._id } },
        { $push: { relationships: newRelationshiop } }
      );

      res.send("Hero created successfully");
    } catch (e) {
      throw new ExpressError(e.message);
    }
  })
);

module.exports = router;
