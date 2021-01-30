import { GoogleSpreadsheet } from "google-spreadsheet";
import cred from "./creds.json";
import mongoose from "mongoose";

const connectDB = async () => {
  mongoose.connect("mongodb://127.0.0.1:27017/excel", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection;
  return db;
};

// Initialize the sheet - doc ID is the long id in the sheets URL
const doc = new GoogleSpreadsheet(
  "1YC9UW-hZ1ebrI_7USwpVARvg0H3qfygAU338qPh4VMI"
);

// Initialize Auth - see more available options at https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication

(async function () {
  await doc.useServiceAccountAuth({
    client_email: cred.client_email,
    private_key: cred.private_key,
  });

  await doc.loadInfo(); // loads document properties and worksheets

  const sheet = doc.sheetsByIndex[0]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
  const rows = await sheet.getRows();
  const db = await connectDB();
  // db.once("open", async function () {
  //   console.log("connected");
  const schema = {};
  for (let cell of sheet.headerValues) {
    schema[cell] = String;
  }
  console.log(sheet.headerValues);
  const dataSchema = new mongoose.Schema(schema);

  const Data = mongoose.model("datas", dataSchema);
  for (const r of rows) {
    const dataInput = {};
    for (let input of sheet.headerValues) {
      dataInput[input] = r[input];
    }
    const testData = new Data(dataInput);
    try {
      await testData.save();
    } catch (error) {
      console.log(error);
    }
  }
})();
