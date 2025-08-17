const router = require("express").Router;
const { createMemory, getAllMemories } = require("./memories.controller");

const memoriesRouter = router();
memoriesRouter.post("/", createMemory);
memoriesRouter.get("/", getAllMemories);

module.exports = { memoriesRouter };
