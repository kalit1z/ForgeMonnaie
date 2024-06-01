import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";

const Header = () => {
    return (
        <nav className="flex items-center justify-between px-6 py-4 bg-white text-black">
            <div className="flex-grow">
                <Link href="/"><Image src="/logo.svg" width={250} height={70} alt="Logo" /></Link>
            </div>
            <div className="flex-grow flex justify-center space-x-44 hidden xl:flex">
                <Link href="/add" className="text-xl font-bold">Crée Token</Link>
                <Link href="/get" className="text-xl font-bold">Mes Tokens</Link>
            </div>
            <div className="flex-grow flex justify-end">
                <ConnectButton showBalance={false} />
            </div>
        </nav>
    );
}

export default Header;
