import type { NextApiRequest, NextApiResponse } from "next";
import firebase from "../../lib/firebase";
import {
  getFirestore,
  doc,
  addDoc,
  collection,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // if (req.method === "POST") {
  const db = getFirestore(firebase);
  const studentsRef = collection(db, "students-name");
  const q = query(studentsRef, orderBy("id"));
  const querySnapshot = await getDocs(q);

  res.status(200).json(querySnapshot.docs.map((doc) => doc.data()));
  // } else {
  //   res.status(405).end("Method not allowed");
  // }
}
