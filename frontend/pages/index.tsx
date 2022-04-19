import {
  arrayUnion,
  collection,
  deleteDoc,
  DocumentData,
  getFirestore,
  onSnapshot,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import firebase from "../lib/firebase";

const Index = () => {
  const classroomCapacity = 50;
  const [students, setStudents] = useState<DocumentData[]>([]);
  const [wordEntered, setWordEntered] = useState("");
  const [filteredData, setFilterData] = useState<DocumentData[]>([]);
  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const db = getFirestore(firebase);
    const studentsRef = collection(db, "students-name");
    const searchWord = event.target.value;
    setWordEntered(searchWord);
    const newFilter = onSnapshot(studentsRef, (query) => {
      let arr: DocumentData[] = [];
      query.forEach((a) => {
        if (
          a.data().first_name.toLowerCase().includes(searchWord.toLowerCase())
        ) {
          arr.push(a);
        }
      });
      setFilterData(arr);
    });
  };
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
    <div className="font-sans flex flex-col justify-center w-full p-16 space-y-4">
      <div className="text-center text-3xl font-bold">
        Student Checked in to Classroom #1
      </div>
      <div className="flex flex-row border justify-center items-center text-center text-xl mt-5 p-5">
        <span className="font-bold">Students in classroom :</span>&nbsp;
        <span>
          {students.length}/{classroomCapacity}
        </span>
      </div>
      <div className="flex justify-center">
        <div className="mb-3"></div>
        <input
          type="search"
          className="form-control block w-fit px-3 py-1.5 
                text-base font-normal
                text-gray-700
                bg-white bg-clip-padding
                border border-solid border-gray-300
                rounded transition ease-in-out m-0"
          id="Search"
          placeholder="Search"
          value={wordEntered}
          onChange={handleInput}
        ></input>
      </div>
      <div className="flex flex-col justify-center w-full">
        <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-10 justify-center items-center border p-5">
          {filteredData.map((doc) => {
            return (
              <div
                key={doc.data().first_name}
                className="flex flex-col items-center justify-between text-center border h-full break-words p-5 hover:bg-gray-100 duration-300"
              >
                <div className="text-xl font-bold">
                  {doc.data().first_name} {doc.data().last_name}
                </div>
                <button
                  className="border mt-2 p-2 hover:bg-red-300 hover:underline active:bg-red-400 duration-500 "
                  onClick={async () => {
                    await deleteDoc(doc.ref);
                  }}
                >
                  Check Out
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
