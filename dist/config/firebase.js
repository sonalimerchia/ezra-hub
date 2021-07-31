"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = __importDefault(require("firebase-admin"));
require("dotenv").config();
const credential = {
    type: "service_account",
    project_id: "ezramessaging",
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY,
    client_email: "firebase-adminsdk-g3csd@ezramessaging.iam.gserviceaccount.com",
    client_id: "111772538379128448750",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-g3csd%40ezramessaging.iam.gserviceaccount.com",
};
exports.default = firebase_admin_1.default.credential.cert(credential);
//# sourceMappingURL=firebase.js.map