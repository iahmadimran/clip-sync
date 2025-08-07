import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation';
import React from 'react'


async function Navbar() {
  const user = await currentUser()

  return (
    <header className='navbar'>
      <nav>
        <Link href='/' >
          <Image src={'/assets/icons/logo.svg'} width={32} height={32} alt='logo' />
          <h1>ClipSync</h1>
        </Link>

        <figure>
          <SignedOut>
            <SignInButton>
              <button className="px-4 py-2 bg-white border border-black rounded-xl">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </figure>
      </nav>
    </header>
  )
}

export default Navbar
