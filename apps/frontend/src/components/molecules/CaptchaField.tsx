import React from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { FieldMessage } from "../atoms/FieldMessage/FieldMessage";

interface CaptchaFieldProps {
  sitekey: string;
  onChange: (token: string | null) => void;
  error?: string;
  recaptchaRef?: React.RefObject<ReCAPTCHA | null>;
}

export function CaptchaField({
  sitekey,
  onChange,
  error,
  recaptchaRef,
}: CaptchaFieldProps) {
  return (
    <div className="flex flex-col items-center space-y-2 my-2">
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={sitekey}
        onChange={onChange}
      />
      {error && (
        <FieldMessage variant="error" className="text-center">
          {error}
        </FieldMessage>
      )}
    </div>
  );
}