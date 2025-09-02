"use client";
import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { FaUser } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

export default function Register() {
  const [data, setData] = useState({ name: "", email: "", password: "" });
  const registerUser = async (e) => {
    e.preventDefault();
    axios
      .post("/api/register", data)
      .then(() => alert("User has been registered"))
      .catch(() => alert("An error occurred"));
  };
  return (
    <>
      <div className="flex min-h-[45rem] flex-1 flex-col justify-center items-center px-6 py-12 lg:px-8 pt-20">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight font-inter">
            Register for an account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={registerUser} className="space-y-6">
            <fieldset className="fieldset  w-full ">
              <label className="label font-inter text-base-content font-medium">
                Username
              </label>
              <label className="input validator w-full border-muted-foreground rounded-lg">
                <FaUser />
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Username"
                  required
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  className=" w-full font-inter"
                />
              </label>
              <label className="label font-inter text-base-content font-medium">
                Email
              </label>
              <label className="input validator w-full border-muted-foreground rounded-lg">
                <MdEmail/>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="Email"
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  className=" w-full font-inter"
                />
              </label>
              <label className="label font-inter text-base-content font-medium">
                Password
              </label>
              <label className="input validator w-full border-muted-foreground rounded-lg">
                <svg
                  className="h-[1em] opacity-50"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <g
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"></path>
                    <circle
                      cx="16.5"
                      cy="7.5"
                      r=".5"
                      fill="currentColor"
                    ></circle>
                  </g>
                </svg>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                  autoComplete="current-password"
                  value={data.password}
                  onChange={(e) =>
                    setData({ ...data, password: e.target.value })
                  }
                  className=" w-full font-inter"
                />{" "}
              </label>
            </fieldset>

            <div>
              <button type="submit" className="btn btn-info w-full rounded-2xl">
                Register
              </button>
            </div>
          </form>

          <p className="mt-6 font-inter text-center text-sm/6 text-gray-400 font-medium">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-info">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
