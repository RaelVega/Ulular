import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { MobileBar } from "@/components/site/MobileBar";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { CursorEcho } from "@/components/ui/CursorEcho";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CursorEcho />
      <Header />
      <main>{children}</main>
      <Footer />
      <WhatsAppFloat />
      <MobileBar />
    </>
  );
}
