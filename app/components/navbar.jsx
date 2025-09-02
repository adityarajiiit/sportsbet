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
import logo from "@/public/logo.png";
import { MdAddCard } from "react-icons/md";
import { BackgroundGradient } from "@/components/ui/backgroundgradient";
import { FaBell } from "react-icons/fa";
import { FaUserLock } from "react-icons/fa";
function Navbar() {
  const { data: session } = useSession();
  const { theme } = useThemeStore();
  return (
    <header
      className="flex justify-between items-center p-3 w-full h-20 absolute top-0 z-10 bg-transparent "
      data-theme={theme}
    >
      <div className="flex justify-center items-center gap-2 pl-2">
        <Link href="/" className="">
          <Image src={logo} alt="logo" className="size-22"></Image>
        </Link>
      </div>
      <div className="flex justify-center items-center gap-4">
        <div className="hidden lg:flex justify-center items-center gap-6 backdrop-blur-md border-1 border-white/10 bg-white/5 p-3 px-6 rounded-full">
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
        <BackgroundGradient className="rounded-full flex items-center justify-between bg-base-100 gap-2 w-32 p-1 px-2">
          <div className="flex items-center gap-2">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center bg-[rgba(248,248,248,0.01)]
            shadow-[0px_0px_8px_0px_rgba(248,248,248,0.25)_inset,0px_32px_24px_-16px_rgba(0,0,0,0.40)]"
            >
              <MdAddCard className="size-5" />
            </div>
            <div className="flex flex-col justify-center items-start p-1">
              <p className="text-warning text-xs font-poppins font-medium">
                Balance
              </p>
              <span className="text-base -mt-0.5 font-bold font-inter">
                ₹30
              </span>
            </div>
          </div>
        </BackgroundGradient>
      </div>
      <div className="hidden lg:flex items-center gap-2">
        <Link
          href="/"
          className="btn rounded-full p-2.5 border-base-content/20"
        >
          <FaBell className="size-4.5" />
        </Link>
        <Link
          href="/admin"
          className="btn rounded-full p-2.5 border-base-content/20"
        >
          <FaUserLock className="size-4.5" />
        </Link>
        {session ? (
          <Link
            href="/login"
            className="px-6 py-3 rounded-full bg-[#c1d71e] font-bold text-base-100 tracking-widest uppercase transform hover:scale-102 hover:bg-[#FFB22C] transition-all duration-200 font-inter text-sm "
          >
            Log Out
          </Link>
        ) : (
          <Link
            href="/login"
            className="px-6 py-3 rounded-full bg-[#b6e24e] font-bold text-base-100 tracking-widest uppercase transform hover:scale-102 hover:bg-[#FFB22C] transition-all duration-200 font-inter text-sm "
          >
            Log In
          </Link>
        )}
      </div>
      <div className="lg:hidden flex items-center gap-2">
        <Link
          href="/"
          className="btn rounded-full p-2.5 border-base-content/20"
        >
          <FaBell className="size-4.5" />
        </Link>
        <Link
          href="/admin"
          className="btn rounded-full p-2.5 border-base-content/20"
        >
          <FaUserLock className="size-4.5" />
        </Link>
        <div className="dropdown dropdown-bottom dropdown-end ">
          <div tabIndex={0} role="button" className="btn btn-circle">
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
            <div></div>
            {session ? (
              <Link
                href="/login"
                className="flex justify-start items-center p-2 gap-1  font-medium font-poppins text-sm hover:bg-base-300 rounded-xs"
              >
                Log Out
              </Link>
            ) : (
              <Link
                className="flex justify-start items-center p-2 gap-1  font-medium font-poppins text-sm hover:bg-base-300 rounded-xs"
                href="/login"
              >
                <TbLogout className="stroke-2 size-4" />
                Log In
              </Link>
            )}
          </ul>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
