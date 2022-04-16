import {
  collection,
  deleteDoc,
  DocumentData,
  getFirestore,
  onSnapshot,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import firebase from "../lib/firebase";

const Index = () => {
  const [students, setStudents] = useState<DocumentData[]>([]);
  useEffect(() => {
    const db = getFirestore(firebase);
    const studentsRef = collection(db, "students-name");
    const unsubscribe = onSnapshot(studentsRef, (query) => {
      let arr: DocumentData[] = [];
      query.forEach((a) => {
        arr.push(a);
      });
      setStudents(arr);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="font-sans flex flex-col justify-center w-full p-16">
      <div className="text-center text-3xl font-bold">Classroom Capacity</div>
      <div className="flex flex-col justify-center w-full">
        <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-10 justify-center items-center">
          {students.map((doc) => {
            return (
              <div
                key={doc.data().first_name}
                className="flex flex-col items-center justify-between text-center border border-red-300 h-full break-all p-5"
              >
                <div>{doc.data().first_name} {doc.data().last_name}</div>
                <button
                  className="border"
                  onClick={async () => {
                    await deleteDoc(doc.ref);
                  }}
                >
                  Check out
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Index;
