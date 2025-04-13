"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { ArrowRight, Book, Users, Check } from "lucide-react";
import Image from "next/image";
import { useAuthStore } from "@/store/auth-store";

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <>
      <section className='bg-primary/5 py-16 md:py-24'>
        <Container>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-12 items-center'>
            <div className='space-y-6'>
              <h1 className='text-4xl md:text-5xl font-extrabold tracking-tight'>
                Share Books,{" "}
                <span className='text-primary'>Build Community</span>
              </h1>
              <p className='text-lg text-muted-foreground max-w-[600px]'>
                Connect with local book lovers to share, exchange, and discover
                new books. Save money and reduce waste while expanding your
                reading horizons.
              </p>
              <div className='flex flex-col sm:flex-row gap-4'>
                {!isAuthenticated && (
                  <Button size='lg' asChild>
                    <Link href='/signup'>
                      Get Started <ArrowRight className='ml-2 h-4 w-4' />
                    </Link>
                  </Button>
                )}
                <Button size='lg' variant='outline' asChild>
                  <Link href='/books'>
                    Browse Books
                    <ArrowRight className='ml-2 h-4 w-4' />
                  </Link>
                </Button>
              </div>
            </div>
            <div className='hidden md:block bg-slate-800 h-[400px] rounded-lg'>
              <div className='flex items-center justify-center h-full text-white relative'>
                <Image
                  src='/main-image2.png'
                  alt='Some alt text'
                  fill
                  className='object-cover'
                  priority
                  sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className='py-16 md:py-24'>
        <Container>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold tracking-tight mb-4'>
              How It Works
            </h2>
            <p className='text-muted-foreground max-w-2xl mx-auto'>
              Our simple three-step process makes finding and sharing books easy
              and enjoyable.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mt-8'>
            {/* Step 1 */}
            <div className='border rounded-lg p-6 text-center'>
              <div className='bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Book className='h-6 w-6 text-primary' />
              </div>
              <h3 className='text-xl font-bold mb-2'>List or Search</h3>
              <p className='text-muted-foreground'>
                Either list books you&apos;re willing to share or search for
                books you&apos;d like to read.
              </p>
            </div>

            <div className='border rounded-lg p-6 text-center'>
              <div className='bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Users className='h-6 w-6 text-primary' />
              </div>
              <h3 className='text-xl font-bold mb-2'>Connect</h3>
              <p className='text-muted-foreground'>
                Message book owners directly and arrange a convenient exchange.
              </p>
            </div>

            <div className='border rounded-lg p-6 text-center'>
              <div className='bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Check className='h-6 w-6 text-primary' />
              </div>
              <h3 className='text-xl font-bold mb-2'>Enjoy</h3>
              <p className='text-muted-foreground'>
                Meet up, exchange books, and enjoy your new reading material.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className='bg-primary/5 py-16 md:py-24'>
        <Container>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold tracking-tight mb-4'>
              Why Choose BookBarter?
            </h2>
            <p className='text-muted-foreground max-w-2xl mx-auto'>
              Our platform offers unique benefits for book lovers of all kinds.
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
            <div className='bg-background rounded-lg p-6 shadow-sm'>
              <h3 className='text-xl font-semibold mb-2'>Save Money</h3>
              <p className='text-muted-foreground'>
                Exchange books for free instead of buying new ones, saving money
                on your reading habit.
              </p>
            </div>

            <div className='bg-background rounded-lg p-6 shadow-sm'>
              <h3 className='text-xl font-semibold mb-2'>Reduce Waste</h3>
              <p className='text-muted-foreground'>
                Give books a second life and reduce environmental impact by
                sharing instead of discarding.
              </p>
            </div>

            <div className='bg-background rounded-lg p-6 shadow-sm'>
              <h3 className='text-xl font-semibold mb-2'>Discover New Reads</h3>
              <p className='text-muted-foreground'>
                Find unexpected gems and expand your reading horizons with books
                from other readers.
              </p>
            </div>

            <div className='bg-background rounded-lg p-6 shadow-sm'>
              <h3 className='text-xl font-semibold mb-2'>Build Community</h3>
              <p className='text-muted-foreground'>
                Connect with fellow book lovers in your area and build a
                community around shared interests.
              </p>
            </div>

            <div className='bg-background rounded-lg p-6 shadow-sm'>
              <h3 className='text-xl font-semibold mb-2'>Simple & Secure</h3>
              <p className='text-muted-foreground'>
                Our platform makes it easy and safe to connect with other
                readers.
              </p>
            </div>

            <div className='bg-background rounded-lg p-6 shadow-sm'>
              <h3 className='text-xl font-semibold mb-2'>Declutter</h3>
              <p className='text-muted-foreground'>
                Make space on your shelves by sharing books you&apos;ve already
                read and enjoyed.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {!isAuthenticated && (
        <section className='py-16 md:py-24'>
          <Container>
            <div className='bg-primary/10 rounded-lg p-8 md:p-12 text-center'>
              <h2 className='text-3xl font-bold mb-4'>
                Ready to Join Our Community?
              </h2>
              <p className='text-lg text-muted-foreground max-w-2xl mx-auto mb-8'>
                Sign up today and start sharing books with fellow readers in
                your area. It&apos;s free, simple, and good for your bookshelf
                and the planet.
              </p>
              <Button size='lg' asChild>
                <Link href='/signup'>
                  Create Your Account
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Link>
              </Button>
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
