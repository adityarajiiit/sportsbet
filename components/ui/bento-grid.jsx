import { cn } from "@/lib/utils";
import Image from "next/image";
export const BentoGrid = ({ className, children }) => {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-full grid-cols-1 gap-4 auto-rows-[12.1rem] md:grid-cols-5",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  image,
}) => {
  return (
    <div
      className={cn(
        "group/bento row-span-1 flex flex-col justify-between space-y-4 rounded-xl border transition duration-200 hover:shadow-xl border-white/[0.2] bg-black shadow-base-content/10 relative",
        className,
      )}
    >
      <Image
        src={image}
        alt="image"
        className="absolute left-0 rounded-xl top-0 w-full h-[12rem] object-cover"
      />
      {header}
      <div className="relative bg-gradient-to-r from-black/80 via-black/50 to-transparent p-5 w-full h-full rounded-xl flex flex-col">
        <div className="flex flex-col justify-between h-full">
          <div className="flex flex-col justify-between transition duration-200 group-hover/bento:translate-x-2 h-full">
            <p>{icon}</p>
            <div className="mt-2 font-inter font-semibold text-sm text-neutral-200">
              {title}
              <span className="font-poppins font-bold text-4xl font-normaltext-neutral-300 mt-2 line-clamp-1">
                {description}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
