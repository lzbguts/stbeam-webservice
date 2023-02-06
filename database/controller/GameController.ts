import { Request, Response } from "express";
import Game from "../model/Game";

class GameController {
    async getPrices(req: Request, res: Response) {
        try {
            var id = req.params.id;

            var obj = {
                "success": false,
                "data": {}
            }

            if (!parseInt(id)) {
                return res.json(obj);
            }
            else {

                const countries = ["br", "tr"];

                const data = {};

                for (var c in countries) {
                    await fetch(`${process.env.STEAM_API}/?appids=${id}&cc=${countries[c]}`).then(async dataX => {
                        data[countries[c]] = await dataX.json();
                    })

                    data[countries[c]] = data[countries[c]][id.toString()];
                }

                if (data["br"].data.is_free) {
                    return res.json(
                        {
                            "success": true,
                            "data": {
                                "nome": data["br"].data.name,
                                "img": data["br"].data.header_image,
                                "is_free": true
                            }
                        }
                    );
                }

                const
                    br = data["br"].data,
                    tr = data["tr"].data,
                    preco_brl = br.price_overview.final / 100,
                    preco_tl = tr.price_overview.final / 100;

                const gameExists = await Game.findById(id);

                if (gameExists) {
                    gameExists.views = gameExists.views + 1;
                    await gameExists.save();
                }
                else {
                    Game.create({
                        _id: id,
                        name: br.name
                    });
                }

                return res.json({
                    "success": true,
                    "data": {
                        "nome": br.name,
                        "img": br.header_image,
                        "preco_brl": preco_brl.toFixed(2),
                        "preco_tl": preco_tl.toFixed(2)
                    }
                });
            }
        } catch (error) {
            return res.status(500).json({
                "success": false,
                "data": {}
            })
        }
    };

    async getTop(req: Request, res: Response) {
        try {
            const number = parseInt(req.params.number);

            if (!number) {
                return res.status(400).json({
                    header: "Error",
                    error: "Parameter is not a number."
                });
            }
            else if (number < 1 || number > 20) {
                return res.status(400).json({
                    header: "Error",
                    error: "Number lesser than 1 or greater than 20."
                });
            }

            const topX = await Game.find().limit(number).sort({ views: "desc" });

            return res.json(topX);
        } catch (error) {
            return res.status(500).json({
                error: "API Error",
                message: error
            })
        }
    }
}

export default new GameController;