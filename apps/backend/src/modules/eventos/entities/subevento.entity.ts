import { randomUUID } from 'crypto';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import type { SubEvento } from '@eventos/shared';
import { EstadoSubEvento, ModalidadAcceso } from '@eventos/shared';
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

  @Column({ name: 'cupoMaximo', type: 'int', nullable: true, default: null })
  cupoMaximo?: number | null;

  @Column({ name: 'idEvento', type: 'int' })
  idEvento: number;

  @Column({ name: 'idRecinto', type: 'int' })
  idRecinto: number;

  @Column({ name: 'idFecha', type: 'int' })
  idFecha: number;

  @Column({
    name: 'idModalidadAcceso',
    type: 'int',
    default: ModalidadAcceso.ACCESO_LIBRE,
  })
  idModalidadAcceso: ModalidadAcceso;

  @Column({
    name: 'estado',
    type: 'varchar',
    length: 50,
    default: EstadoSubEvento.ACEPTADO,
  })
  estado: EstadoSubEvento;

  @Column({ name: 'tokenInvitacion', type: 'varchar', length: 64, unique: true })
  tokenInvitacion: string;

  @Column({ name: 'enlaceInvitacionActivo', type: 'boolean', default: false })
  enlaceInvitacionActivo: boolean;

  @BeforeInsert()
  asignarTokenInvitacion(): void {
    if (!this.tokenInvitacion) {
      this.tokenInvitacion = randomUUID();
    }
  }

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
