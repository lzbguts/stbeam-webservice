import { Router } from "express";
import GameController from "./database/controller/GameController";

const routes = Router();

routes.get("/games/:id", GameController.getPrices);
routes.get("/top/:number", GameController.getTop);
routes.get("/random", GameController.getRandom);

export default routes;