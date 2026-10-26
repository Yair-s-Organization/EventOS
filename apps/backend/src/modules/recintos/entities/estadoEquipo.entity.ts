import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EstadoEquipo } from '@eventos/shared';
import { RecintoEntity } from './recinto.entity';

@Entity({ name: 'estadoEquipo' })
export class EstadoEquipoEntity implements EstadoEquipo {
  @PrimaryGeneratedColumn({ name: 'idEstadoEquipo', type: 'int' })
  idEstadoEquipo: number;

  @Column({ name: 'numeroEquipo', type: 'int' })
  numeroEquipo: number;

  @Column({ name: 'estado', type: 'boolean', default: true })
  estado: boolean;

  @Column({ name: 'idRecinto', type: 'int' })
  idRecinto: number;

  @ManyToOne(() => RecintoEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idRecinto' })
  recinto?: RecintoEntity;
}