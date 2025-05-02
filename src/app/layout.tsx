"use client";

import "./globals.css";
import Image from "next/image";
import { useState } from "react";
import { Dialog } from "@headlessui/react";

export default function RootLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setIsOpen(true);
  };

  return (
    <html lang="pt">
      <body>
        {/* Header com logo e informações */}
        <header className="flex items-center justify-between p-4 w-full">
          {/* Logo à esquerda */}
          <Image
            src="/PNG 2.png"
            alt="Logo"
            width={120}
            height={120}
            className="max-w-full h-auto object-contain"
            priority
          />

          {/* Informações à direita */}
          <div className="text-right font-poppins text-[#023013] max-w-lg leading-relaxed">
            <p className="font-bold text-lg">Maik Silva</p>
            <p>Nutricionista esportivo e clínico - CRN4 22101458</p>
            <p>Telefone: (22) 99281-5628 / Instagram: @nutri.maiksilva</p>
            <p>
              Rua Lourival Franco de Oliveira N° 90, Jardim Esperança, Cabo Frio,{" "}
              <span className="whitespace-nowrap">RJ.</span>
            </p>
          </div>
        </header>

        {/* Título centralizado */}
        <div className="text-center text-[#094e22] font-bold text-2xl my-4">
          Substituição de Alimentos
        </div>

        {children}

        {/* Modal de Alerta */}
        <Dialog
          open={isOpen}
          onClose={() => setIsOpen(false)}
          className="fixed inset-0 flex items-center justify-center z-50"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
          <Dialog.Panel className="bg-white rounded-lg p-6 shadow-xl max-w-sm text-center relative z-10">
            <Dialog.Title className="text-lg font-bold text-red-600">
              Atenção!
            </Dialog.Title>
            <p className="text-gray-700 mt-2">{alertMessage}</p>
            <button
              onClick={() => setIsOpen(false)}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              Entendi
            </button>
          </Dialog.Panel>
        </Dialog>
      </body>
    </html>
  );
}
