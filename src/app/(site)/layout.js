import { MotionRuntime } from "@/components/motion-runtime";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { VisitorTracker } from "@/components/visitor-tracker";

export default function SiteLayout({ children }) {
  return (
    <MotionRuntime>
      <VisitorTracker />
      <SiteHeader />
      {children}
      <SiteFooter />
    </MotionRuntime>
  );
}
