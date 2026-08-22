import './globals.css';

export const metadata = {
  title: 'Clinic Manager',
  description: 'Client & appointment management',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-800 antialiased">{children}</body>
    </html>
  );
}
