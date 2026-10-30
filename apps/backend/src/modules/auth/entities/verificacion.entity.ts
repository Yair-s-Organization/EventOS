import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { Verificacion } from '@eventos/shared';

@Entity({ name: 'verificacion' })
export class VerificacionEntity implements Verificacion {
  @PrimaryGeneratedColumn({ name: 'idVerificacion' })
  idVerificacion: number;

  @Column({ name: 'informacionAdicional', type: 'varchar', length: 500 })
  informacionAdicional: string;

  @Column({ name: 'archivo', type: 'text' })
  archivo: string;

  @CreateDateColumn({ name: 'fecha', type: 'timestamp' })
  fecha: string;

  @Column({ name: 'idRol', type: 'int' })
  idRol: number;

  @Column({ name: 'idUsuario', type: 'int' })
  idUsuario: number;
}
