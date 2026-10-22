import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { Recinto } from '@eventos/shared';

@Entity({ name: 'recinto' })
export class RecintoEntity implements Recinto {
  @PrimaryGeneratedColumn({ name: 'idRecinto', type: 'int' })
  idRecinto: number;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  nombre: string;

  @Column({ name: 'aforo', type: 'int', default: 0 })
  aforo: number;

  @Column({ name: 'computadorasDisponibles', type: 'int', nullable: true })
  computadorasDisponibles?: number;

  @Column({ name: 'idEstadoRecinto', type: 'int', default: 1 })
  idEstadoRecinto: number;
}