import type { NextApiRequest, NextApiResponse } from "next";
import firebase from "../../lib/firebase";
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  getDoc,
  deleteDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const db = getFirestore(firebase);
  if (req.method === "GET") {
    if (typeof req.query.card_id === "string") {
      const studentRef = doc(db, "students-name", req.query.card_id);
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
    const studentRef = doc(db, "students-name", req.body.card_id);
    const querySnapshot = await getDoc(studentRef);
    if (querySnapshot.exists()) {
      const studentInRoomRef = doc(db, "room", req.body.card_id);
      const studentInRoomSnapshot = await getDoc(studentInRoomRef);
      if (studentInRoomSnapshot.exists()) {
        // Student already in room => check out
        await deleteDoc(studentInRoomRef).then(() => {
          res.status(200).json({
            status: "checked_out",
            ...querySnapshot.data(),
          });
        });
      } else {
        // Student not in room => check in
        const roomRef = collection(db, "room");
        const roomDetailRef = (await getDoc(doc(db, "room-detail", "default-room"))).data();
        const roomCapacity = (roomDetailRef !== undefined) ? roomDetailRef.capacity : 0;
        const countStudentInRoom = (await getDocs(roomRef)).size;
        if (countStudentInRoom < roomCapacity) {
          await setDoc(doc(roomRef, req.body.card_id), {
            timestamp: serverTimestamp(),
            ...querySnapshot.data()
          }).then(
            () => {
              res.status(200).json({
                status: "checked_in",
                ...querySnapshot.data(),
              });
            }
          );
        } else {
          res.status(405).json({
            status: "room_full",
          });
        }
      }
    } else {
      res.status(404).end("Student does not exists");
    }
  } else {
    res.status(405).end("Method not allowed");
  }
}
