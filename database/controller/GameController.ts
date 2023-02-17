import { Request, Response } from "express";
import Game from "../model/Game";
import axios from 'axios';

class GameController {
    static async getData(id: any) {
        const data = {};

        const reqB = await axios.get(`https://nextjs-cors-anywhere.vercel.app/api?endpoint=${process.env.STEAM_API}/?appids=${id}&cc=BR`);
        data["br"] = reqB.data[id.toString()];
        const reqT = await axios.get(`https://nextjs-cors-anywhere.vercel.app/api?endpoint=${process.env.STEAM_API}/?appids=${id}&cc=TR`);
        data["tr"] = reqT.data[id.toString()];

        return data;
    }

    async getPrices(req: Request, res: Response) {
        try {
            var id = req.params.id;

            if (!parseInt(id)) {
                return res.json({
                    "success": false,
                    "data": {}
                });
            }
            else {
                const data = await GameController.getData(id);

                if (data["br"].data.is_free) {
                    return res.json(
                        {
                            "success": true,
                            "data": {
                                "nome": data["br"].data.name,
                                "img": data["br"].data.header_image,
                                "screenshots": data["br"].data.screenshots,
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
                        "screenshots": br.screenshots,
                        "preco_brl": preco_brl.toFixed(2),
                        "preco_tl": preco_tl.toFixed(2)
                    }
                });
            }
        } catch (error) {
            return res.json({
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
    };

    async getRandom(req: Request, res: Response) {
        try {
            const reqR = await axios.get(`${process.env.STEAM_APPLIST_API}`);
            const dataR = await reqR.data;

            const apps = dataR.applist.apps;
            var rand = Math.floor(Math.random() * (apps.length - 0) + 0);

            var reqL = await axios.get(`${process.env.STBEAM_API}/games/${apps[rand].appid}`);
            var dataL = await reqL.data;
            
            while(reqL.data.success == false) {
                rand = Math.floor(Math.random() * (apps.length - 0) + 0);
                reqL = await axios.get(`${process.env.STBEAM_API}/games/${apps[rand].appid}`);
                dataL = await reqL.data;
            }

            return res.json(apps[rand].appid);
        } catch (error) {
            return res.status(500).json({
                error: "API Error",
                message: error
            })
        }
    }
}

export default new GameController;