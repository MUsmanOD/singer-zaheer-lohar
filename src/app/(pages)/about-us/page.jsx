import { ComingSoon } from "@/components/coming-soon";

export const metadata = {
  title: "About",
  description: "Learn about Zaheer Lohar and the feeling behind the music.",
};

export default function AboutPage() {
  return (
    <main className="inner-page">
      <ComingSoon level="h1" />
    </main>
  );
}
