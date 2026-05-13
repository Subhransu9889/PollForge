import { createServer } from "node:http";
import process = require("node:process");
import mongoose from "mongoose";
import { Server } from "socket.io";
import { allowedOrigins } from "./app/cors.js";
import { createExpressApp } from "./app/index.js";
import { setRealtimeServer } from "./app/polls/realtime.js";
import { connectDB } from "./db/config.js";

async function main(){
    try{
        await connectDB();
        const server = createServer(createExpressApp());
        const io = new Server(server, {
            cors: { origin: allowedOrigins(), credentials: true },
            connectionStateRecovery: {
                maxDisconnectionDuration: 2 * 60 * 1000,
                skipMiddlewares: true,
            },
            maxHttpBufferSize: 1e6,
            pingInterval: 25_000,
            pingTimeout: 20_000,
        });

        io.on("connection", (socket) => {
            socket.on("poll:join", (pollId: string) => {
                if (!mongoose.isValidObjectId(pollId)) {
                    socket.emit("poll:error", { message: "Invalid poll room" });
                    return;
                }

                socket.join(`poll:${pollId}`);
            });

            socket.on("poll:leave", (pollId: string) => {
                if (mongoose.isValidObjectId(pollId)) {
                    socket.leave(`poll:${pollId}`);
                }
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
