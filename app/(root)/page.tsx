import Header from '@/components/Header'
import VideoCard from '@/components/VideoCard'
import { dummyCards } from '@/constants'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import React from 'react'

const Page = async () => {
  const user = await currentUser()
  console.log(user);
  

  if (!user) {
    redirect('/sign-in')
  }
  return (
    <main className='wrapper page'>
      <Header title='All Videos' subHeader='Public Library' />

      <section className='video-grid'>
        {dummyCards.map((card) => (
          <VideoCard
            key={card.id}
            {...card}
          />
        ))}
      </section>
    </main>
  )
}

export default Page