import { signOutAction } from "@/lib/signout-action";
import { LogOut } from "lucide-react";
import { Button } from "./ui/button";

export function SignOut() {
  return (
    <form
      action={signOutAction}
    >
      <Button variant="outline">
        <LogOut className="h-4 w-4" />
      </Button>
    </form>
  );
}
