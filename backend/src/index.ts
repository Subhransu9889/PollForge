import { createServer } from "node:http";
import process = require("node:process");
import { createExpressApp } from "./app/index.js";

async function main(){
    try{
        const server = createServer(createExpressApp());
        const PORT = process.env.PORT || 4000;
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        })
    } catch (error) {
        console.error("Error starting server:", error);
        process.exit(1);
    }

}

main();