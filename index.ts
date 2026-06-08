import config from "./config/config";
import app from "./server";


const server = app.listen(config.port, "0.0.0.0", () => {
    void 0;
});


const onCloseSignal=()=>{
    console.log("Received shutdown signal, closing server...");
    server.close(()=>{
        console.log("Server closed gracefully.");
        process.exit(0);
    });
    setTimeout(()=>{
        console.log("Forcefully shutting down server.");
        process.exit(1);
    }, 5000).unref();
};
process.on("SIGINT",onCloseSignal);
process.on("SIGTERM",onCloseSignal);