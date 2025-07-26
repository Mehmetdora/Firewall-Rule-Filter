// routes/rule.js
import express from "express";
import {
  editedRule,
  getRules,
  deleteRule,
  createdRule,

} from "../controllers/ruleController.js";

const router = express.Router();

router.get("/", getRules);
router.post("/edited", editedRule);
router.post("/deleted", deleteRule);
router.post("/created", createdRule);

export default router;
