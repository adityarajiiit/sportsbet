import Image from "next/image";
import { FaUser } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { HiCalendarDateRange } from "react-icons/hi2";
import { SiReactivex } from "react-icons/si";
import { naOr } from "./naOr";

export default function ProfileHeader({ user }) {

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 p-5 bg-base-200 rounded-xl">
      <div className="p-4 flex flex-col justify-center items-start col-span-4">
        <h1 className="text-2xl font-poppins font-bold">
          Personal <span className="text-warning">Information</span>
        </h1>
        <div className="mt-4 flex flex-col md:flex-row justify-center items-center gap-4 w-full">
          <Image
            src={user?.image || "/f1-race.jpg"}
            alt="userimage"
            width={400}
            height={400}
            className="h-40 w-40 object-cover rounded-full"
          />
          <div className="flex flex-col justify-center items-start gap-2 w-full">
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center gap-2 font-medium font-inter text-sm">
                <FaUser /> Username :
              </div>
              <div className="font-medium font-inter p-2.5 rounded-full bg-base-200 w-full border border-base-content/10 text-sm px-4">
                {naOr(user?.name)}
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center gap-2 font-medium font-inter text-sm">
                <MdEmail /> Email :
              </div>
              <div className="font-medium font-inter p-2.5 rounded-full bg-base-200 w-full border border-base-content/10 text-sm px-4">
                {naOr(user?.email)}
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
            <div className="flex items-center gap-2 font-medium font-inter text-sm">
              <HiCalendarDateRange /> Created At :
            </div>
            <div className="font-medium font-inter p-2.5 rounded-full bg-base-200 w-full border border-base-content/10 text-sm px-4">
              {user?.createdAt ? new Date(user.createdAt).toLocaleString() : "N/A"}
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center gap-2 font-medium font-inter text-sm">
              <SiReactivex /> Status :
            </div>
            <div className="font-medium font-inter p-2.5 rounded-full bg-base-200 w-full border border-base-content/10 text-sm px-4 text-success">
              Active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}