import { Metadata } from "next";
import AnalyticsClient from "./AnalyticsClient";

export const metadata: Metadata = {
  title: "Statistik",
};

export default function Page() {
  return <AnalyticsClient />;
}
