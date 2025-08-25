import React from "react";
import { RiTeamFill } from "react-icons/ri";
import { FaUserNinja } from "react-icons/fa";
import { useSelectedUser } from "../store/useSelectedUser";
import Image from "next/image";
import { GiTrophy } from "react-icons/gi";
import { TbCoinRupeeFilled } from "react-icons/tb";
function Sidebar({ teams = [], players = [], category }) {
  const { selectedUser, setSelectedUser } = useSelectedUser();
  return (
    <aside className="h-full w-24 lg:w-72 bg-base-300/50 flex flex-col transition-all duration-200 rounded-xl border border-base-content/5">
      <div className="w-full p-0.5">
        <div className="flex items-center justify-center gap-2 uppercase bg-info-content/50 p-4 rounded-t-lg">
          {category === "Player" ? (
            <FaUserNinja className=" p-2 bg-base-content/15 fill-base-content rounded-full size-8" />
          ) : (
            <RiTeamFill className="fill-base-content p-2 bg-base-content/15 rounded-full size-8" />
          )}{" "}
          <span className="hidden lg:block text-base-content font-poppins text-lg font-semibold">
            {category === "Player" ? "Players" : "Teams"}{" "}
          </span>
        </div>
      </div>
      <div className="overflow-y-auto w-full">
        {(category === "Player" ? players : teams).map((user) => (
          <button
            key={user.id}
            className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors justify-start border-b-2 border-b-accent-content/40 ${
              selectedUser?.id === user.id
                ? "bg-base-300 ring-1 ring-base-300"
                : ""
            }`}
            onClick={() => setSelectedUser(user)}
          >
            <div className="md:w-20">
              <Image
                src={user.image}
                alt={user.name}
                className="size-13 rounded-full object-cover"
              />
            </div>
            <div className="hidden lg:block text-left min-w-0 w-full ">
              <div className="font-medium truncate font-poppins">
                {user.name}
              </div>
              <div className="flex flex-row justify-between items-center w-full">
                <span className="flex justify-center items-center gap-0.5 text-sm text-gray-400 font-inter">
                  <GiTrophy />
                  {user.sport}
                </span>
                <span className="flex justify-center items-center gap-0.5 font-inter text-xs text-gray-400">
                  <TbCoinRupeeFilled />
                  &#8377;{user.price}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;
