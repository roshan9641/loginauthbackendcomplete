import express from "express";
import errorHandler from "./middlewares/error.middleware.js";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js"

const app = express();

app.use(express.json());

// routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin",adminRoutes);
// test routes
app.get("/", (req, res) => {
  res.send("route work");
});

app.get("/test", (req, res) => {
  res.send("POSTMAN TEST OK");
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: "route not found" });
});


app.use(errorHandler);

export default app;
