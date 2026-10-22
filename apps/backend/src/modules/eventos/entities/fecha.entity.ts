import { Column, Entity, OneToMany, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import type { Fecha } from '@eventos/shared';
import { SubEventoEntity } from './subevento.entity';

@Entity({ name: 'fecha' })
export class FechaEntity implements Fecha {
  @PrimaryGeneratedColumn({ name: 'idFecha', type: 'int' })
  idFecha: number;

  @Column({ name: 'fecha', type: 'date' })
  fecha: string;

  @Column({ name: 'horaInicio', type: 'time' })
  horaInicio: string;

  @Column({ name: 'horaFin', type: 'time' })
  horaFin: string;

  @OneToMany(() => SubEventoEntity, (sub) => sub.fecha)
  subEventos?: Relation<SubEventoEntity[]>;
}