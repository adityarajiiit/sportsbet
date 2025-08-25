"use client";
import Image from "next/image";
import React from "react";
import Link from "next/link";
import { HiHome } from "react-icons/hi2";
import { MdSpaceDashboard } from "react-icons/md";
import { MdEvent } from "react-icons/md";
import { FaChartSimple } from "react-icons/fa6";
import { TbLogout } from "react-icons/tb";
import { useSession, signIn, signOut } from "next-auth/react";
import { HiOutlineMenuAlt3 } from "react-icons/hi";
import { useThemeStore } from "../store/useThemestore";
import logo from "@/public/logo.png"
function Navbar() {
  const { data: session } = useSession();
  const { theme } = useThemeStore();
  return (
    <header
      className="flex justify-between items-center p-3 w-full h-20 absolute top-0 z-10 bg-transparent "
      data-theme={theme}
    >
      <div className="flex justify-center items-center gap-2 pl-2">
        <Link
          href="/"
          className=""
        >
          <Image src={logo} alt="logo" className="size-22"></Image>
        </Link>
      </div>
      <div className="hidden md:flex justify-center items-center gap-6 backdrop-blur-md border-1 border-white/10 bg-white/5 p-3 px-6 rounded-full">
        <Link
          href="/"
          className="flex justify-center items-center gap-1 hover:text-warning text-white"
        >
          <HiHome className="size-4" />{" "}
          <p className="font-normal font-poppins text-sm ">Home</p>
        </Link>

        <Link
          href="/event"
          className="flex justify-center items-center gap-1 hover:text-warning text-white"
        >
          <MdEvent className="size-4" />{" "}
          <p className="font-normal font-poppins text-sm ">Events</p>
        </Link>
        <Link
          href="/stock"
          className="flex justify-center items-center gap-1 hover:text-warning text-white"
        >
          <FaChartSimple className="size-4" />{" "}
          <p className="font-normal font-poppins text-sm  ">Stocks</p>
        </Link>
        <Link
          href="/dashboard"
          className="flex justify-center items-center gap-1 hover:text-warning text-white"
        >
          <MdSpaceDashboard className="size-4" />{" "}
          <p className="font-normal font-poppins text-sm  ">Dashboard</p>
        </Link>
      </div>
      <div>
        {session ? (
          <button
            className="px-6 py-3 rounded-full bg-[#c1d71e] font-bold text-base-100 tracking-widest uppercase transform hover:scale-102 hover:bg-[#FFB22C] transition-all duration-200 font-inter text-sm hidden md:block"
            onClick={signOut}
          >
            Log Out
          </button>
        ) : (
          <button
            className="px-6 py-3 rounded-full bg-[#b6e24e] font-bold text-base-100 tracking-widest uppercase transform hover:scale-102 hover:bg-[#FFB22C] transition-all duration-200 font-inter text-sm hidden md:block"
            onClick={signIn}
          >
            Log In
          </button>
        )}
      </div>
      <div className="dropdown dropdown-bottom dropdown-end md:hidden">
        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
          <HiOutlineMenuAlt3 className="size-6" />
        </div>
        <ul
          tabIndex={0}
          className="menu menu-lg dropdown-content bg-base-200 rounded-box z-1 mt-3 w-fit p-2 shadow gap-1"
        >
          <Link
            href="/"
            className="flex justify-start items-center gap-1 p-2 hover:bg-base-300 rounded-xs"
          >
            <HiHome className="size-4" />{" "}
            <p className="font-normal font-poppins">Home</p>
          </Link>

          <Link
            href="/event"
            className="flex justify-start items-center gap-1 p-2 hover:bg-base-300 rounded-xs"
          >
            <MdEvent className="size-4" />{" "}
            <p className="font-normal font-poppins">Events</p>
          </Link>
          <Link
            href="/stock"
            className="flex justify-start items-center gap-1 hover:bg-base-300 rounded-xs p-2"
          >
            <FaChartSimple className="size-4" />{" "}
            <p className="font-normal font-poppins text-sm  ">Stocks</p>
          </Link>
          <Link
            href="/dashboard"
            className="flex justify-start items-center gap-1 p-2 hover:bg-base-300 rounded-xs"
          >
            <MdSpaceDashboard className="size-4" />{" "}
            <p className="font-normal font-poppins">Dashboard</p>
          </Link>
          {session ? (
            <button
              className="flex justify-start items-center p-2 gap-1  font-medium font-poppins text-sm hover:bg-base-300 rounded-xs"
              onClick={signOut}
            >
              Log Out
            </button>
          ) : (
            <button
              className="flex justify-start items-center p-2 gap-1  font-medium font-poppins text-sm hover:bg-base-300 rounded-xs"
              onClick={signIn}
            >
              <TbLogout className="stroke-2 size-4" />
              Log In
            </button>
          )}
        </ul>
      </div>
    </header>
  );
}

export default Navbar;
