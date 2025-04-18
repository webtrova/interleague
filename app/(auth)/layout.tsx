export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/95.jpg"
          alt="background texture"
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 opacity-50"></div>
      </div>
      {/* Content (card) */}
      <div className="relative z-10 max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        {children}
      </div>
    </div>
  );
}
