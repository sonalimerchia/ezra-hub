import "reflect-metadata";
import admin from "firebase-admin";
import credential from "./config/firebase";
import path from "path";
import fs from "fs";
import express from "express";
const sendMessage = require("./ibis/api-messaging.js").sendMessage;

const main = async () => {
  const file = fs.readFileSync(path.join(__dirname, "./config/user.json"), {
    encoding: "utf8",
  });
  const userConstants = JSON.parse(file);

  const firebaseApp = admin.initializeApp({ credential });
  console.log("connected to firebase app", firebaseApp.name);
  const userRef = firebaseApp
    .firestore()
    .collection("users")
    .doc(userConstants.id);

  const startJob = async (job: any) => {
    let numSent = 0;
    for (const contact of job.contacts) {
      const content = job.message.replace(/\{\{name\}\}/g, contact.name);
      console.log("wanna send {", content, "} to ", contact);
      try {
        await sendMessage(`+1${contact.phoneNumber}`, content);
        numSent++;
      } catch (error) {
        console.log(error);
      }
    }

    const userDoc = await userRef.collection("profile").doc("userData");
    const initialUser = (await userDoc.get()).data();
    if (initialUser) {
      userDoc.update({
        lifetimeJobs: (initialUser.lifetimeJobs || 0) + numSent,
      });
    } else {
      userDoc.set({ lifetimeJobs: numSent });
    }
  };

  const query = userRef.collection("jobs").orderBy("startTime", "asc");
  query.onSnapshot((snap) => {
    snap.docs.forEach(async (doc) => {
      const data = doc.data();
      if (data.startTime < Date.now() && !data.complete) {
        await startJob(data);
        await userRef.collection("jobs").doc(doc.id).update({ complete: true });
      }
    });
  });

  const app = express();
  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  app.listen(5622, () => {
    console.log("app listening on port 5622");
  });
};

main().catch((err) => {
  console.error(err);
});
