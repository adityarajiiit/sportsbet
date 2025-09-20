"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { FaUser } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { HiCalendarDateRange } from "react-icons/hi2";
import { SiReactivex } from "react-icons/si";
import { GiCardAceSpades } from "react-icons/gi";
import { GiProfit } from "react-icons/gi";
import { useRouter } from "next/navigation";
import { MdSavings } from "react-icons/md";
import { FaBitcoin } from "react-icons/fa";
import { BiSolidNetworkChart } from "react-icons/bi";
import { themes } from "@/app/constants/themes";
import { LoaderOne, LoaderFour } from "@/components/ui/loader";
import { MdAddCard } from "react-icons/md";
import { GiTrophy } from "react-icons/gi";
import { useThemeStore } from "@/app/store/useThemestore.jsx";
import { Tabs } from "@/components/ui/tab";
import axios from 'axios'
const dashboard = () => {
  const [amount, setAmount] = useState(0.01);
  const [withdraw, setWithdraw] = useState(0.01);
  const session = useSession();
  const { theme, setTheme } = useThemeStore();
  const [user,setUser]=useState({})
  const router=useRouter()
  const handlePayment=async(e)=>{
    e.preventDefault();
    const response=await axios.post("http://localhost:4000/api/crypto/order",{
      amount:parseFloat(amount)
    },
  {
    withCredentials:true
  })
    console.log(amount)
    router.push(response.data.url)
    console.log(response.data)
  }
  const handleWithdraw=async(e)=>{
    e.preventDefault();
    // Add your withdraw API logic here, e.g.:
    // const response=await axios.post("http://localhost:4000/api/crypto/withdraw",{
    //   amount:parseFloat(withdraw)
    // },
    // {
    //   withCredentials:true
    // })
    // console.log(withdraw)
    // console.log(response.data)
    // Implement actual withdraw handling as needed
  }
  useEffect(()=>
    {
    getUsers()
  },[])
  const getUsers=async()=>{
    const response=await axios.get('http://localhost:4000/api/others/getuser',{
      withCredentials:true
    })
    console.log(response.data)
    setUser(response.data)
  }
  if (session.status === "loading") {
    return (
      <div className="mt-20 h-[40rem] w-full flex flex-col justify-center items-center gap-4 text-accent">
        <LoaderOne />
        <LoaderFour />
      </div>
    );
  }
  const dashboard = [
    {
      name: "Bets",
      icon: (
        <GiCardAceSpades className="size-6 p-1 rounded-xl bg-warning/10 fill-warning" />
      ),
      value: user?.betscount,
    },
    {
      name: "Profits",
      icon: (
        <GiProfit className="size-6 p-1 rounded-xl bg-warning/10 fill-warning" />
      ),
      value: "$" + user?.profitamount,
    },
    {
      name: "Player Stocks",
      icon: (
        <MdSavings className="size-6 p-1 rounded-xl bg-warning/10 fill-warning" />
      ),
      value: user?.playerstockcount,
    },
    {
      name: "Team Stocks",
      icon: (
        <MdSavings className="size-6 p-1 rounded-xl bg-warning/10 fill-warning" />
      ),
      value: user?.teamstockscount,
    },
  ];
  const TableDatas=user?.bets?.map((bet)=>{
    return{
      event:bet?.match?.title,
      date:new Date(bet?.match?.start).toDateString(),
      bet:bet?.amount,
      multiplier:bet?.odds,
      payout:"not yet"
    }
  })
  const TradeData=user?.stockTransactions?.map((stock)=>{
    return{
      stock:stock?.stock?.name,
      category:stock?.stock?.pagetype,
      price:stock?.price.toFixed(2),
      PriceChange:(stock?.price-stock?.stock?.price).toFixed(2),
      payout:"not yet"
    }
  })
  const tabs = [
    {
      title: "Personalisation",
      value: "personalisation",
      content: (
        <div className="p-4 bg-base-100 h-full w-full border border-base-content/10 rounded-xl  absolute -bottom-10 inset-x-0  mx-auto mb-20">
          <h1 className="text-2xl font-poppins font-bold uppercase">
            Select <span className="text-warning">Themes</span>
          </h1>
          <p className="text-sm font-inter text-gray-300 w-4/6">
            Personalize your experience by choosing a theme that matches your
            style.
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 mt-6">
            {themes.map((t, index) => {
              return (
                <button
                  className={`group flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                    theme == t ? "bg-base-200" : "hover:bg-base-200"
                  }`}
                  key={index}
                  onClick={() => setTheme(t)}
                >
                  <div
                    className="relative h-8 w-full rounded-md overflow-hidden"
                    data-theme={t}
                  >
                    <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                      <div className="rounded bg-primary"></div>
                      <div className="rounded bg-secondary"></div>
                      <div className="rounded bg-accent"></div>
                      <div className="rounded bg-neutral"></div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ),
    },
    {
      title: "Wallet",
      value: "Wallet",
      content: (
        <div className="p-6 bg-base-100 h-full w-full border border-base-content/10 rounded-xl  absolute -bottom-10 inset-x-0  mx-auto mb-20">
          <h1 className="text-2xl font-poppins font-bold uppercase">
            My <span className="text-warning">Wallet</span>
          </h1>
          <p className="text-sm font-inter text-gray-300 w-4/6">
            Add balance and withdraw your existing savings.
          </p>
          <h1 className="text-3xl font-semibold font-inter mt-2">$30</h1>
          <span className="text-sm font-poppins font-light text-neutral-400">
            Balance
          </span>
          <div className="flex flex-col gap-4">
            <div
              className="p-1.5 px-3 rounded-2xl flex items-center justify-between bg-[rgba(248,248,248,0.01)]
    shadow-[0px_0px_4px_0px_rgba(248,248,248,0.25)_inset,0px_16px_24px_-16px_rgba(0,0,0,0.40)] mt-4 gap-4 w-80"
            >
              <div className="flex items-center gap-4">
                <div
                  className="h-11 w-11 rounded-full flex items-center justify-center bg-[rgba(248,248,248,0.01)]
    shadow-[0px_0px_8px_0px_rgba(248,248,248,0.25)_inset,0px_32px_24px_-16px_rgba(0,0,0,0.40)]"
                >
                  <MdAddCard className="size-6" />
                </div>
                <div className="flex flex-col justify-center items-start p-1">
                  <p className="text-accent text-xs font-poppins font-medium">
                    Deposit
                  </p>
                  <span className="text-lg -mt-0.5 font-semibold font-inter">
                    $0
                  </span>
                </div>
              </div>


              <button
                className="btn btn-active bg-white text-black border-[#e5e5e5] rounded-xl font-inter w-30"
                onClick={() =>
                  document.getElementById("Add_balance").showModal()
                }
              >
                Add Money
              </button>
              <dialog id="Add_balance" className="modal">
                <div className="modal-box">
                  <form method="dialog">
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                      ✕
                    </button>
                  </form>
                  <p className="pb-2 text-xs font-poppins">
                    Press ESC key or click on ✕ button to close
                  </p>


                  <div className=" mt-2 bg-base-300 rounded-lg p-2">
                    <div className="bg-base-100 border-base-300 p-6">
                      <p className="text-base font-poppins font-semibold">
                        Enter Amount
                      </p>
                      <p className="text-xs font-poppins">
                        minimum amount : $0.01
                      </p>
                      <form
                        action=""
                        className="mt-4 flex flex-col gap-2 w-full"
                      >
                        <input
                          type="number"
                          min="0.01"
                          max="2"
                          className="input input-info w-full"
                          value={amount}
                          onChange={(e)=>setAmount(e.target.value)}
                        />


                        <button className="btn btn-info font-poppins text-base mt-1"
                        onClick={handlePayment}
                        >
                          Add Amount
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </dialog>
            </div>
            <div
              className="p-1.5 px-3 rounded-2xl flex items-center justify-between bg-[rgba(248,248,248,0.01)]
    shadow-[0px_0px_4px_0px_rgba(248,248,248,0.25)_inset,0px_16px_24px_-16px_rgba(0,0,0,0.40)] mt-4 gap-4 w-80"
            >
              <div className="flex items-center gap-4">
                <div
                  className="h-11 w-11 rounded-full flex items-center justify-center bg-[rgba(248,248,248,0.01)]
    shadow-[0px_0px_8px_0px_rgba(248,248,248,0.25)_inset,0px_32px_24px_-16px_rgba(0,0,0,0.40)]"
                >
                  <GiTrophy className="size-6" />
                </div>
                <div className="flex flex-col justify-center items-start p-1">
                  <p className="text-accent text-xs font-poppins font-medium">
                    Winnings
                  </p>
                  <span className="text-lg -mt-0.5 font-semibold font-inter">
                    $30
                  </span>
                </div>
              </div>


              <button
                className="btn btn-active bg-white text-black border-[#e5e5e5] rounded-xl font-inter w-30"
                onClick={() => document.getElementById("Withdraw").showModal()}
              >
                Withdraw
              </button>
              <dialog id="Withdraw" className="modal">
                <div className="modal-box">
                  <form method="dialog">
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                      ✕
                    </button>
                  </form>
                  <p className="pb-2 text-xs font-poppins">
                    Press ESC key or click on ✕ button to close
                  </p>


                  <div className=" mt-2 bg-base-300 rounded-lg p-2">
                    <div className="bg-base-100 border-base-300 p-6">
                      <p className="text-base font-poppins font-semibold">
                        Enter Amount
                      </p>
                      <p className="text-xs font-poppins">
                        minimum amount : $0.01
                      </p>
                      <form
                        action=""
                        className="mt-4 flex flex-col gap-2 w-full"
                      >
                        <input
                          type="number"
                          min={0.01}
                          max="2"
                          className="input input-info w-full"
                          value={withdraw}
                          onChange={(e) => setWithdraw(e.target.value)}
                        />
                        <button className="btn btn-info font-poppins text-base mt-1"
                        onClick={handleWithdraw}
                        >
                          Withdraw
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </dialog>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Dashboard Overview",
      value: "Dashboard Overview",
      content: (
        <div className="p-4 bg-base-100 h-[40rem] w-full border border-base-content/10 rounded-xl  absolute -bottom-10 inset-x-0  mx-auto overflow-y-auto mb-20">
          <h1 className="text-2xl font-poppins font-bold uppercase">
            Dashboard <span className="text-warning">Overview</span>
          </h1>
          <div className="flex flex-wrap gap-4 mt-4">
            {dashboard.map((e, index) => {
              return (
                <div
                  key={index}
                  className="p-4 flex flex-col justify-center items-center gap-2 w-40 bg-base-300 rounded-xl"
                >
                  <div className="flex items-center justify-center w-fit gap-2 font-poppins font-medium text-sm text-warning">
                    {e.icon}
                    {e.name}{" "}
                  </div>
                  <p className="text-xl font-semibold ">{e.value}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-4 bg-base-200 rounded-md border border-base-content/10">
            <p className="p-3 font-poppins font-medium text-base flex items-center gap-2">
              <BiSolidNetworkChart className="size-5" />
              Your Bet History
            </p>
            <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
              <table className="table">
                <thead>
                  <tr>
                    <th className="font-poppins font-semibold">S.No</th>
                    <th className="font-poppins font-semibold">Event</th>
                    <th className="font-poppins font-semibold">Date</th>
                    <th className="font-poppins font-semibold">Bet</th>
                    <th className="font-poppins font-semibold">Multiplier</th>
                    <th className="font-poppins font-semibold">Payout</th>
                  </tr>
                </thead>
                <tbody>
                  {TableDatas?.map((data, index) => (
                    <tr key={index}>
                      <th>{index + 1}</th>
                      <td>{data.event}</td>
                      <td className="flex justify-start items-center gap-2">
                        <HiCalendarDateRange className="size-3.5" />
                        {data.date}
                      </td>
                      <td>
                        <span>{data.bet}</span>
                      </td>
                      <td>{data.multiplier}</td>


                      <td className="flex justify-start items-center gap-2">
                        <FaBitcoin className="fill-warning" />
                        {data.payout}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>


          <div className="mt-4 bg-base-200 rounded-md border border-base-content/10">
            <p className="p-3 font-poppins font-medium text-base flex items-center gap-2">
              <BiSolidNetworkChart className="size-5" />
              Your Trade History
            </p>
            <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
              <table className="table">
                <thead>
                  <tr>
                    <th className="font-poppins font-semibold">S.No</th>
                    <th className="font-poppins font-semibold">Stock</th>
                    <th className="font-poppins font-semibold">Category</th>
                    <th className="font-poppins font-semibold">Price</th>
                    <th className="font-poppins font-semibold">Price Change</th>
                    <th className="font-poppins font-semibold">Payout</th>
                  </tr>
                </thead>
                <tbody>
                  {TradeData?.map((data, index) => (
                    <tr key={index}>
                      <th>{index + 1}</th>
                      <td>{data.stock}</td>
                      <td className="flex justify-start items-center gap-2">
                        {data.category}
                      </td>
                      <td>
                        <span>{data.price}</span>
                      </td>
                      <td>{data.PriceChange}</td>


                      <td className="flex justify-start items-center gap-2">
                        <FaBitcoin className="fill-warning" />
                        {data.payout}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ),
    },
  ];
  return (
    <div className="pt-20 p-4">
      <div className="grid grid-cols-1 md:grid-cols-7 p-5 bg-base-200 rounded-xl">
        <div className="p-4 flex flex-col justify-center items-start col-span-4">
          <h1 className="text-2xl font-poppins font-bold">
            Personal <span className="text-warning">Information</span>
          </h1>
          <div className="mt-4 flex flex-col md:flex-row justify-center items-center gap-4 w-full">
            <Image
              src={user?.image||'/f1-race.jpg'}
              alt="userimage"
              width={400}
              height={400}
              className="h-40 w-40 object-cover rounded-full"
            ></Image>
            <div className="flex flex-col justify-center items-start gap-2 w-full">
              <div className="flex flex-col gap-2 w-full">
                <div className="flex  items-center gap-2 font-medium font-inter text-sm">
                  <FaUser /> Username :
                </div>
                <div className="font-medium font-inter p-2.5 rounded-full bg-base-200 w-full border border-base-content/10 text-sm px-4">
                  {user?.name}
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <div className="flex  items-center gap-2 font-medium font-inter text-sm">
                  <MdEmail /> Email :
                </div>
                <div className="font-medium font-inter p-2.5 rounded-full bg-base-200 w-full border border-base-content/10 text-sm px-4">
                  {user?.email}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 col-span-3">
          <h1 className="text-2xl font-poppins font-bold">
            Account <span className="text-warning">Details</span>
          </h1>
          <div className="flex flex-col justify-center items-start gap-2 w-full mt-4 p-2">
            <div className="flex flex-col gap-2 w-full">
              <div className="flex  items-center gap-2 font-medium font-inter text-sm">
                <HiCalendarDateRange /> Created At :
              </div>
              <div className="font-medium font-inter p-2.5 rounded-full bg-base-200 w-full border border-base-content/10 text-sm px-4">
                {user?.createdAt?new Date(user.createdAt).toLocaleString():""}
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <div className="flex  items-center gap-2 font-medium font-inter text-sm">
                <SiReactivex /> Status :
              </div>
              <div className="font-medium font-inter p-2.5 rounded-full bg-base-200 w-full border border-base-content/10 text-sm px-4 text-success">
                Active
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-[45rem]  [perspective:1000px] relative  flex flex-col max-w-5xl mx-auto w-full  items-start justify-start p-5">
        <Tabs tabs={tabs} />
      </div>
    </div>
  );
};
export default dashboard;