import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { BitacoraEvento } from '@eventos/shared';
import { EstadoEvento } from '@eventos/shared';

@Entity({ name: 'bitacoraEvento' })
export class BitacoraEventoEntity implements BitacoraEvento {
  @PrimaryGeneratedColumn({ name: 'idBitacoraEvento' })
  idBitacoraEvento: number;

  @Column({ name: 'idEvento', type: 'int' })
  idEvento: number;

  @Column({ name: 'idSubEvento', type: 'int' })
  idSubEvento: number;

  @Column({ name: 'idUsuarioActor', type: 'int', nullable: true })
  idUsuarioActor?: number | null;

  @Column({ name: 'idEstadoEvento', type: 'int' })
  idEstadoEvento: EstadoEvento;

  @CreateDateColumn({ name: 'fechaHoraCambio', type: 'timestamp' })
  fechaHoraCambio: string;
}
