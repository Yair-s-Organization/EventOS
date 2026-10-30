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

@Entity({ name: 'evento' }) 
export class EventoEntity implements Evento {
  @PrimaryGeneratedColumn({ name: 'idEvento', type: 'int' })
  idEvento: number;

  @Column({ name: 'nombre', type: 'varchar', length: 150 })
  nombre: string;

  @Column({ name: 'descripcion', type: 'varchar', length: 500 })
  descripcion: string;

  @Column({ name: 'poster', type: 'text' })
  poster: string;

  @Column({ name: 'justificacion', type: 'text' })
  justificacion: string;

  @Column({
    name: 'esUrgente',
    type: 'boolean',
    default: false,
  })
  esUrgente: boolean;

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