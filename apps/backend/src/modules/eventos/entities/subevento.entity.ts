import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import type { SubEvento } from '@eventos/shared';
import { EstadoSubEvento } from '@eventos/shared';
import { EventoEntity } from './evento.entity';
import { FechaEntity } from './fecha.entity';
import { RecintoEntity } from '../../recintos/entities/recinto.entity';

@Entity({ name: 'subEvento' })
export class SubEventoEntity implements SubEvento {
  @PrimaryGeneratedColumn({ name: 'idSubEvento' })
  idSubEvento: number;

  @Column({ name: 'nombre', type: 'varchar', length: 150 })
  nombre: string;

  @Column({ name: 'descripcion', type: 'varchar', length: 500 })
  descripcion: string;

  @Column({ name: 'idEvento', type: 'int' })
  idEvento: number;

  @Column({ name: 'idRecinto', type: 'int' })
  idRecinto: number;

  @Column({ name: 'idFecha', type: 'int' })
  idFecha: number;

  @Column({ name: 'accesoQR', type: 'boolean', default: false })
  accesoQR: boolean;

  @Column({
      name: 'estado',
      type: 'varchar',
      length: 50,
      default: EstadoSubEvento.ACEPTADO,
    })
    estado: EstadoSubEvento;

  // ==========================================
  // RELACIONES (Foreign Keys)
  // ==========================================

  @ManyToOne(() => EventoEntity, (evento) => evento.subEventos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'idEvento' })
  evento?: Relation<EventoEntity>;

  @ManyToOne(() => RecintoEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'idRecinto' })
  recinto?: Relation<RecintoEntity>;

  @ManyToOne(() => FechaEntity, (fecha) => fecha.subEventos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'idFecha' })
  fecha?: Relation<FechaEntity>;
}
