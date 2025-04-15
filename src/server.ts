import WebSocket, { WebSocketServer } from "ws";

const PORT = process.env.PORT || 3000;
const server = new WebSocketServer({ port: Number(PORT) });

interface SensorData {
    type: "sensorData";
    temperature: number;
    humidity: number;
}

interface FanControl {
    type: "fanControl";
    status: boolean;
}

interface LedControl {
    type: "ledControl";
    status: boolean;
}

type MessageData = SensorData | FanControl | LedControl;

server.on("connection", (socket: WebSocket) => {
    console.log("A new client connection");

    const initializeData = { temperature: 0, humidity: 0 };
    socket.send(JSON.stringify(initializeData));

    socket.on("message", (message: WebSocket.RawData) => {
        console.log("Received: ", message.toString());

        try {
            const parsedMessage: MessageData = JSON.parse(message.toString());

            switch (parsedMessage.type) {
                case "sensorData": {
                    const { temperature, humidity } = parsedMessage;
                    console.log("🚀 ~ temperature, humidity:", temperature, humidity);

                    const dataToSend = { temperature, humidity };
                    broadcast(dataToSend);
                    break;
                }

                case "fanControl": {
                    const { status } = parsedMessage;
                    console.log("🚀 ~ fanControl status:", status);
                    const fanStatus = { type: "fanControl", status };
                    broadcast(fanStatus);
                    break;
                }

                case "ledControl": {
                    const { status } = parsedMessage;
                    console.log("🚀 ~ ledControl status:", status);
                    const ledStatus = { type: "ledControl", status };
                    broadcast(ledStatus);
                    break;
                }

                default:
                    console.log("Unknown message type");
            }
        } catch (error) {
            console.error("🚀 ~ Error parsing message:", error);
        }
    });

    socket.on("close", () => {
        console.log("Client disconnected");
    });

    socket.on("error", (error) => {
        console.error("🚀 ~ Socket error:", error);
    });
});

function broadcast(data: object) {
    const json = JSON.stringify(data);
    server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(json);
        }
    });
}

console.log("Server listening on port " + PORT);