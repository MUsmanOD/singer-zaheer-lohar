import { MotionRuntime } from "@/components/motion-runtime";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { VisitorTracker } from "@/components/visitor-tracker";
import { StructuredData } from "@/components/seo/structured-data";

export default function SiteLayout({ children }) {
  return (
    <MotionRuntime>
      <VisitorTracker />
      <StructuredData />
      <SiteHeader />
      {children}
      <SiteFooter />
    </MotionRuntime>
  );
}
