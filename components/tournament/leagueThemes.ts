import { League } from "@/types/tournament";

export const leagueThemes: Record<
  League | string,
  {
    bg: string;
    border: string;
    winner: string;
    loser: string;
    championship: string;
    button: string;
    buttonHover: string;
    input: string;
  }
> = {
  MLB: {
    bg: "bg-[#092668]",
    border: "border-[#092668]",
    winner: "bg-[#092668] text-white",
    loser: "bg-red-50 text-red-700",
    championship: "bg-purple-50 text-purple-700",
    button: "bg-[#f0f0f0] text-black",
    buttonHover: "hover:bg-[#020105]",
    input: "border-[#092668] focus:ring-[#092668]"
  },
  NFL: {
    bg: "bg-[#ffffff]",
    border: "border-[#E0E0E0]",
    winner: "bg-[#ffffff] text-white",
    loser: "bg-red-50 text-red-700",
    championship: "bg-purple-50 text-purple-700",
    button: "bg-[#092668] text-white",
    buttonHover: "hover:bg-[#020105]",
    input: "border-[#092668] focus:ring-[#092668]"
  },
  default: {
    bg: "bg-gray-400",
    border: "border-gray-500",
    winner: "bg-gray-50 text-gray-700",
    loser: "bg-gray-100 text-gray-500",
    championship: "bg-gray-200 text-gray-800",
    button: "bg-[#092668] text-white",
    buttonHover: "hover:bg-[#020105]",
    input: "border-[#092668] focus:ring-[#092668]"
  }
};
