"use client";
import Link from "next/link";
import { PiCertificateFill } from "react-icons/pi";
import { IoStatsChart } from "react-icons/io5";
import { MdSportsBaseball } from "react-icons/md";
import { GiPayMoney } from "react-icons/gi";
import Image from "next/image";
import SportSection from "./components/SportSection";
import { useSession } from "next-auth/react";
import { FaChartPie } from "react-icons/fa";
import { FaBell } from "react-icons/fa";
import { Vortex } from "@/components/ui/vortex";
import newsletter from "@/public/newsletter.png";
import { HoverBorderGradient } from "@/components/ui/bg-gradient";
import axios from "axios"
export default function Home() {
  const { data: session } = useSession();
  const features = [
    {
      icons: (
        <PiCertificateFill className="fill-warning size-10 p-2 bg-lime-200/10 rounded-full" />
      ),
      title: "Licensed & Secure",
      description: "Licensed and completely secure. No privacy related issues.",
    },
    {
      icons: (
        <IoStatsChart className="fill-warning size-10 p-2 bg-lime-200/10 rounded-full" />
      ),
      title: "In-Play Statistics",
      description: "Get detailed stats and odds while you play.",
    },
    {
      icons: (
        <MdSportsBaseball className="fill-warning size-10 p-2 bg-lime-200/10 rounded-full" />
      ),
      title: "Live Sports Betting",
      description: "Bet in real-time on football, cricket, tennis, and more.",
    },
    {
      icons: (
        <GiPayMoney className="fill-warning size-10 p-2 bg-lime-200/10 rounded-full" />
      ),
      title: "Instant Payouts",
      description: "Fast & secure withdrawals.",
    },
    {
      icons: (
        <FaChartPie className="fill-warning size-10 p-2 bg-lime-200/10 rounded-full" />
      ),
      title: "Trading",
      description: "Buy and sell like the stock market.",
    },
    {
      icons: (
        <FaBell className="fill-warning size-10 p-2 bg-lime-200/10 rounded-full" />
      ),
      title: "Match Reminders",
      description: " Never miss a game.",
    },
  ];
  const getLiveMatches=async()=>{
    try{
        const response=await axios.get(``,{withCredentials:true})

    }
    catch(e){
      console.log(e)
    }
  }

  return (
    <div
      className=" flex flex-col justify-center items-center pt-20"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 place-items-center  top-0 p-4 gap-4  h-full">
        <div className="flex flex-col justify-center items-center md:items-start p-4">
          <button className="bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6  text-white inline-block mb-2">
            <span className="absolute inset-0 overflow-hidden rounded-full">
              <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
            </span>
            <div className="relative flex space-x-2 items-center  rounded-full bg-base-100 py-2 px-6 ring-1 ring-white/10 ">
              <span className="font-medium font-poppins text-sm">{`Bet with accountibility`}</span>
            </div>
            <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40"></span>
          </button>
          <p className=" md:items-start gap-1 text-white font-bold font-poppins py-2 md:text-5xl text-6xl lg:text-6xl text-center max-w-4xl uppercase md:text-left">
            Where Every{" "}
            <span className="bg-gradient-to-r from-lime-200 to-yellow-300 bg-clip-text text-transparent">
              Bet
            </span>{" "}
            Counts
          </p>

          <p className="text-sm font-poppins font-normal mt-2 text-center max-w-lg md:max-w-3xl  text-gray-200 xl:text-base md:text-left">
            Step into the world of India’s most reliable betting platform —
            featuring lightning-fast sports bets, live casino entertainment, and
            the best odds in the game.
          </p>
          <div className="flex justify-center items-center md:items-start gap-4 mt-8">
            {session ? (
              <Link href="/dashboard">
                <HoverBorderGradient
                  containerClassName="rounded-full"
                  as="button"
                  className=" bg-base-100 text-white  flex items-center justify-center w-40 p-2.5 "
                >
                  <span className="text-sm font-poppins font-medium">Explore Now</span>
                </HoverBorderGradient>
              </Link>
            ) : (
              <Link href="/api/auth/signin">
                <HoverBorderGradient
                  containerClassName="rounded-full w-32 sm:w-40"
                  as="button"
                  className=" bg-base-100 text-white  flex items-center justify-center  p-2.5"
                >
                  <span className="text-sm font-poppins font-medium ">Explore Now</span>
                </HoverBorderGradient>
              </Link>
            )}
            <Link href="/event">
              <button className="flex gap-1 p-2.5 rounded-full bg-warning text-black font-poppins font-medium w-32 sm:w-40 justify-center items-center text-sm">
                Start Betting
              </button>
            </Link>
          </div>
        </div>
        <Image
          src="/hero-sticker.svg"
          width={400}
          height={400}
          alt=""
          className="relative h-[30rem] w-full"
        />
      </div>
      <div className="flex flex-col justify-center items-center w-full p-3">
        <div className="bg-neutral-900/60 p-3 rounded-xl">
          <div className="flex flex-col justify-center items-center w-full gap-1">
            <HoverBorderGradient
              containerClassName="rounded-full"
              as="button"
              className=" bg-base-100 text-white  flex items-start"
            >
              <span>Key features</span>
            </HoverBorderGradient>
            <h1 className=" text-3xl font-inter font-black text-center uppercase">
              Our smart <span className="text-warning">features</span>
            </h1>
            <p className="text-sm font-inter w-4/6 lg:w-lg text-gray-300 text-center">
              Streamline your betting and trading experience.
            </p>
          </div>
          <div className="flex flex-wrap justify-center  items-center pl-4 gap-4 mt-4">
            {features.map((feature) => {
              return (
                <div
                  key={feature.title}
                  className="relative h-fit w-fit flex justify-center items-center"
                >
                  <svg width="0" height="0">
                    <defs>
                      <clipPath
                        id="vortexShape"
                        clipPathUnits="objectBoundingBox"
                      >
                        <path
                          d="M34 0.5H254.053C261.718 0.500091 269.151 3.12937 275.112 7.94824L298.533 26.8809L318.616 45.2598C325.551 51.6058 329.5 60.5738 329.5 69.9736V288C329.5 306.502 314.502 321.5 296 321.5H34C15.4985 321.5 0.5 306.502 0.5 288V34C0.5 15.4985 15.4985 0.5 34 0.5Z"
                          transform="scale(0.00303, 0.00311)" /* normalize to 0–1 */
                        />
                      </clipPath>
                    </defs>
                  </svg>
                  <svg
                    width="220"
                    height="230"
                    viewBox="0 0 330 322"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="relative"
                  >
                    <path
                      d="M34 0.5H254.053C261.718 0.500091 269.151 3.12937 275.112 7.94824L298.533 26.8809L318.616 45.2598C325.551 51.6058 329.5 60.5738 329.5 69.9736V288C329.5 306.502 314.502 321.5 296 321.5H34C15.4985 321.5 0.5 306.502 0.5 288V34C0.5 15.4985 15.4985 0.5 34 0.5Z"
                      fill="#222831"
                      stroke="#31363F"
                      className="relative"
                    />
                  </svg>
                  <div
                    className="absolute p-4 flex flex-col justify-center items-center gap-2 overflow-hidden rounded-3xl"
                    style={{
                      width: "220px",
                      height: "214px",
                      clipPath: "url(#vortexShape)",
                    }}
                  >
                    <Vortex
                      rangeY={500}
                      particleCount={50}
                      baseHue={100}
                      className="flex items-center flex-col justify-center px-2   py-4 w-full h-full bg-transparent"
                    >
                      {feature.icons}
                      <p className="font-medium font-poppins text-center mt-2">
                        {feature.title}
                      </p>
                      <p className="text-center text-xs font-poppins text-gray-400">
                        {feature.description}
                      </p>
                    </Vortex>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="w-full mt-4">
        <h1 className="pl-4 text-3xl font-inter font-black uppercase">
          Sports <span className="text-warning">Betting</span>
        </h1>
        <p className="font-inter pl-4 font-normal text-sm text-neutral-300 w-sm md:w-md lg:w-lg">
          Explore the most exciting sports.
        </p>
      </div>

      <SportSection />
      <div className="mt-4 relative w-full">
        <Image
          src={newsletter}
          alt="newsletter"
          className="relative w-full h-96 object-cover"
          width={1000}
          height={1000}
        ></Image>
        <div className="absolute top-0 h-full w-full flex flex-col justify-center items-center p-5 bg-gradient-to-b from-base-100">
          <h1 className="text-4xl md:text-5xl font-extrabold font-poppins text-center uppercase">
            Subscribe to Our Newsletter
          </h1>
          <p className="text-center w-11/12 sm:w-lg md:w-2xl mt-4 text-sm md:text-base font-inter">
            Welcome to our newsletter hub,where ew bring you the latest
            happenings,exclusive content,and behind the scene insights.
          </p>
          <div className="join w-11/12 sm:w-lg lg:w-xl flex justify-center mt-6">
            <input className="input join-item rounded-l-full h-16 w-full focus:outline-0 px-4 font-goldman" placeholder="Write your email" />
            <button className="btn join-item rounded-r-full h-16 bg-white text-base-300 font-goldman font-semibold">Subscribe</button>
          </div>
        </div>
      </div>
    </div>
  );
}
