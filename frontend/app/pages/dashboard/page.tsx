"use client";

import { useState, useEffect } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import withAuth from "@/app/utils/withAuth";
import { message } from "antd";

function Dashboard() {
  const [username, setUsername] = useState("Guest");
  const [email, setEmail] = useState("xxx@mail.com");

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  // const [seasonInfo, setSeasonInfo] = useState({
  //   name: "Winter 2025",
  //   startDate: "2025-03-01",
  //   endDate: "2025-04-01",
  //   description: "This season includes all weekend matches from June to September.",
  // });

  const [seasonInfo, setSeasonInfo] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("seasonInfo");
      if (saved) return JSON.parse(saved);
    }
    return {
      name: "",
      startDate: "",
      endDate: "",
      description: "",
    };
  });
  

  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUsername(localStorage.getItem("username") || "Guest");
      setEmail(localStorage.getItem("email") || "xxx@mail.com");
    }
  }, []);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getStartDay = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0=Sun
  };

  const isInRange = (dateStr: string) => {
    const date = new Date(dateStr);
    const start = new Date(seasonInfo.startDate);
    const end = new Date(seasonInfo.endDate);
    return date >= start && date <= end;
  };

  // const renderCalendar = () => {
  //   const daysInMonth = getDaysInMonth(year, month);
  //   const startDay = getStartDay(year, month);
  //   const calendar = [];
  //   let day = 1;

  //   for (let i = 0; i < 6; i++) {
  //     const week = [];
  //     for (let j = 0; j < 7; j++) {
  //       if ((i === 0 && j < startDay) || day > daysInMonth) {
  //         week.push(<td key={j}></td>);
  //       } else {
  //         const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  //         const isHighlighted = isInRange(dateStr);
  //         week.push(
  //           <td
  //             key={j}
  //             className={`w-12 h-12 text-center rounded ${
  //               isHighlighted ? "bg-blue-300 font-semibold" : ""
  //             }`}
  //           >
  //             {day++}
  //           </td>
  //         );
  //       }
  //     }
  //     calendar.push(<tr key={i}>{week}</tr>);
  //   }
  //   return calendar;
  // };
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(year, month);
    const startDay = getStartDay(year, month);
    const calendar = [];
    let day = 1;
  
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  
    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if ((i === 0 && j < startDay) || day > daysInMonth) {
          week.push(<td key={j}></td>);
        } else {
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isHighlighted = isInRange(dateStr);
          const isToday = dateStr === todayStr;
  
          let className = "w-12 h-12 text-center rounded text-black";
          if (isToday) {
            className += " bg-green-400 text-white font-bold";
          } else if (isHighlighted) {
            className += " bg-blue-300 font-semibold";
          }
          week.push(
            <td key={j} className={className}>
              {day++}
            </td>
          );
        }
      }
      calendar.push(<tr key={i}>{week}</tr>);
    }
    return calendar;
  };
  

  // const handleFormSubmit = (e: any) => {
  //   e.preventDefault();
  //   const form = e.target;
  //   const name = form.name.value;
  //   const startDate = form.startDate.value;
  //   const endDate = form.endDate.value;
  //   const description = form.description.value;

  //   setSeasonInfo({ name, startDate, endDate, description });
  //   setEditMode(false);
  // };
  // const handleFormSubmit = (e: any) => {
  //   e.preventDefault();
  //   const form = e.target;
  //   const name = form.name.value;
  //   const startDate = form.startDate.value;
  //   const endDate = form.endDate.value;
  //   const description = form.description.value;
  
  //   const updatedInfo = { name, startDate, endDate, description };
  //   setSeasonInfo(updatedInfo);
  //   localStorage.setItem("seasonInfo", JSON.stringify(updatedInfo));
  //   setEditMode(false);
  // };

  const handleFormSubmit = (e: any) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const startDate = form.startDate.value;
    const endDate = form.endDate.value;
    const description = form.description.value;

    // verification of time: end time should not early than start tome
    if (new Date(endDate) < new Date(startDate)) {
      message.error("End date cannot be earlier than start date.");
      return;
    }

    const updatedInfo = { name, startDate, endDate, description };
    setSeasonInfo(updatedInfo);
    localStorage.setItem("seasonInfo", JSON.stringify(updatedInfo));
    setEditMode(false);
  };
  

  return (
    <div className="h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header username={username} email={email} pageName="Dashboard" />
        <main className="flex-1 bg-gray-100 p-8 flex flex-col items-center gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
            {/* Calendar */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                {/* <button onClick={() => setMonth((m) => (m - 1 + 12) % 12)}>&lt;</button> */}
                <button
                    className="text-black font-bold text-xl"
                    onClick={() => setMonth((m) => (m - 1 + 12) % 12)}>
                    &lt;
                </button>
                <h2 className="font-bold text-lg text-black">
                  {year} - {month + 1}
                </h2>
                {/* <button onClick={() => setMonth((m) => (m + 1) % 12)}>&gt;</button> */}
                <button
                  className="text-black font-bold text-xl"
                  onClick={() => setMonth((m) => (m + 1) % 12)}>
                  &gt;
                </button>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="text-center text-sm text-gray-500">
                    <th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th>
                  </tr>
                </thead>
                <tbody>{renderCalendar()}</tbody>
              </table>
            </div>

            {/* Season Info */}
            <div className="bg-white shadow-md rounded-lg p-6 relative">
              <h2 className="text-xl font-bold text-[#3b4f84] mb-4">Current Season Info</h2>
              {!editMode && (
                <>
                  <button
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                    onClick={() => setEditMode(true)}
                  >
                    ✏️
                  </button>
                  <p className="mb-2 text-black"><strong>Season Name:</strong> {seasonInfo.name}</p>
                  <p className="mb-2 text-black"><strong>Start Date:</strong> {seasonInfo.startDate}</p>
                  <p className="mb-2 text-black"><strong>End Date:</strong> {seasonInfo.endDate}</p>
                  <p className="mt-4 text-gray-600">{seasonInfo.description}</p>
                </>
              )}
              {editMode && (
                <form onSubmit={handleFormSubmit} className="space-y-2 text-black">
                  <input name="name" defaultValue={seasonInfo.name} className="w-full p-2 border rounded" />
                  <div className="flex gap-2">
                    <input type="date" name="startDate" defaultValue={seasonInfo.startDate} className="w-1/2 p-2 border rounded" />
                    <input type="date" name="endDate" defaultValue={seasonInfo.endDate} className="w-1/2 p-2 border rounded" />
                  </div>
                  <textarea name="description" defaultValue={seasonInfo.description} className="w-full p-2 border rounded" rows={3} />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setEditMode(false)} className="px-4 py-1 border rounded text-black">Cancel</button>
                    <button type="submit" className="px-4 py-1 bg-blue-600 text-white rounded">Save</button>
                  </div>
                </form>
              )}
            </div>
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}

export default withAuth(Dashboard);


