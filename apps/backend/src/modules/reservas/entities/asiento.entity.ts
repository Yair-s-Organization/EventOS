import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { Asiento } from '@eventos/shared';

@Entity({ name: 'asiento' })
export class AsientoEntity implements Asiento {
  @PrimaryGeneratedColumn({ name: 'idAsiento' })
  idAsiento: number;

  @Column({ name: 'fila', type: 'varchar', length: 10 })
  fila: string;

  @Column({ name: 'numero', type: 'int' })
  numero: number;

  @Column({ name: 'idRecinto', type: 'int' })
  idRecinto: number;
}