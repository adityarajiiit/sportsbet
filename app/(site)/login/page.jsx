"use client";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
export default function Login() {
  const session = useSession();
  const router = useRouter();
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  useEffect(() => {
    if (session?.status === "authenticated") {
      router.push("/dashboard");
    }
  });
  const loginUser = async (e) => {
    e.preventDefault();
    signIn("credentials", { ...data, redirect: false }).then((e) =>
      alert(e.error ? e.error : "Login successful")
    );
  };
  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 mt-20">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <div></div>
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight font-poppins">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={loginUser} className="fieldset">
            <label className="label font-inter text-base-content font-medium">
              Email
            </label>

            <label className="input input-neutral rounded-lg border-muted-foreground validator w-full">
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
                  <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </g>
              </svg>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="mail@site.com"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                className="font-inter"
              />
            </label>
            <div className="validator-hint hidden">
              Enter valid email address
            </div>
            <label className="label font-inter text-base-content font-medium mt-2">
              Password
            </label>
            <label className="input input-neutral rounded-lg border-muted-foreground w-full">
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
                required
                autoComplete="current-password"
                placeholder="Password"
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
                className="font-inter"
              />
            </label>

            <button
              type="submit"
              className="flex w-full justify-center btn btn-info px-3 py-1.5 text-sm/6 font-semibold mt-4 rounded-2xl"
            >
              Sign in
            </button>
          </form>
          <p className="font-poppins text-sm my-4 text-center font-medium">
            Sign into Google below
          </p>

          <button
            className="btn bg-white text-black border-[#e5e5e5] w-full font-inter font-medium rounded-2xl"
            onClick={() => signIn("google")}
          >
            <svg
              aria-label="Google logo"
              width="16"
              height="16"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
            >
              <g>
                <path d="m0 0H512V512H0" fill="#fff"></path>
                <path
                  fill="#34a853"
                  d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"
                ></path>
                <path
                  fill="#4285f4"
                  d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"
                ></path>
                <path
                  fill="#fbbc02"
                  d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"
                ></path>
                <path
                  fill="#ea4335"
                  d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"
                ></path>
              </g>
            </svg>
            Login with Google
          </button>
          <p className="mt-5 font-inter text-center text-sm/6 text-gray-400 font-medium">
            Don't have an account?{" "}
            <Link href="/register" className="font-medium text-info">
              Register
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
