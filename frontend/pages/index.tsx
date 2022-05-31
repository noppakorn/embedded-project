import {
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDoc,
  getFirestore,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import firebase from "../lib/firebase";

const Index = () => {
  const [classroomCapacity, setClassroomCapacity] = useState("");
  const [students, setStudents] = useState<DocumentData[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<DocumentData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [time, setTime] = useState(Date.now());

  useEffect(() => {
    setFilteredStudents(
      students.filter((a) =>
        (a.data().first_name + " " + a.data().last_name)
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    );
  }, [students, searchQuery]);

  useEffect(() => {
    const db = getFirestore(firebase);
    const roomRef = collection(db, "room");
    const unsubscribe = onSnapshot(roomRef, (query) => {
      let arr: DocumentData[] = [];
      query.forEach((a) => {
        arr.push(a);
      });
      setStudents(arr);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date.now());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const db = getFirestore(firebase);
    const defaultRoom = doc(db, "room-detail", "default-room");
    return onSnapshot(defaultRoom, (defaultRoom) => {
      if (defaultRoom.exists()) {
        setClassroomCapacity(defaultRoom.data().capacity);
      }
    });
  }, []);

  return (
    <div
      className="font-sans flex flex-col justify-center w-full h-full p-16 space-y-4 min-h-screen
          dark:text-[#FAFAFA] dark:bg-stone-900"
    >
      <div className="text-center text-3xl font-bold dark:text-[#f4a7bb]">
        Student Checked in to Classroom
      </div>
      <div
        className="flex flex-row border justify-center items-center text-center text-xl mt-5 p-5
      dark:border-none"
      >
        <span className="font-bold">Students in classroom :</span>&nbsp;
        <div>{students.length}/</div>
        <input
          className="form-control block px-3 py-1.5 w-16
                text-base font-normal shadow-lg text-center
                text-gray-700
                bg-white bg-clip-padding
                border border-solid border-gray-300
                rounded transition ease-in-out m-0
                dark:bg-black dark:border-none dark:shadow-lg dark:shadow-black/40
                dark:text-white"
          id="Classroom Capacity"
          placeholder={classroomCapacity}
          value={classroomCapacity}
          onChange={async (event) => {
            const db = getFirestore(firebase);
            await setDoc(doc(db, "room-detail", "default-room"), {
              capacity: event.target.value,
            });
          }}
        ></input>
      </div>
      <div className="flex justify-center">
        <div className="mb-3"></div>
        <input
          type="search"
          className="form-control block w-fit px-3 py-1.5
                text-base font-normal shadow-lg
                text-gray-700
                bg-white bg-clip-padding
                border border-solid border-gray-300
                rounded transition ease-in-out m-0
                dark:bg-black dark:border-none dark:shadow-lg dark:shadow-black/40
                dark:text-white"
          id="Search"
          placeholder="Search"
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
          }}
        ></input>
      </div>
      <div className="flex flex-col justify-center w-full">
        <div
          className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-10 justify-center items-center border p-5
        dark:border-none"
        >
          {filteredStudents.map((doc) => {
            let checkinTime = Math.floor(
              (time - new Date(doc.data().timestamp.seconds * 1000).getTime()) /
                1000 /
                60
            );
            let timeMessage = "";
            if (checkinTime <= 1) {
              timeMessage = "check in a minute ago";
            } else if (checkinTime > 1 && checkinTime < 60) {
              timeMessage = "check in " + checkinTime + " minutes ago";
            } else if (checkinTime >= 60 && checkinTime < 120) {
              timeMessage = "check in 1 hour ago";
            } else {
              timeMessage =
                "check in " + Math.floor(checkinTime / 60) + " hours ago";
            }
            return (
              <div
                key={doc.id}
                className="flex flex-col items-center justify-between text-center h-full break-words p-5 hover:bg-gray-100 duration-300 shadow-md rounded-md
                dark:border-t-4 dark:border-rose-500
                dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.6)]
                dark:bg-[#0c0c0c] dark:hover:bg-[#f4a7bb]/80"
              >
                <div className="text-xl font-500">
                  {doc.data().first_name} {doc.data().last_name}
                </div>
                <div className="text-gray-500">{timeMessage}</div>
                <button
                  className="border mt-2 p-2 hover:bg-red-300 font-bold hover:underline active:bg-red-400 duration-500 
                  dark:bg-[#f4a7bb] dark:border-none rounded-md dark:shadow-lg dark:shadow-[#f4a7bb]/50 dark:hover:bg-[#f8567b]"
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
