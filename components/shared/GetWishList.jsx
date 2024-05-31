import { Button } from "@/components/ui/button";

import { HomeIcon, EyeOpenIcon } from "@radix-ui/react-icons";

import Link from "next/link";
const GetWishList = () => {
  return (
    <div><h1>En Construction</h1>
    <Link href="add" className="mr-5">
    <Button className="home_inner_links_button1 hover:bg-[#C8B1F4]">
      <HomeIcon className="mr-2" /> Créez votre token
    </Button>
  </Link></div>
    
  )
}

export default GetWishList