import { Button } from "@/components/ui/button";
import { HomeIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import Link from "next/link";

export default function Home() {
  return (
    <div className="home">
      <div className="home_inner p-4 md:p-0"> {/* Added padding for mobile */}
        <h1 className="home_inner_title">
          Votre plateforme décentralisée pour créer des
          <span className="home_inner_title_colored"> tokens</span> en 1 clic 
          <span className="home_inner_title_colored"> même</span> en tant que débutant.
        </h1>
        <p className="home_inner_description">
          ForgeMonnaie te permet de créer, personnaliser et distribuer tes propres jetons sur la blockchain pour une expérience transparente et sécurisée.
        </p>
        <div className="home_inner_links">
          <Link href="add" className="mr-5">
            <Button className="home_inner_links_button1 hover:bg-[#C8B1F4]">
              <HomeIcon className="mr-2" /> Créez votre token
            </Button>
          </Link>
          <Link href="get" className="ml-5">
            <Button className="home_inner_links_button2">
              <EyeOpenIcon className="mr-2" /> Gérez vos tokens
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
