interface FormHeaderProps {
  titulo: string;
  descripcion?: string;
}

export function FormHeader({ titulo, descripcion }: FormHeaderProps) {
  return (
    <div className="space-y-5">
      <h2 className="font-merriweather text-xl font-bold sm:text-[24px]">{titulo}</h2>
      <p className="font-merriweather text-justify text-sm font-medium sm:text-[16px]">{descripcion}</p>
    </div>
  );
}
