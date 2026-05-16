// app/layout.tsx
import "~/styles/global.css";
import { ToastProvider } from "~/resources/ToastProvider";
import { CopyBoardProvider } from "~/resources/CopyBoard";
export const Metadata = {
  title: "Plataforma YSSM",
  description: "Generada con Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ToastProvider>
          <CopyBoardProvider>{children}</CopyBoardProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
