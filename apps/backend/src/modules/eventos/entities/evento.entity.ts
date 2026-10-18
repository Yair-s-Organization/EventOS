import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import type { Evento } from '@eventos/shared';
import { AlcanceEvento, EstadoEvento } from '@eventos/shared';
import { SubEventoEntity } from './subevento.entity';

@Entity({ name: 'eventos' })
export class EventoEntity implements Evento {
  @PrimaryGeneratedColumn({ name: 'idEvento' })
  idEvento: number;

  @Column({ name: 'nombre', type: 'varchar', length: 200 })
  nombre: string;

  @Column({ name: 'descripcion', type: 'text' })
  descripcion: string;

  @Column({ name: 'poster', type: 'varchar', length: 500, nullable: true })
  poster?: string | null;

  @Column({ name: 'justificacion', type: 'text', nullable: true })
  justificacion: string;

  @Column({ name: 'idOrganizador', type: 'int' })
  idOrganizador: number;

  @Column({
    name: 'idAlcance',
    type: 'int',
    default: AlcanceEvento.PUBLICO,
  })
  idAlcance?: AlcanceEvento;

  @Column({
    name: 'idEstadoEvento',
    type: 'int',
    default: EstadoEvento.ENPROCESO,
  })
  idEstadoEvento?: EstadoEvento;

  // ==========================================
  // RELACIÓN 1..N con SubEventos
  // ==========================================
  @OneToMany(() => SubEventoEntity, (subEvento) => subEvento.evento, {
    cascade: true,
  })
  subEventos?: Relation<SubEventoEntity[]>;
}
