import { 
  Inter as FontSans,
  Montserrat as FontHeading,
  JetBrains_Mono as FontMono
} from 'next/font/google'

export const fontSans = FontSans({ 
  subsets: ['latin'],
  variable: '--font-sans',
})

export const fontHeading = FontHeading({
  subsets: ['latin'],
  variable: '--font-heading',
})

export const fontMono = FontMono({
  subsets: ['latin'],
  variable: '--font-mono',
})