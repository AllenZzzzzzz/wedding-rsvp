import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Allen & Yoon | 2027',
  description: "You're invited to our wedding banquet.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,500&family=Jost:wght@400;500;600&family=Cinzel:wght@400;500&family=Lato:wght@400;700&family=Pinyon+Script&family=Great+Vibes&family=Alex+Brush&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
