import express from "express";
import cors from "cors";
import userRoute from "./route/userRoute.js";
import promotionRoute from "./route/promotionalCodeRoute.js";
import voteRoute from "./route/voteRouter.js";
import nodeRoute from "./route/nodeRoute.js";
import VmRoute from "./route/vmRoute.js";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middleware/error.js";
import fileUpload from "express-fileupload";
import purchaseRoute from "./route/purchaseRoute.js";
import deleteRoute from "./route/deleteRoute.js";
import faqRoutes from "./route/addFaqRoute.js";
import tempDataRoute from "./route/tempdata.js";
import { fileURLToPath } from "url";
import PurchaseNode from "./models/purchaseNodeModel.js";
import path from "path";
import Node from "./models/nodeModel.js";
import crypto from "crypto";
import { Server } from "socket.io";
import scheduleJobs from "./utils/Cron.js";
const app = express();

//socket.io setup
const io = new Server(
  app.listen(3001, () => {
    console.log("socket.io server running on port 3001")
  }),

  {
    cors: {
      origin: "*",
    },
  }
);

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

// app.use(cors());
const allowedOrigins = [
  "http://localhost:3000",
  "https://www.noderr.xyz",
  "https://noderr.xyz",
  "https://api.noderr.xyz",
];

app.use(
  cors({
    credentials: true,
    origin: allowedOrigins,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
// app.use(fileUpload());

app.post("/ipn", async (req, res) => {
  // Extract the signature from the headers
  let ipnSecret = req.query.ipn_secret;
  ipnSecret = ipnSecret.substring(0, 1) + "+" + ipnSecret.substring(1);
  const signature = ipnSecret.replace(/\s/g, "");
  const body = JSON.stringify(req.body);
  const hash = process.env.IPN_SECRET;
  // Verify the signature
  if (hash !== signature) {
    console.log("IPN signature verification failed");
    return res.sendStatus(400);
  }
  const purchaseId = req.query.nodeId;
  const findNode = await Node.findOne({ _id: purchaseId });

  if (!findNode) {
    console.log("No purchase found");
    return res.sendStatus(404);
  }

  if (findNode) {
    const purchaseNode = [
      {
        node: req.query.nodeId,
        durationMonths: req.query.durationMonths,
        purchaseDate: new Date(),
        price:
          parseInt(findNode.nodePrice) * parseInt(req.query.durationMonths),
      },
    ];
    const userPurchase = PurchaseNode.create({
      user: req.query.userId,
      purchaseNodes: purchaseNode,
    });
    // Emit a socket event when a node is purchased
    io.emit("nodePurchased", {
      userId: req.query.userId,
      purchase: purchaseNode,
    });
    console.log('Socket event "nodePurchased" emitted');
  }
  res.sendStatus(200);
});

// Simple route to verify server is running
app.get("/", (req, res) => {
  res.send("Noderr Api Server is Online");
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/public", express.static("public"));
// Adding console logs for route usage
app.use((req, res, next) => {
  console.log(`Received request on path: ${req.path}`);
  next();
});

app.use(
  "/user",
  (req, res, next) => {
    console.log("Accessing /user route");
    next();
  },
  userRoute
);

app.use(
  "/promotion",
  (req, res, next) => {
    console.log("Accessing /promotion route");
    next();
  },
  promotionRoute
);
app.use(
  "/tempData",
  (req, res, next) => {
    console.log("Accessing /temp route");
    next();
  },
  tempDataRoute
);

app.use(
  "/vote",
  (req, res, next) => {
    console.log("Accessing /vote route");
    next();
  },
  voteRoute
);

app.use(
  "/node",
  (req, res, next) => {
    console.log("Accessing /node route");
    next();
  },
  nodeRoute
);

app.use(
  "/purchase",
  (req, res, next) => {
    console.log("Accessing /purchase route");
    next();
  },
  purchaseRoute
);

app.use(
  "/delete",
  (req, res, next) => {
    console.log("Accessing /delete route");
    next();
  },
  deleteRoute
);

app.use(
  "/user-vm",
  (req, res, next) => {
    console.log("Accessing /vm route");
    next();
  },
  VmRoute
);

app.use("/faq", faqRoutes);

scheduleJobs();

app.use(errorMiddleware);

export default app;
