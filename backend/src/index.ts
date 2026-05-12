import { createServer } from "node:http";
import process = require("node:process");
import { Server } from "socket.io";
import { createExpressApp } from "./app/index.js";
import { setRealtimeServer } from "./app/polls/realtime.js";
import { connectDB } from "./db/config.js";

async function main(){
    try{
        await connectDB();
        const server = createServer(createExpressApp());
        const io = new Server(server, {
            cors: { origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173" },
        });

        io.on("connection", (socket) => {
            socket.on("poll:join", (pollId: string) => {
                socket.join(`poll:${pollId}`);
            });
        });

        setRealtimeServer(io);
        const PORT = Number.parseInt(process.env.PORT ?? "4000", 10) || 4000;
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        })
    } catch (error) {
        console.error("Error starting server:", error);
        process.exit(1);
    }

}

main();
