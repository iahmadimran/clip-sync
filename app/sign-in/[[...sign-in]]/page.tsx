"use client";

import { SignIn } from '@clerk/nextjs';
import Image from 'next/image'
import Link from 'next/link'

function Page() {
  return (
    <main className='sign-in'>
      <aside className='testimonial'>
        <Link href={'/'}>
          <Image src={'/assets/icons/logo.svg'} alt='logo' width={32} height={32} />
          <h1>ClipSync</h1>
        </Link>

        <div className='description'>
          <section>
            <figure>
              {Array.from({ length: 5 }).map((_, index) => (
                <Image src={'/assets/icons/star.svg'} alt='star' width={20} height={20} key={index} />
              ))}
            </figure>
            <p>ClipSync makes screen recording process completely easy. From quick walkthroughs to full presentations, it&apos;s fast, smooth, and shareable in seconds.</p>

            <article>
              <Image src={'/assets/images/jason.png'} alt='jason' width={64} height={64} className='rounded-full' />

              <div>
                <h2>David Lance</h2>
                <p>UX Designer, Netflix</p>
              </div>
            </article>
          </section>
        </div>
        <p>© ClipSync {(new Date()).getFullYear()}</p>
      </aside>

      <aside className='google-sign-in'>
        <SignIn
          appearance={{
            variables: {
              fontFamily: "Karla", // Change this to your desired font
            },
          }}
        />
      </aside>

      <div className='overlay' />
    </main>
  )
}

export default Page
