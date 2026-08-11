"use client";
import React from "react";
import Image from "next/image";
import { FaBell } from "react-icons/fa";
import { FaFlag } from "react-icons/fa";
import { MdEvent } from "react-icons/md";
import { useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
function UpcomingEventCard({
  title,
  team1,
  team2,
  image1,
  image2,
  matchId,
  status,
  date,
}) {
  const session = useSession();
  const [notifyMinutes, setNotifyMinutes] = useState(30);
  const [notifying, setNotifying] = useState(false);
  const [notified, setNotified] = useState(false);
  const modalId = `notify_${matchId}`;
  const handleNotify = async () => {
    if (!session?.data?.user) {
      toast.error("Please login to set reminder");
      return;
    }
    setNotifying(true);
    try {
      const matchTime = new Date(date).getTime();
      const reminderTime = new Date(matchTime - notifyMinutes * 60 * 1000);
      if (reminderTime <= new Date()) {
        toast.error("Match is too close to set reminder");
        setNotifying(false);
        return;
      }
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/reminder/newreminder`,
        {
          matchId: matchId || null,
          message: `${title} starts in ${notifyMinutes} minutes`,
          time: reminderTime.toISOString(),
          type: "match",
        },
        {
          withCredentials: true,
        },
      );
      toast.success(`Reminder set for ${notifyMinutes} min before match`);
      setNotified(true);
      document.getElementById(modalId).close();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setNotifying(false);
    }
  };
  return (
    <div className="p-5 flex flex-col justify-center items-center bg-base-200 gap-2 rounded-xl border border-neutral-content/5 h-[205px]">
      <div className="flex justify-between items-center gap-6 w-full">
        <h1 className="font-medium text-sm font-poppins text-neutral-200 flex gap-2 justify-center items-center shrink-0">
          <FaFlag className="size-3.5" />
          {title}
        </h1>
        <span className="font-medium text-xs font-inter text-neutral-300 flex gap-1 justify-center items-center">
          <MdEvent className="size-4" />
          <span className="line-clamp-1">{date}</span>
        </span>
      </div>
      <div className="flex justify-between items-center gap-4 w-full mt-2">
        <div className="flex items-center justify-center gap-3">
          <Image
            src={image1}
            alt={team1}
            className="h-6 w-6 sm:h-7 sm:w-7 rounded-md"
          ></Image>
          <div className="flex flex-col justify-center items-start ">
            <p className="text-sm sm:text-base font-semibold font-poppins">
              {team1}
            </p>
          </div>
        </div>
        <p className="text-sm sm:text-base font-goldman font-semibold">VS</p>
        <div className="flex items-center justify-center gap-3">
          <Image
            src={image2}
            alt={team2}
            className="h-6 w-6 sm:h-7 sm:w-7 rounded-md"
          ></Image>
          <div className="flex flex-col justify-center items-start">
            <p className="text-sm sm:text-base font-semibold font-poppins">
              {team2}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full flex justify-center items-center mt-2">
        <p className="font-poppins font-semibold text-xs">{status}</p>
      </div>
      <button
        className={`btn rounded w-full mt-2 ${notified ? "btn-success" : "btn-warning"}`}
        onClick={() => document.getElementById(modalId).showModal()}
      >
        <FaBell /> {notified ? "Reminder Set" : "Notify Me"}
      </button>
      <dialog id={modalId} className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="text-base font-semibold font-poppins">{title}</h3>
          <p className="text-xs font-poppins text-neutral-400 mt-1">
            {team1} vs {team2}
          </p>
          <p className="text-sm font-poppins mt-4">Remind me before match</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {[15, 30, 60, 120].map((m) => (
              <button
                key={m}
                className={`btn btn-sm rounded-full font-poppins ${notifyMinutes === m ? "btn-warning" : "btn-ghost border border-base-content/20"}`}
                onClick={() => setNotifyMinutes(m)}
              >
                {m >= 60 ? `${m / 60}h` : `${m}m`}
              </button>
            ))}
          </div>
          <p className="text-xs font-poppins text-neutral-400 mt-3">
            You will be notified {notifyMinutes} minutes before the match starts
          </p>
          <button
            className="btn btn-warning w-full mt-4 font-poppins"
            onClick={handleNotify}
            disabled={notifying}
          >
            <FaBell />
            {notifying ? "Setting reminder..." : "Set Reminder"}
          </button>
        </div>
      </dialog>
    </div>
  );
}

export default UpcomingEventCard;
