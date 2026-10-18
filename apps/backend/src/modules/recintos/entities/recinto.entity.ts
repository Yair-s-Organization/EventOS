import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { Recinto } from '@eventos/shared';

@Entity({ name: 'recintos' })
export class RecintoEntity implements Recinto {
  @PrimaryGeneratedColumn({ name: 'idRecinto' })
  idRecinto: number;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  nombre: string;

  @Column({ name: 'computadorasDisponibles', type: 'int', default: 0 })
  computadorasDisponibles: number;

  @Column({ name: 'idEstadoRecinto', type: 'int', default: 1 })
  idEstadoRecinto: number;
}