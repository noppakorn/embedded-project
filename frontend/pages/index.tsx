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
      <div className="text-center text-3xl font-bold">
        Student Checked in to Classroom #1
      </div>
      <div className="text-center text-3xl">
        student count: {students.length}{" "}
      </div>
      <div className="flex justify-center">
        <div className="mb-3"></div>
        <input
          type="search"
          className="form-control block w-full px-3 py-1.5 text-base font-normal
                text-gray-700
                bg-white bg-clip-padding
                border border-solid border-gray-300
                rounded
                transition
                ease-in-out
                m-0"
          id="exampleSearch"
          placeholder="Type query"
        ></input>
      </div>
      <div className="flex flex-col justify-center w-full">
        <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-10 justify-center items-center border p-5">
          {students.map((doc) => {
            return (
              <div
                key={doc.data().first_name}
                className="flex flex-col items-center justify-between text-center border h-full break-all p-5 hover:bg-gray-100"
              >
                <div className="text-xl font-bold">
                  {doc.data().first_name} {doc.data().last_name}
                </div>
                <button
                  className="border mt-2 p-1.5 hover:bg-red-200 hover:underline"
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
