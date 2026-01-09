interface Theme {
  label: string;
  bg: string;
  text: string;
  button: string;
  header: string;
}

export const THEMES: Record<string, Theme> = {
  "simple-blue": {
    label: "Simple Blue",
    bg: "bg-[#f8faff]",
    text: "text-[#2d3748]",
    button: "bg-white border border-gray-200 shadow-sm hover:border-[#0193ff] hover:text-[#0193ff]",
    header: "text-gray-400"
  },
  "dark": {
    label: "Midnight Pro",
    bg: "bg-gray-950",
    text: "text-white",
    button: "bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-200",
    header: "text-gray-500"
  },
  "ocean-gradient": {
    label: "Ocean Breeze",
    bg: "bg-gradient-to-br from-cyan-500 to-blue-600",
    text: "text-white",
    button: "bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 text-white shadow-lg",
    header: "text-blue-100"
  },
  "sunset": {
    label: "Sunset Vibes",
    bg: "bg-gradient-to-tr from-orange-400 via-pink-500 to-purple-600",
    text: "text-white",
    button: "bg-black/20 backdrop-blur-md border border-white/20 hover:bg-black/30 text-white",
    header: "text-pink-100"
  },
  "cyberpunk": {
    label: "Cyberpunk",
    bg: "bg-black",
    text: "text-yellow-400",
    button: "bg-gray-900 border-l-4 border-l-yellow-400 hover:bg-gray-800 text-cyan-400 font-mono",
    header: "text-purple-500 font-mono"
  },
  "playful": {
    label: "Playful Pop",
    bg: "bg-yellow-50",
    text: "text-gray-900",
    button: "bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-xl",
    header: "text-orange-500 font-black tracking-widest"
  }
};