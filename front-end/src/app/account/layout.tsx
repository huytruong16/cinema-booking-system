import Navbar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import { AccountNavigation } from "@/components/account/AccountNavigation";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-black">
      <div className="lg:flex min-h-screen text-white">
        <AccountNavigation />
        <main className="flex-1 bg-zinc-950 px-4 pb-4 pt-0 md:px-8 md:pb-8 lg:p-12">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}