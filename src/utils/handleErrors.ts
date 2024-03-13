import {Response} from "express";

const handleErrors = (error: any, res: Response, source: string) => {
	console.error(`Error from ${source} function: `, error);
	res.status(500).send({message: `Internal Server Error | Execution of ${source} function`});
};

export default handleErrors;