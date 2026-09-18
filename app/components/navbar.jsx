"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
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
import AlertsPanel from "./ai/AlertsPanel";
import { FaUserLock } from "react-icons/fa";
import { useUserStore } from "../store/useUserStore";
import { io } from "socket.io-client";
import { toast } from "sonner";
function Navbar() {
  const { data: session } = useSession();
  const { theme } = useThemeStore();
  const { walletBalance, refreshUser, fetchReminders } = useUserStore();
  useEffect(() => {
    refreshUser();
  }, []);
  useEffect(() => {
    if (!session?.user?.id) return;
    fetchReminders();
  }, [session?.user?.id]);
  useEffect(() => {
    if (!session?.user?.id) return;
    const socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL ||
        "https://sportsbet-betting.onrender.com",
    );
    socket.on("connect", () => {
      socket.emit("join-room", session.user.id);
    });
    socket.on("reminder", (data) => {
      toast(data.message, {
        duration: 10000,
        position: "top-center",
      });
    });
    socket.on("notification", (data) => {
      toast(data.message, {
        duration: 6000,
        position: "top-right",
      });
    });
    return () => {
      socket.emit("leave-room", session.user.id);
      socket.off("connect");
      socket.off("reminder");
      socket.off("notification");
      socket.disconnect();
    };
  }, [session?.user?.id]);
  return (
    <header
      className="flex justify-between items-center p-3 lg:pr-0 w-full h-20 absolute top-0 z-10 bg-transparent "
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
      </div>
      <div className="hidden lg:flex items-center gap-0">
        {session ? (
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex justify-start items-center clip-custom2 h-16 w-28 p-3 px-4 bg-[#b6e24e] font-bold text-base-100 tracking-widest uppercase transform hover:bg-[#ffe32c] transition-all duration-200 font-inter text-sm relative left-5"
          >
            Log Out
          </button>
        ) : (
          <Link
            href="/login"
            className="flex justify-start items-center clip-custom2 h-16 w-28 p-3 px-4 bg-[#b6e24e] font-bold text-base-100 tracking-widest uppercase transform hover:bg-[#ffe32c] transition-all duration-200 font-inter text-sm relative left-5"
          >
            Log In
          </Link>
        )}
        <div className="flex justify-center items-end pr-2 flex-col font-poppins font-semibold text-xs clip-custom w-28 h-16 bg-info m-0">
          <span className="text-base-100 text-xs">Balance</span>
          <span className="text-info-content text-lg sm:text-xl font-bold line-clamp-1">
            ₹{walletBalance.toFixed(2)}
          </span>
        </div>
      </div>
      <div className="lg:hidden flex items-center gap-2">
        <AlertsPanel />
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
            {session ? (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex justify-start items-center p-2 gap-1  font-medium font-poppins text-sm hover:bg-base-300 rounded-xs"
              >
                Log Out
              </button>
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
