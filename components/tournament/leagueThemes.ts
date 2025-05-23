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
    tableLabel: string;
  }
> = {
  MLB: {
    bg: "bg-[#092668]",
    border: "border-[#092668]",
    tableLabel: "bg-white border-[#092668] text-[#092668]",
    winner: "bg-blue-50 text-[#092668]",
    loser: "bg-red-50 text-red-700",
    championship: "bg-purple-50 text-purple-700",
    button: "bg-[#f0f0f0] text-black",
    buttonHover: "hover:bg-[#9e9e9e]",
    input: "border-[#092668] focus:ring-[#092668]"
  },
  NFL: {
    bg: "bg-[#ffffff]",
    border: "border-[#E0E0E0]",
    tableLabel: "bg-[#092668] border-[#E0E0E0] text-white",
    winner: "bg-[#E0E0E0] text-[#092668] font-size-2xl  font-bold",
    loser: "bg-red-50 text-red-700",
    championship: "bg-purple-50 text-purple-700",
    button: "bg-[#092668] text-white",
    buttonHover: "hover:bg-[#020105] text-white",
    input: "border-[#092668] focus:ring-[#092668]"
  },

  NBA: {
    bg: "bg-[#1d428a]",
    border: "border-[#c8102e]",
    tableLabel: "bg-[#c8102e] border-[#c8102e] text-white",
    winner: "bg-[#ffffff] text-[#1d428a] font-size-2xl  font-bold",
    loser: "bg-red-50 text-red-700",
    championship: "bg-purple-50 text-purple-700",
    button: "bg-white text-[#1d428a]",
    buttonHover: "hover:bg-[#c8102e]",
    input: "border-[#092668] focus:ring-[#092668]"
  },
  default: {
    bg: "bg-gray-400",
    border: "border-gray-500",
    tableLabel: "bg-gray-400 border-gray-500 text-white",
    winner: "bg-gray-50 text-gray-700",
    loser: "bg-gray-100 text-gray-500",
    championship: "bg-gray-200 text-gray-800",
    button: "bg-[#092668] text-white",
    buttonHover: "hover:bg-[#020105]",
    input: "border-[#092668] focus:ring-[#092668]"
  }
};
