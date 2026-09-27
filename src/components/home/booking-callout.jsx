import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";

export function BookingCallout() {
  return <section className="home-booking" aria-labelledby="home-booking-title"><div className="page-shell home-booking__inner"><div className="home-booking__icon"><CalendarDays size={21} /></div><div className="home-booking__copy"><p className="eyebrow">For a night worth remembering</p><h2 id="home-booking-title">Bring the music closer.</h2><p>Planning a gathering? Share a few details and the team will help shape a performance for your occasion.</p></div><Link className="home-booking__action" href="/booking">Plan an appearance <ArrowUpRight size={16} /></Link></div></section>;
}
