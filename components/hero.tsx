'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import type { Department } from '@/lib/types'

const HERO_BY_DEPARTMENT: Record<
  Department,
  {
    image: string
    alt: string
    eyebrow: string
    title: string
    description: string
  }
> = {
  mujer: {
    image: '/images/hero.png',
    alt: 'Mujer con vestido lencero marfil de la nueva colección Athenea',
    eyebrow: 'Nueva colección — Mujer',
    title: 'Elegancia en cada detalle',
    description:
      'Vestidos, deportivo, corsets, lencería y bikinis seleccionados para realzar tu estilo. Calidad premium, diseño atemporal.',
  },
  hombre: {
    image: '/images/camisa-lino.png',
    alt: 'Hombre con camisa de lino beige de la colección Athenea',
    eyebrow: 'Nueva colección — Hombre',
    title: 'Estilo con carácter',
    description:
      'Camisas, pantalones y deportivo pensados para el día a día. Cortes impecables, tejidos de calidad y un look refinado sin esfuerzo.',
  },
  ninos: {
    image: '/images/conjunto-infantil.png',
    alt: 'Niño con conjunto infantil crema de la colección Athenea',
    eyebrow: 'Nueva colección — Niños',
    title: 'Pequeños con gran estilo',
    description:
      'Ropa infantil suave, cómoda y con personalidad. Prendas pensadas para jugar, crecer y lucir siempre impecables.',
  },
}

interface HeroProps {
  department: Department
  onVerColeccion: () => void
}

export function Hero({ department, onVerColeccion }: HeroProps) {
  const content = HERO_BY_DEPARTMENT[department]

  return (
    <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:px-6 md:py-20">
      <div className="flex flex-col items-start gap-6">
        <p
          key={`eyebrow-${department}`}
          className="animate-in fade-in slide-in-from-bottom-2 duration-500 text-xs uppercase tracking-[0.3em] text-accent"
        >
          {content.eyebrow}
        </p>
        <h1
          key={`title-${department}`}
          className="animate-in fade-in slide-in-from-bottom-2 duration-500 font-serif text-4xl leading-tight text-balance md:text-6xl"
        >
          {content.title}
        </h1>
        <p
          key={`desc-${department}`}
          className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-md leading-relaxed text-muted-foreground text-pretty"
        >
          {content.description}
        </p>
        <Button
          onClick={onVerColeccion}
          className="rounded-none px-6 uppercase tracking-[0.2em]"
        >
          Ver colección
        </Button>
      </div>
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
        <Image
          key={content.image}
          src={content.image}
          alt={content.alt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="animate-in fade-in zoom-in-95 duration-700 object-cover"
        />
      </div>
    </section>
  )
}
