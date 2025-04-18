import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative mt-16">
  {/* Background image */}
  <div className="absolute inset-0 z-0">
    <img
      src="/99.jpg"
      alt="footer background"
      className="w-full h-full object-cover opacity-90"
    />
    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-[#2d044d] opacity-85"></div>
  </div>
  {/* Content */}
  <div className="relative z-10 flex flex-col items-center justify-center px-4 py-12 text-center">
    <Image
      src="/BDC_logo.svg"
      alt="Bergenfield Dominoes Club Logo"
      width={70}
      height={70}
      className="mb-4"
    />
    <h2 className="text-2xl font-bold text-white mb-2">
      Bergenfield Dominoes Club
    </h2>
    <p className="text-white mb-4">
      &copy; {new Date().getFullYear()} All rights reserved.
    </p>
    <div className="flex gap-4 justify-center">
      {/* Example socials or links */}
      <a href="mailto:info@bdc.com" className="text-white hover:text-secondary transition">Contact</a>
      <a href="/tournament" className="text-white hover:text-secondary transition">Tournaments</a>
    </div>
  </div>
</footer>
  );
}