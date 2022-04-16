import { useState } from "react";

const Index = () => {
  let [students, setStudents] = useState<string[]>([
    "Student 1",
    "Student 2",
    "Student 3",
    "Student 4",
    "Student 5",
    "Student 6",
    "Student 7",
    "Student 8",
    "Student 9",
  ]);
  return (
    <div className="font-sans flex flex-col justify-center w-full p-16">
      <div className="text-center text-3xl font-bold">Classroom Capacity</div>
      <div className="flex flex-col justify-center w-full">
        <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-10 justify-center items-center">
          {students.map((name, idx) => {
            return (
              <div key={name} className="items-center justify-center text-center border border-red-300">
                <div>{name}</div>
                <button
                  className="border"
                  onClick={() => {
                    setStudents(
                      students.slice(0, idx).concat(students.slice(idx + 1))
                    );
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
