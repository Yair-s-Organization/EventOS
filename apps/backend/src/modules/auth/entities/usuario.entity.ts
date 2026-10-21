import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { EstadoVerificacion, TipoCuentaUsuario, type Usuario } from '@eventos/shared';

@Entity({ name: 'usuarios' })
export class UsuarioEntity implements Usuario {
  @PrimaryGeneratedColumn({ name: 'idUsuario' })
  idUsuario: number;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  nombre: string;

  @Column({ name: 'apP', type: 'varchar', length: 50 })
  apP: string;

  @Column({ name: 'apM', type: 'varchar', length: 50, nullable: true })
  apM: string | null;

  @Column({ name: 'correo', type: 'varchar', length: 254, unique: true })
  correo: string;

  @Column({ name: 'contrasena', type: 'varchar', length: 255 })
  contrasena: string;

  @Column({ name: 'estatus', type: 'boolean', default: true })
  estatus: boolean;

  @Column({
    name: 'esVerificado',
    type: 'varchar',
    length: 15,
    default: EstadoVerificacion.NO_VERIFICADO,
  })
  esVerificado: EstadoVerificacion;

  @Column({
    name: 'tipoCuenta',
    type: 'varchar',
    length: 20,
    default: TipoCuentaUsuario.ASISTENTE,
  })
  tipoCuenta: TipoCuentaUsuario;

  @Column({ name: 'esJefeAcademia', type: 'boolean', default: false })
  esJefeAcademia: boolean;

  @Column({ name: 'intentosFallidos', type: 'int', default: 0 })
  intentosFallidos: number;

  @Column({ name: 'bloqueadoHasta', type: 'timestamp', nullable: true })
  bloqueadoHasta: Date | null;
}