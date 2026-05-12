import Link from 'next/link';
import Image from 'next/image';

export function AppLogo() {
  return (
    <Link href="/" className="flex items-center text-white">
      <Image
        src="/pearson-logo.svg"
        alt="Pearson"
        width={119}
        height={24}
        priority
      />
    </Link>
  );
}
