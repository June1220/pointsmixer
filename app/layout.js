import "./globals.css";

export const metadata = {
  title: "PointsMixer — Award Flight Transfer Allocation Engine",
  description:
    "You found the award flight. PointsMixer calculates the mathematically optimal way to transfer your credit card points to pay for it.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
