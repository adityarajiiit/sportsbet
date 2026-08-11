"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { themes } from "@/app/constants/themes";
import { useThemeStore } from "@/app/store/useThemestore.jsx";
import { Tabs } from "@/components/ui/tab";
import axios from "axios";
import { useUserStore } from "@/app/store/useUserStore.jsx";
import { toast } from "sonner";
import Loading from "@/app/loading";

import ProfileHeader from "@/components/blocks/DashboardComponents/ProfileHeader";
import ThemePicker from "@/components/blocks/DashboardComponents/ThemePicker";
import WalletPanel from "@/components/blocks/DashboardComponents/WalletPanel";
import DashboardOverview from "@/components/blocks/DashboardComponents/DashboardOverview";

const Dashboard = () => {
  const [amount, setAmount] = useState("");
  const [withdraw, setWithdraw] = useState(0.01);
  const [loading, setLoading] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const session = useSession();
  const { theme, setTheme } = useThemeStore();
  const { user, refreshUser } = useUserStore();

  const handlePayment = async (e) => {
    e.preventDefault();
    const parsedAmount = Number.parseInt(amount, 10);
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/crypto/mockdeposit`,
        { amount: parsedAmount },
        { withCredentials: true },
      );
      if (response.data?.success) {
        toast.success("Mock deposit successful");
        setAmount("");
        document.getElementById("Add_balance").close();
        refreshUser();
      } else if (response.data?.error) {
        toast.error(response.data.error);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const parsedAmount = Number.parseFloat(withdraw);
    if (!withdraw || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/withdrawal/withdraw`,
        { amount: parsedAmount },
        { withCredentials: true },
      );
      if (response.data?.success) {
        toast.success("Withdrawal request submitted");
        setWithdraw(0.01);
        document.getElementById("Withdraw").close();
        refreshUser();
      } else if (response.data?.error) {
        toast.error(response.data.error);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        await refreshUser();
      } finally {
        setIsUserLoading(false);
      }
    };

    loadUser();
  }, [refreshUser]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const payment = searchParams.get("payment");
    const shouldCleanup = payment === "success" || payment === "cancelled";
    if (payment === "success") {
      toast.success("Payment successful");
      refreshUser();
    }
    if (payment === "cancelled") {
      toast.error("Payment cancelled");
    }
    if (shouldCleanup) {
      searchParams.delete("payment");
      searchParams.delete("orderId");
      const queryString = searchParams.toString();
      const nextUrl = queryString
        ? `${window.location.pathname}?${queryString}`
        : window.location.pathname;
      window.history.replaceState({}, "", nextUrl);
    }
  }, []);

  if (session.status === "loading") {
    return <Loading />;
  }

  if (isUserLoading) {
    return <Loading />;
  }

  const walletBalance = Number(user?.wallet?.balance ?? 0);
  const winningAmount = Number(user?.winningamount ?? 0);

  const tabs = [
    {
      title: "Personalisation",
      value: "personalisation",
      content: <ThemePicker themes={themes} activeTheme={theme} onSelectTheme={setTheme} />,
    },
    {
      title: "Wallet",
      value: "Wallet",
      content: (
        <WalletPanel
          walletBalance={walletBalance}
          winningAmount={winningAmount}
          amount={amount}
          setAmount={setAmount}
          handlePayment={handlePayment}
          loading={loading}
          withdraw={withdraw}
          setWithdraw={setWithdraw}
          handleWithdraw={handleWithdraw}
        />
      ),
    },
    {
      title: "Overview",
      value: "Overview",
      content: <DashboardOverview user={user} />,
    },
  ];

  return (
    <div className="pt-20 p-4">
      <ProfileHeader user={user} />
      <div className="h-[45rem] [perspective:1000px] relative flex flex-col max-w-7xl w-full items-start justify-start mt-4">
        <Tabs tabs={tabs} />
      </div>
    </div>
  );
};

export default Dashboard;