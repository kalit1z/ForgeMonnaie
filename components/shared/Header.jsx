import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";

const Header = () => {
    return (
        <nav className="navbar">
            <div className="grow">
                <Link href="/"><Image src="logo.svg" width="250" height="70" /></Link>
            </div>
            <div>
                <ConnectButton showBalance={false} />
            </div>
        </nav>
    )
}

export default Header;
