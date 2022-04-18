import type { NextApiRequest, NextApiResponse } from "next";
import firebase from "../../lib/firebase";
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  getDoc,
} from "firebase/firestore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const db = getFirestore(firebase);
  if (req.method === "GET") {
    if (typeof req.query.student_id === "string") {
      const studentRef = doc(db, "students-name", req.query.student_id);
      const querySnapshot = await getDoc(studentRef);
      if (querySnapshot.exists()) {
        res.status(200).json(querySnapshot.data());
      } else {
        res.status(404).end("Not found");
      }
    } else {
      res.status(500).end();
    }
  } else if (req.method === "POST") {
    const studentsRef = collection(db, "students-name");
    await setDoc(doc(studentsRef, req.body.student_id), {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
    }).then(() => {
      res.status(200).end();
    });
  } else {
    res.status(405).end("Method not allowed");
  }
}
