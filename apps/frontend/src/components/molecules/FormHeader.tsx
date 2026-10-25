interface FormHeaderProps {
  titulo: string;
  descripcion?: string;
}

export function FormHeader({ titulo, descripcion }: FormHeaderProps) {
  return (
    <div className="space-y-5">
      <h2 className="font-merriweather font-bold text-[24px]">{titulo}</h2>
      <p className="font-merriweather font-medium text-[16px]">{descripcion}</p>
    </div>
  );
}
