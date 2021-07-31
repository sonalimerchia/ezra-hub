"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const firebase_1 = __importDefault(require("./config/firebase"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const express_1 = __importDefault(require("express"));
const node_cron_1 = __importDefault(require("node-cron"));
const sendMessage = require("./ibis/api-messaging.js").sendMessage;
const main = () => __awaiter(this, void 0, void 0, function* () {
    const file = fs_1.default.readFileSync(path_1.default.join(__dirname, "./config/user.json"), {
        encoding: "utf8",
    });
    const userConstants = JSON.parse(file);
    const firebaseApp = firebase_admin_1.default.initializeApp({ credential: firebase_1.default });
    console.log("connected to firebase app", firebaseApp.name);
    const userRef = firebaseApp
        .firestore()
        .collection("users")
        .doc(userConstants.id);
    const startJob = (job) => __awaiter(this, void 0, void 0, function* () {
        let numSent = 0;
        for (const contact of job.contacts) {
            const content = job.message.replace(/\{\{name\}\}/g, contact.name);
            console.log("wanna send {", content, "} to ", contact);
            try {
                yield sendMessage(contact.phoneNumber.length === 11
                    ? `+${contact.phoneNumber}`
                    : `+1${contact.phoneNumber}`, content);
                numSent++;
            }
            catch (error) {
                console.log(error);
            }
        }
        const userDoc = yield userRef.collection("profile").doc("userData");
        const initialUser = (yield userDoc.get()).data();
        if (initialUser) {
            userDoc.update({
                lifetimeJobs: (initialUser.lifetimeJobs || 0) + numSent,
            });
        }
        else {
            userDoc.set({ lifetimeJobs: numSent });
        }
    });
    const app = express_1.default();
    app.get("/", (req, res) => {
        res.send("Hello World!");
    });
    node_cron_1.default.schedule("* * * * *", () => {
        console.log("Hello");
    });
    app.listen(5622, () => {
        const query = userRef.collection("jobs").orderBy("startTime", "asc");
        query.onSnapshot((snap) => {
            snap.docs.forEach((doc) => __awaiter(this, void 0, void 0, function* () {
                const data = doc.data();
                if (data.startTime < Date.now() && !data.complete) {
                    yield startJob(data);
                    yield userRef
                        .collection("jobs")
                        .doc(doc.id)
                        .update({ complete: true });
                }
            }));
        });
    });
});
main().catch((err) => {
    console.error(err);
});
//# sourceMappingURL=index.js.map