import clientconfig from "../../clientconfig";
import { redirect, RedirectType } from "next/navigation";
import RootLayout, { metadata as defaultMetadata } from "./dashboard/layout";
import Home from "./ui/home";

export const metadata = defaultMetadata;

export default function () {
  if (!clientconfig.mainPageAllowed)
    return redirect("/dashboard", RedirectType.replace);

  // This file will not be edited anymore. Feel free to remove the <Home /> component and write your own!
  return (
    <RootLayout>
      <Home />
    </RootLayout>
  );
}
