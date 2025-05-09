"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();




  // Conditional styles: overlay on home, normal elsewhere
  const navClass =
    pathname === "/"
      ? "absolute top-0 left-0 w-full flex items-center justify-between px-6 md:px-12 py-4 z-20 bg-transparent"
      : "relative w-full flex items-center justify-between px-6 md:px-12 py-4 bg-white shadow";

  // Navigation links (uniform purple style)
  const navLinks = (
    <>
      <Link
        href="/tournament"
        className="text-white md:text-purple-800 hover:text-white md:hover:text-purple-900 font-semibold"
        onClick={() => setMenuOpen(false)}
      >
        Tournament
      </Link>
      <Link
        href="/rules"
        className="text-white md:text-purple-700 hover:text-white md:hover:text-purple-900 font-semibold"
        onClick={() => setMenuOpen(false)}
      >
        Rules
      </Link>
      <Link
        href="/login"
        className="text-white md:text-purple-700 hover:text-white md:hover:text-purple-900 font-semibold"
        onClick={() => setMenuOpen(false)}
      >
        Login
      </Link>
      <Link
        href="/register"
        className="text-white md:text-purple-700 hover:text-white md:hover:text-purple-900 font-semibold"
        onClick={() => setMenuOpen(false)}
      >
        Register
      </Link>
    </>
  );

  return (
    <nav className={navClass}>
      {/* Logo (always visible) */}
      <div className="flex items-center">
        <Link href="/">
          <Image
            src="/BDC_logo.svg"
            alt="Bergenfield Dominoes Tournament Logo"
            width={60}
            height={40}
            className="block md:hidden"
          />
          <Image
            src="/BDC_logo.svg"
            alt="Bergenfield Dominoes Tournament Logo"
            width={90}
            height={50}
            className="hidden md:block"
          />
        </Link>
      </div>

      {/* Desktop Nav */}
      <div className="hidden md:flex space-x-6 items-center">{navLinks}</div>

      {/* Hamburger Button */}
      <button
        className="md:hidden flex flex-col justify-center items-center w-10 h-10 display-hidden focus:outline-none z-30"
        aria-label="Open Menu"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span
          className={`block w-7 h-1 bg-purple-500 rounded transition-all duration-300 ${
            menuOpen ? "rotate-45 translate-y-2  -bg-gray-800" : ""
          }`}
        ></span>
        <span
          className={`block w-5 h-1 bg-purple-500 rounded mt-1.5 transition-all duration-300 ${
            menuOpen ? "opacity-0" : ""
          }`}
        ></span>
        <span
          className={`block w-7 h-1 bg-purple-500 rounded mt-1.5 transition-all duration-300 ${
            menuOpen ? "-rotate-45 -translate-y-2 " : ""
          }`}
        ></span>
      </button>

      {/* Mobile Slide-in Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-purple-800 bg-opacity-80 backdrop-blur shadow-lg z-20 transform transition-transform duration-300 ease-in-out
        ${menuOpen ? "translate-x-0" : "translate-x-full"}
        flex flex-col`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <Link href="/" onClick={() => setMenuOpen(false)}>
            <Image
              src="/BDC_logo.svg"
              alt="Bergenfield Dominoes Tournament Logo"
              width={60}
              height={40}
            />
          </Link>
          <button
            className="hidden md:block text-2xl font-bold text-gray-700 focus:outline-none"
            onClick={() => setMenuOpen(false)}
            aria-label="Close Menu"
          >
            ×
          </button>
        </div>
        <div className="flex flex-col space-y-6 px-6 py-8 text-lg">
          {navLinks}
        </div>
      </div>

      {/* Overlay when menu is open */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-10 "
          onClick={() => setMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;

// import Link from "next/link";
// import Image from "next/image";
// import { useState, useEffect } from "react";
// import { usePathname } from "next/navigation";
// import { auth } from "@/lib/firebase";
// import { onAuthStateChanged, signOut } from "firebase/auth";

// const Navbar = () => {
//   const [user, setUser] = useState(null);
//   const [menuOpen, setMenuOpen] = useState(false);
//   const pathname = usePathname();

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
//     });
//     return () => unsubscribe();
//   }, []);

//   const handleLogout = async () => {
//     try {
//       await signOut(auth);
//     } catch (error) {
//       console.error("Error signing out:", error);
//     }
//   };

//   // Conditional styles: overlay on home, normal elsewhere
//   const navClass =
//     pathname === "/"
//       ? "absolute top-0 left-0 w-full flex items-center justify-between px-4 md:px-8 py-4 z-20 bg-transparent"
//       : "relative w-full flex items-center justify-between px-4 md:px-8 py-4 bg-white shadow";

//   // Navigation links (for reuse)
//   const navLinks = (
//     <>
//       <Link
//         href="/tournament"
//         className="text-white hover:text-secondary font-semibold transition-colors duration-200"
//         onClick={() => setMenuOpen(false)}
//       >
//         Tournament
//       </Link>
//       {user === null ? (
//         <>
//           <Link
//             href="/login"
//             className="text-white hover:text-secondary font-semibold transition-colors duration-200"
//             onClick={() => setMenuOpen(false)}
//           >
//             Login
//           </Link>
//           <Link
//             href="/register"
//             className="text-white hover:text-secondary font-semibold transition-colors duration-200"
//             onClick={() => setMenuOpen(false)}
//           >
//             Register
//           </Link>
//         </>
//       ) : (
//         <>
//           <Link
//             href="/dashboard"
//             className="text-white hover:text-secondary font-semibold transition-colors duration-200"
//             onClick={() => setMenuOpen(false)}
//           >
//             Dashboard
//           </Link>
//           <button onClick={handleLogout} className="text-white hover:text-secondary font-semibold transition-colors duration-200">
//             Logout
//           </button>
//         </>
//       )}
//     </>
//   );

//   return (
//     <nav className={navClass}>
//       {/* Logo (always visible) */}
//       <div className="flex items-center">
//         <Link href="/">
//           <Image
//             src="/BDC_logo.svg"
//             alt="Bergenfield Dominoes Tournament Logo"
//             width={60}
//             height={40}
//             className="block md:hidden"
//           />
//           <Image
//             src="/BDC_logo.svg"
//             alt="Bergenfield Dominoes Tournament Logo"
//             width={90}
//             height={50}
//             className="hidden md:block"
//           />
//         </Link>
//       </div>

//       {/* Desktop Nav */}
//       <div className="hidden md:flex space-x-6 items-center">{navLinks}</div>

//       {/* Hamburger Button */}
//       <button
//         className="md:hidden flex flex-col justify-center items-center w-10 h-10 focus:outline-none z-30"
//         aria-label="Open Menu"
//         onClick={() => setMenuOpen((open) => !open)}
//       >
//         <span
//           className={`block w-7 h-1 bg-gray-800 rounded transition-all duration-300 ${
//             menuOpen ? "rotate-45 translate-y-2  -bg-gray-800" : ""
//           }`}
//         ></span>
//         <span
//           className={`block w-7 h-1 bg-gray-800 rounded mt-1.5 transition-all duration-300 ${
//             menuOpen ? "opacity-0" : ""
//           }`}
//         ></span>
//         <span
//           className={`block w-7 h-1 bg-gray-800 rounded mt-1.5 transition-all duration-300 ${
//             menuOpen ? "-rotate-45 -translate-y-2 " : ""
//           }`}
//         ></span>
//       </button>

//       {/* Mobile Slide-in Menu */}
//       <div
//         className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-20 transform transition-transform duration-300 ease-in-out
//         ${menuOpen ? "translate-x-0" : "translate-x-full"}
//         flex flex-col`}
//       >
//         <div className="flex items-center justify-between px-6 py-4 border-b">
//           <Link href="/" onClick={() => setMenuOpen(false)}>
//             <Image
//               src="/BDC_logo.svg"
//               alt="Bergenfield Dominoes Tournament Logo"
//               width={60}
//               height={40}
//             />
//           </Link>
//           <button
//             className="text-2xl font-bold text-gray-700 focus:outline-none"
//             onClick={() => setMenuOpen(false)}
//             aria-label="Close Menu"
//           >
//             ×
//           </button>
//         </div>
//         <div className="flex flex-col space-y-6 px-6 py-8 text-lg">
//           {navLinks}
//         </div>
//       </div>

//       {/* Overlay when menu is open */}
//       {menuOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-30 z-10 "
//           onClick={() => setMenuOpen(false)}
//         />
//       )}
//     </nav>
//   );
// };

// export default Navbar;
