import { useState } from "react";

export interface QRDisplayProps {
  imageUrl?: string | null;
  isUsable?: boolean;
  unavailableMessage?: string;
}

export function QRDisplay({
                            imageUrl,
                            isUsable = true,
                            unavailableMessage = "Código QR no disponible.",
                          }: QRDisplayProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const showQr =
    isUsable &&
    Boolean(imageUrl) &&
    imageUrl !== failedUrl;

  return (
    <section
      aria-label="Código QR del boleto"
      className="flex flex-col items-center gap-3"
    >
      <div className="flex h-64 w-64 items-center justify-center rounded-lg border border-secondary bg-white p-4">
        {showQr ? (
          <img
            src={imageUrl!}
            alt="Código QR de acceso al evento"
            className="h-full w-full object-contain"
            onError={() => setFailedUrl(imageUrl ?? null)}
          />
        ) : (
          <p role="status" className="text-center text-sm text-gray-600">
            {unavailableMessage}
          </p>
        )}
      </div>
    </section>
  );
}

export default QRDisplay;
